const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  Transaction,
} = require('@solana/web3.js');
const {
  DynamicBondingCurveClient,
  buildCurveWithMarketCap,
  ActivationType,
  CollectFeeMode,
  BaseFeeMode,
  MigrationFeeOption,
  MigrationOption,
  TokenDecimal,
  TokenType,
  TokenUpdateAuthorityOption,
} = require('@meteora-ag/dynamic-bonding-curve-sdk');
const { NATIVE_MINT } = require('@solana/spl-token');
const BN = require('bn.js');

class BondingCurveService {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
      'confirmed'
    );
    this.network = process.env.SOLANA_NETWORK || 'mainnet-beta';
    this.client = new DynamicBondingCurveClient(this.connection, 'confirmed');
    
    this.feeClaimerAddress = process.env.METEORA_FEE_CLAIMER || process.env.TREASURY_WALLET_ADDRESS;
    this.leftoverReceiverAddress = process.env.METEORA_LEFTOVER_RECEIVER || process.env.TREASURY_WALLET_ADDRESS;
  }

  async createConfigAndPool({
    tokenName,
    tokenSymbol,
    tokenMint,
    totalSupply = 1_000_000_000,
    deployer,
    poolCreator,
    initialMarketCap = 30,
    migrationMarketCap = 85,
    metadataUri = '',
  }) {
    try {
      console.log('🎢 Creating Meteora Bonding Curve Config...');
      
      const config = Keypair.generate();
      console.log('Config keypair generated:', config.publicKey.toString());

      const curveConfig = buildCurveWithMarketCap({
        totalTokenSupply: totalSupply,
        initialMarketCap,
        migrationMarketCap,
        migrationOption: MigrationOption.MET_DAMM_V2,
        tokenBaseDecimal: TokenDecimal.NINE,
        tokenQuoteDecimal: TokenDecimal.NINE,
        lockedVestingParam: {
          totalLockedVestingAmount: 0,
          numberOfVestingPeriod: 0,
          cliffUnlockAmount: 0,
          totalVestingDuration: 0,
          cliffDurationFromMigrationTime: 0,
        },
        baseFeeParams: {
          baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
          feeSchedulerParam: {
            startingFeeBps: 100,
            endingFeeBps: 100,
            numberOfPeriod: 0,
            totalDuration: 0,
          },
        },
        dynamicFeeEnabled: true,
        activationType: ActivationType.Slot,
        collectFeeMode: CollectFeeMode.QuoteToken,
        migrationFeeOption: MigrationFeeOption.FixedBps100,
        tokenType: TokenType.SPL,
        partnerLpPercentage: 0,
        creatorLpPercentage: 0,
        partnerLockedLpPercentage: 0,
        creatorLockedLpPercentage: 100,
        creatorTradingFeePercentage: 50,
        leftover: 0,
        tokenUpdateAuthority: TokenUpdateAuthorityOption.Immutable,
        migrationFee: {
          feePercentage: 0,
          creatorFeePercentage: 0,
        },
      });

      console.log('Curve config built:', JSON.stringify(curveConfig, null, 2));

      const createConfigTx = await this.client.partner.createConfig({
        config: config.publicKey,
        feeClaimer: new PublicKey(this.feeClaimerAddress),
        leftoverReceiver: new PublicKey(this.leftoverReceiverAddress),
        payer: deployer.publicKey,
        quoteMint: NATIVE_MINT,
        ...curveConfig,
      });

      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      createConfigTx.recentBlockhash = blockhash;
      createConfigTx.feePayer = deployer.publicKey;

      createConfigTx.partialSign(config);
      createConfigTx.partialSign(deployer);

      const configSignature = await this.connection.sendRawTransaction(
        createConfigTx.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );

      await this.connection.confirmTransaction({
        signature: configSignature,
        blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight,
      }, 'confirmed');

      console.log('✅ Config created:', configSignature);
      console.log('Config address:', config.publicKey.toString());

      console.log('🏊 Creating Bonding Curve Pool...');

      const createPoolParams = {
        baseMint: tokenMint,
        config: config.publicKey,
        name: tokenName,
        symbol: tokenSymbol,
        uri: metadataUri,
        payer: deployer.publicKey,
        poolCreator: poolCreator.publicKey,
      };

      const poolTransaction = await this.client.pool.createPool(createPoolParams);

      const { blockhash: poolBlockhash } = await this.connection.getLatestBlockhash('confirmed');
      poolTransaction.recentBlockhash = poolBlockhash;
      poolTransaction.feePayer = deployer.publicKey;

      poolTransaction.partialSign(poolCreator);
      poolTransaction.partialSign(deployer);

      const poolSignature = await this.connection.sendRawTransaction(
        poolTransaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );

      await this.connection.confirmTransaction({
        signature: poolSignature,
        blockhash: poolBlockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight,
      }, 'confirmed');

      console.log('✅ Pool created:', poolSignature);

      const poolAddress = await this.derivePoolAddress(tokenMint, config.publicKey);
      console.log('Pool address:', poolAddress.toString());

      return {
        configAddress: config.publicKey.toString(),
        poolAddress: poolAddress.toString(),
        configSignature,
        poolSignature,
        tradingUrl: `https://app.meteora.ag/dlmm/${poolAddress.toString()}`,
      };
    } catch (error) {
      console.error('Bonding curve creation failed:', error);
      throw error;
    }
  }

  async derivePoolAddress(baseMint, config) {
    const [poolAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('virtual_pool'),
        new PublicKey(baseMint).toBuffer(),
        new PublicKey(config).toBuffer(),
      ],
      new PublicKey('DYNAMetxeHmv4FuZbkXV5MqjvqrXW8W7Z8ij7LMLqLnA')
    );
    return poolAddress;
  }

  async getPoolState(poolAddress) {
    try {
      const poolState = await this.client.state.getPool(new PublicKey(poolAddress));
      
      if (!poolState) {
        throw new Error('Pool not found');
      }

      return {
        address: poolAddress,
        baseMint: poolState.baseMint.toString(),
        quoteMint: poolState.quoteMint.toString(),
        config: poolState.config.toString(),
        baseReserve: poolState.baseReserve.toString(),
        quoteReserve: poolState.quoteReserve.toString(),
        sqrtPrice: poolState.sqrtPrice.toString(),
        isMigrated: poolState.isMigrated,
        migratedPool: poolState.migratedPool?.toString() || null,
      };
    } catch (error) {
      console.error('Failed to get pool state:', error);
      throw error;
    }
  }

  async getSwapQuote({ poolAddress, amountIn, swapBaseForQuote = false }) {
    try {
      const virtualPoolState = await this.client.state.getPool(new PublicKey(poolAddress));
      
      if (!virtualPoolState) {
        throw new Error('Pool not found');
      }

      const poolConfigState = await this.client.state.getPoolConfig(virtualPoolState.config);

      if (!virtualPoolState.sqrtPrice || virtualPoolState.sqrtPrice.isZero()) {
        throw new Error('Invalid pool state: sqrtPrice is zero or undefined');
      }

      if (!poolConfigState.curve || poolConfigState.curve.length === 0) {
        throw new Error('Invalid config state: curve is empty');
      }

      const quote = await this.client.pool.swapQuote({
        virtualPool: virtualPoolState,
        config: poolConfigState,
        swapBaseForQuote,
        amountIn: new BN(amountIn),
        slippageBps: 100,
        hasReferral: false,
        currentPoint: new BN(0),
      });

      return {
        amountIn: amountIn.toString(),
        amountOut: quote.amountOut.toString(),
        minimumAmountOut: quote.minimumAmountOut.toString(),
        nextSqrtPrice: quote.nextSqrtPrice.toString(),
        fee: {
          trading: quote.fee.trading.toString(),
          protocol: quote.fee.protocol.toString(),
          referral: quote.fee.referral?.toString() || '0',
        },
        price: {
          beforeSwap: quote.price.beforeSwap.toString(),
          afterSwap: quote.price.afterSwap.toString(),
        },
      };
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      throw error;
    }
  }

  async executeSwap({ poolAddress, amountIn, minimumAmountOut, swapBaseForQuote, userPublicKey, userKeypair }) {
    try {
      const swapParams = {
        amountIn: new BN(amountIn),
        minimumAmountOut: new BN(minimumAmountOut),
        swapBaseForQuote,
        owner: new PublicKey(userPublicKey),
        pool: new PublicKey(poolAddress),
        referralTokenAccount: null,
      };

      const swapTransaction = await this.client.pool.swap(swapParams);

      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      swapTransaction.recentBlockhash = blockhash;
      swapTransaction.feePayer = new PublicKey(userPublicKey);

      if (userKeypair) {
        swapTransaction.partialSign(userKeypair);
      }

      const signature = await this.connection.sendRawTransaction(
        swapTransaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );

      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight,
      }, 'confirmed');

      return {
        signature,
        success: true,
      };
    } catch (error) {
      console.error('Swap execution failed:', error);
      throw error;
    }
  }
}

module.exports = new BondingCurveService();
