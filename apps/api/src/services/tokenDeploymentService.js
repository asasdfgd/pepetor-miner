const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} = require('@solana/web3.js');
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  setAuthority,
  AuthorityType,
  createBurnInstruction,
} = require('@solana/spl-token');
const { Metaplex, keypairIdentity, irysStorage } = require('@metaplex-foundation/js');
const { MarketV2 } = require('@openbook-dex/openbook');
const BN = require('bn.js');
const { Raydium, TxVersion, parseTokenAccountResp } = require('@raydium-io/raydium-sdk-v2');
const fs = require('fs');
const path = require('path');
const bondingCurveService = require('./bondingCurveService');

const DEPLOYMENT_PRICE_SOL = 0.073;
const DEPLOYMENT_PRICE_PEPETOR = 10000;
const TREASURY_WALLET = process.env.TREASURY_WALLET_ADDRESS;

class TokenDeploymentService {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
      'confirmed'
    );
    this.network = process.env.SOLANA_NETWORK || 'mainnet-beta';
    this.solPriceCache = { price: null, timestamp: 0 };
  }

  async fetchSOLPrice() {
    const now = Date.now();
    if (this.solPriceCache.price && (now - this.solPriceCache.timestamp < 60000)) {
      return this.solPriceCache.price;
    }

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      const price = data.solana?.usd || 200;
      
      this.solPriceCache = { price, timestamp: now };
      return price;
    } catch (error) {
      console.error('Failed to fetch SOL price, using fallback:', error);
      return 200;
    }
  }

  async verifyPayment(signature, expectedAmount, paymentMethod = 'SOL') {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        throw new Error('Transaction not found');
      }

      if (!tx.meta || tx.meta.err) {
        throw new Error('Transaction failed');
      }

      if (paymentMethod === 'SOL') {
        const postBalance = tx.meta.postBalances[1];
        const preBalance = tx.meta.preBalances[1];
        const amountReceived = (postBalance - preBalance) / LAMPORTS_PER_SOL;

        if (amountReceived < expectedAmount) {
          throw new Error(`Insufficient payment. Expected ${expectedAmount} SOL, got ${amountReceived} SOL`);
        }
      }

      return true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  async deployCustomToken(config) {
    const {
      tokenName,
      tokenSymbol,
      totalSupply = 1_000_000_000,
      decimals = 9,
      ownerPublicKey,
      allocations = this.getDefaultAllocations(),
      logoBuffer = null,
      description = '',
      createPool = false,
      poolLiquiditySOL = 2,
      website = '',
      twitter = '',
      walletAddress = '',
      useBondingCurve = false,
      bondingCurveInitialMC = 30,
      bondingCurveMigrationMC = 85,
      initialPurchaseAmount = 0,
    } = config;

    console.log(`🚀 Deploying ${tokenName} (${tokenSymbol}) for ${ownerPublicKey}`);

    const deployerPath = path.join(__dirname, '../../.wallets/deployer.json');
    if (!fs.existsSync(deployerPath)) {
      throw new Error('Deployer wallet not found');
    }

    const deployerData = JSON.parse(fs.readFileSync(deployerPath, 'utf-8'));
    const deployer = Keypair.fromSecretKey(new Uint8Array(deployerData));

    const balance = await this.connection.getBalance(deployer.publicKey);
    const requiredBalance = createPool ? (poolLiquiditySOL + 1) * LAMPORTS_PER_SOL : 0.5 * LAMPORTS_PER_SOL;
    if (balance < requiredBalance) {
      throw new Error(`Insufficient SOL in deployer wallet. Need ${requiredBalance / LAMPORTS_PER_SOL} SOL, have ${balance / LAMPORTS_PER_SOL} SOL`);
    }

    console.log('🪙 Creating token mint...');
    const mint = await createMint(
      this.connection,
      deployer,
      deployer.publicKey,
      deployer.publicKey,
      decimals,
      undefined,
      { commitment: 'confirmed' },
      TOKEN_PROGRAM_ID
    );

    console.log('✅ Token Mint:', mint.toString());

    const wallets = {
      treasury: Keypair.generate(),
      rewards: Keypair.generate(),
      liquidity: Keypair.generate(),
      marketing: Keypair.generate(),
    };

    const walletsDir = path.join(__dirname, '../../.custom-tokens', mint.toString());
    if (!fs.existsSync(walletsDir)) {
      fs.mkdirSync(walletsDir, { recursive: true });
    }

    for (const [name, keypair] of Object.entries(wallets)) {
      const walletPath = path.join(walletsDir, `${name}-keypair.json`);
      fs.writeFileSync(
        walletPath,
        JSON.stringify(Array.from(keypair.secretKey))
      );
    }

    console.log('💰 Minting tokens to wallets...');
    for (const [name, keypair] of Object.entries(wallets)) {
      const allocation = allocations[name] || 0;
      const amount = Math.floor((totalSupply * allocation) / 100);

      if (amount > 0) {
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
          this.connection,
          deployer,
          mint,
          keypair.publicKey
        );

        await mintTo(
          this.connection,
          deployer,
          mint,
          tokenAccount.address,
          deployer,
          amount * Math.pow(10, decimals)
        );

        console.log(`  ✅ ${name}: ${amount.toLocaleString()} ${tokenSymbol}`);
      }
    }

    let metadataUri = null;
    if (logoBuffer) {
      console.log('📤 Uploading metadata to Arweave...');
      metadataUri = await this.uploadMetadata({
        mint: mint.toString(),
        tokenName,
        tokenSymbol,
        description,
        logoBuffer,
        deployer,
        totalSupply,
        website,
        twitter,
        walletAddress,
      });
      console.log('✅ Metadata URI:', metadataUri);
    }

    let marketId = null;
    let poolAddress = null;
    let bondingCurvePool = null;
    let bondingCurveConfig = null;
    let tradingUrl = null;

    if (useBondingCurve) {
      console.log('🎢 Creating Meteora Bonding Curve pool...');
      const bondingCurveResult = await bondingCurveService.createConfigAndPool({
        tokenName,
        tokenSymbol,
        tokenMint: mint,
        totalSupply,
        deployer,
        poolCreator: wallets.treasury,
        initialMarketCap: bondingCurveInitialMC,
        migrationMarketCap: bondingCurveMigrationMC,
        metadataUri: metadataUri || '',
      });

      bondingCurvePool = bondingCurveResult.poolAddress;
      bondingCurveConfig = bondingCurveResult.configAddress;
      tradingUrl = bondingCurveResult.tradingUrl;

      console.log('✅ Bonding Curve Pool:', bondingCurvePool);
      console.log('✅ Trading URL:', tradingUrl);

      if (initialPurchaseAmount > 0) {
        console.log(`💰 Executing initial purchase: ${initialPurchaseAmount} SOL for creator...`);
        try {
          const amountInLamports = Math.floor(initialPurchaseAmount * LAMPORTS_PER_SOL);
          
          const treasuryBalance = await this.connection.getBalance(wallets.treasury.publicKey);
          if (treasuryBalance < amountInLamports + 0.01 * LAMPORTS_PER_SOL) {
            throw new Error('Insufficient balance in treasury for initial purchase');
          }

          const quote = await bondingCurveService.getSwapQuote({
            poolAddress: bondingCurvePool,
            amountIn: amountInLamports.toString(),
            swapBaseForQuote: false,
          });

          const swapResult = await bondingCurveService.executeSwap({
            poolAddress: bondingCurvePool,
            amountIn: amountInLamports.toString(),
            minimumAmountOut: quote.minimumAmountOut,
            swapBaseForQuote: false,
            userPublicKey: wallets.treasury.publicKey.toString(),
            userKeypair: wallets.treasury,
          });

          console.log('✅ Initial purchase completed:', swapResult.signature);
          console.log(`   Tokens received by creator: ${parseInt(quote.amountOut) / Math.pow(10, decimals)}`);
          console.log(`   Tokens sent to: ${wallets.treasury.publicKey.toString()}`);
        } catch (error) {
          console.error('⚠️ Initial purchase failed (pool still created):', error.message);
        }
      }
    } else if (createPool) {
      console.log('🏪 Creating OpenBook Market ID...');
      marketId = await this.createOpenBookMarket({
        baseMint: mint,
        deployer,
        decimals,
      });
      console.log('✅ Market ID:', marketId);

      console.log('🌊 Creating Raydium Pool...');
      poolAddress = await this.createRaydiumPool({
        marketId,
        baseMint: mint,
        liquidityWallet: wallets.liquidity,
        deployer,
        liquiditySOL: poolLiquiditySOL,
        decimals,
      });
      console.log('✅ Pool Address:', poolAddress);
    }

    console.log('🔒 Revoking mint authority...');
    await setAuthority(
      this.connection,
      deployer,
      mint,
      deployer.publicKey,
      AuthorityType.MintTokens,
      null
    );
    console.log('✅ Mint authority revoked - supply is now immutable');

    return {
      mintAddress: mint.toString(),
      treasuryWallet: wallets.treasury.publicKey.toString(),
      rewardsWallet: wallets.rewards.publicKey.toString(),
      liquidityWallet: wallets.liquidity.publicKey.toString(),
      marketingWallet: wallets.marketing.publicKey.toString(),
      treasuryKeypair: Array.from(wallets.treasury.secretKey),
      rewardsKeypair: Array.from(wallets.rewards.secretKey),
      liquidityKeypair: Array.from(wallets.liquidity.secretKey),
      marketingKeypair: Array.from(wallets.marketing.secretKey),
      walletsPath: walletsDir,
      metadataUri,
      marketId,
      poolAddress,
      deploymentSignature: 'deployed',
      useBondingCurve,
      bondingCurvePool,
      bondingCurveConfig,
      bondingCurveInitialMC,
      bondingCurveMigrationMC,
      tradingUrl,
    };
  }

  async uploadMetadata({ mint, tokenName, tokenSymbol, description, logoBuffer, deployer, totalSupply, website, twitter, walletAddress }) {
    const metaplex = Metaplex.make(this.connection)
      .use(keypairIdentity(deployer))
      .use(irysStorage({
        address: this.network === 'mainnet-beta' 
          ? 'https://node1.irys.xyz' 
          : 'https://devnet.irys.xyz',
        providerUrl: process.env.SOLANA_RPC_URL || clusterApiUrl(this.network),
        timeout: 60000,
      }));

    const imageFile = {
      buffer: logoBuffer,
      fileName: `${tokenSymbol.toLowerCase()}-logo.png`,
      displayName: `${tokenName} Logo`,
      uniqueName: `${tokenSymbol.toLowerCase()}-logo`,
      contentType: 'image/png',
      extension: 'png',
      tags: [{ name: 'Content-Type', value: 'image/png' }],
    };

    const imageUri = await metaplex.storage().upload(imageFile);

    const metadata = {
      name: tokenName,
      symbol: tokenSymbol,
      description: description || `${tokenName} (${tokenSymbol}) - A mineable token on Solana`,
      image: imageUri,
      attributes: [
        { trait_type: 'Type', value: 'Mineable Token' },
        { trait_type: 'Network', value: 'Solana' },
        { trait_type: 'Supply', value: totalSupply.toLocaleString() },
      ],
      properties: {
        files: [
          {
            uri: imageUri,
            type: 'image/png',
          },
        ],
        category: 'image',
        creators: [
          {
            address: deployer.publicKey.toString(),
            share: 100,
          },
        ],
      },
    };

    if (website) {
      metadata.external_url = website;
    }

    if (twitter || walletAddress) {
      metadata.properties.links = {};
      
      if (twitter) {
        const twitterHandle = twitter.startsWith('@') ? twitter.slice(1) : twitter.replace(/https?:\/\/(twitter|x)\.com\//, '');
        metadata.properties.links.twitter = `https://x.com/${twitterHandle}`;
      }
      
      if (walletAddress) {
        metadata.properties.links.wallet = walletAddress;
      }
    }

    const metadataUri = await metaplex.storage().uploadJson(metadata);

    return metadataUri;
  }

  async createOpenBookMarket({ baseMint, deployer, decimals }) {
    try {
      const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
      
      const lotSize = 1;
      const tickSize = 0.01;
      
      const market = await MarketV2.makeCreateMarketInstructionSimple({
        connection: this.connection,
        wallet: deployer.publicKey,
        baseInfo: {
          mint: baseMint,
          decimals: decimals,
        },
        quoteInfo: {
          mint: WSOL_MINT,
          decimals: 9,
        },
        lotSize: lotSize,
        tickSize: tickSize,
        dexProgramId: new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
        makeTxVersion: TxVersion.V0,
      });

      const tx = new Transaction();
      tx.add(...market.innerTransactions[0].instructions);
      tx.feePayer = deployer.publicKey;
      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      
      const signature = await this.connection.sendTransaction(tx, [deployer]);
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ OpenBook Market Created:', market.address.marketId.toString());
      
      return market.address.marketId.toString();
    } catch (error) {
      console.error('OpenBook Market creation failed:', error);
      console.log('⚠️  Falling back to manual setup');
      console.log('   1. Go to https://openbookdex.com or https://dexlab.space');
      console.log(`   2. Create market for token: ${baseMint.toString()}`);
      console.log('   3. Quote currency: SOL (Wrapped SOL)');
      return null;
    }
  }

  async createRaydiumPool({ marketId, baseMint, liquidityWallet, deployer, liquiditySOL, decimals }) {
    try {
      if (!marketId) {
        throw new Error('Market ID required for Raydium pool creation');
      }

      const raydium = await Raydium.load({
        connection: this.connection,
        owner: deployer,
        disableFeatureCheck: true,
        disableLoadToken: false,
      });

      const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
      
      const baseAmount = new BN(1000000).mul(new BN(10).pow(new BN(decimals)));
      const quoteAmount = new BN(liquiditySOL * LAMPORTS_PER_SOL);

      const { execute, extInfo } = await raydium.liquidity.createPool({
        programId: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
        marketInfo: {
          marketId: new PublicKey(marketId),
          programId: new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
        },
        baseMintInfo: {
          mint: baseMint,
          decimals: decimals,
        },
        quoteMintInfo: {
          mint: WSOL_MINT,
          decimals: 9,
        },
        baseAmount,
        quoteAmount,
        startTime: new BN(Math.floor(Date.now() / 1000)),
        ownerInfo: {
          useSOLBalance: true,
        },
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });
      
      console.log('✅ Raydium Pool Created:', extInfo.address.poolId.toString());
      console.log('   Transaction:', txId);
      
      console.log('🔥 Burning LP tokens (locking liquidity forever)...');
      try {
        const lpMint = extInfo.address.lpMint;
        const deployerLpAccount = await getOrCreateAssociatedTokenAccount(
          this.connection,
          deployer,
          lpMint,
          deployer.publicKey
        );
        
        const lpBalance = (await this.connection.getTokenAccountBalance(deployerLpAccount.address)).value.amount;
        
        if (parseInt(lpBalance) > 0) {
          const burnTx = new Transaction().add(
            createBurnInstruction(
              deployerLpAccount.address,
              lpMint,
              deployer.publicKey,
              lpBalance
            )
          );
          
          const burnSig = await this.connection.sendTransaction(burnTx, [deployer]);
          await this.connection.confirmTransaction(burnSig, 'confirmed');
          
          console.log('✅ LP Tokens Burned - Liquidity Locked Forever!');
          console.log('   Burn Transaction:', burnSig);
        }
      } catch (burnError) {
        console.error('⚠️  LP burn failed (non-critical):', burnError.message);
      }
      
      return extInfo.address.poolId.toString();
    } catch (error) {
      console.error('Raydium Pool creation failed:', error);
      console.log('⚠️  Falling back to manual setup');
      console.log('   1. Go to https://raydium.io/liquidity/create/');
      console.log(`   2. Base Token: ${baseMint.toString()}`);
      console.log(`   3. Market ID: ${marketId}`);
      console.log(`   4. Add ${liquiditySOL} SOL + corresponding tokens as liquidity`);
      return null;
    }
  }

  getDefaultAllocations() {
    return {
      treasury: 20,
      rewards: 30,
      liquidity: 20,
      marketing: 15,
      team: 15,
    };
  }

  async getDeploymentPrice(paymentMethod = 'SOL') {
    if (paymentMethod === 'PEPETOR') {
      return DEPLOYMENT_PRICE_PEPETOR;
    }
    
    return DEPLOYMENT_PRICE_SOL;
  }
}

module.exports = new TokenDeploymentService();
