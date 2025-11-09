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
} = require('@solana/spl-token');
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js');
const { Market } = require('@openbook-dex/openbook');
const fs = require('fs');
const path = require('path');

const DEPLOYMENT_PRICE_USD = 10;
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

    if (createPool) {
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
    };
  }

  async uploadMetadata({ mint, tokenName, tokenSymbol, description, logoBuffer, deployer, totalSupply, website, twitter, walletAddress }) {
    const metaplex = Metaplex.make(this.connection)
      .use(keypairIdentity(deployer))
      .use(bundlrStorage({
        address: this.network === 'mainnet-beta' 
          ? 'https://node1.bundlr.network' 
          : 'https://devnet.bundlr.network',
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

    try {
      await metaplex.nfts().create({
        uri: metadataUri,
        name: tokenName,
        sellerFeeBasisPoints: 0,
        symbol: tokenSymbol,
        creators: [
          {
            address: deployer.publicKey,
            share: 100,
          },
        ],
        isMutable: true,
        maxSupply: null,
        useNewMint: new PublicKey(mint),
      });
    } catch (error) {
      console.warn('⚠️  Metadata account creation skipped:', error.message);
    }

    return metadataUri;
  }

  async createOpenBookMarket({ baseMint, deployer, decimals }) {
    const OPENBOOK_PROGRAM_ID = new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX');
    const quoteMint = new PublicKey('So11111111111111111111111111111111111111112');

    const minOrderSize = 1;
    const tickSize = 0.00001;

    const marketKeypair = Keypair.generate();

    const tx = new Transaction();
    
    const rentExemption = await this.connection.getMinimumBalanceForRentExemption(
      Market.getLayout(OPENBOOK_PROGRAM_ID).span
    );

    tx.add(
      SystemProgram.createAccount({
        fromPubkey: deployer.publicKey,
        newAccountPubkey: marketKeypair.publicKey,
        lamports: rentExemption,
        space: Market.getLayout(OPENBOOK_PROGRAM_ID).span,
        programId: OPENBOOK_PROGRAM_ID,
      })
    );

    await this.connection.sendTransaction(tx, [deployer, marketKeypair]);

    return marketKeypair.publicKey.toString();
  }

  async createRaydiumPool({ marketId, baseMint, liquidityWallet, deployer, liquiditySOL, decimals }) {
    const quoteMint = new PublicKey('So11111111111111111111111111111111111111112');
    
    console.log('⚠️  Pool creation requires manual setup via Raydium UI');
    console.log('   1. Go to https://raydium.io/liquidity/create/');
    console.log(`   2. Base Token: ${baseMint.toString()}`);
    console.log(`   3. Market ID: ${marketId}`);
    console.log(`   4. Add ${liquiditySOL} SOL liquidity`);
    
    return null;
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
    
    const solPrice = await this.fetchSOLPrice();
    const priceInSOL = DEPLOYMENT_PRICE_USD / solPrice;
    return parseFloat(priceInSOL.toFixed(4));
  }
}

module.exports = new TokenDeploymentService();
