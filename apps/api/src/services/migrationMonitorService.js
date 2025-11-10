const {
  Connection,
  clusterApiUrl,
  PublicKey,
} = require('@solana/web3.js');
const DeployedToken = require('../models/DeployedToken');
const LiquidityCommitment = require('../models/LiquidityCommitment');
const bondingCurveService = require('./bondingCurveService');
const escrowService = require('./escrowService');

const POLL_INTERVAL = 30000;

class MigrationMonitorService {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
      'confirmed'
    );
    this.isRunning = false;
    this.pollTimer = null;
    this.monitoredPools = new Map();
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Migration monitor already running');
      return;
    }

    this.isRunning = true;
    console.log('🔍 Starting migration monitor service...');
    
    await this.loadActivePools();
    
    this.pollTimer = setInterval(() => {
      this.checkForMigrations();
    }, POLL_INTERVAL);

    this.checkForMigrations();
  }

  async stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isRunning = false;
    console.log('⏹️  Migration monitor stopped');
  }

  async loadActivePools() {
    try {
      const activeTokens = await DeployedToken.find({
        useBondingCurve: true,
        isMigrated: false,
        status: 'deployed',
      });

      console.log(`📊 Monitoring ${activeTokens.length} bonding curve pools`);

      for (const token of activeTokens) {
        if (token.bondingCurvePool) {
          this.monitoredPools.set(token.bondingCurvePool, {
            tokenMint: token.mintAddress,
            poolAddress: token.bondingCurvePool,
            configAddress: token.bondingCurveConfig,
            migrationThreshold: token.bondingCurveMigrationMC || 85,
          });
        }
      }
    } catch (error) {
      console.error('Error loading active pools:', error);
    }
  }

  async checkForMigrations() {
    if (!this.isRunning) return;

    console.log(`🔍 Checking ${this.monitoredPools.size} pools for migrations...`);

    for (const [poolAddress, poolData] of this.monitoredPools.entries()) {
      try {
        const poolState = await bondingCurveService.getPoolState(poolAddress);

        if (poolState && poolState.isMigrated) {
          console.log(`🎉 Migration detected for pool: ${poolAddress}`);
          await this.handleMigration(poolData, poolState);
          this.monitoredPools.delete(poolAddress);
        }
      } catch (error) {
        console.error(`Error checking pool ${poolAddress}:`, error.message);
      }
    }
  }

  async handleMigration(poolData, poolState) {
    try {
      console.log(`🚀 Processing migration for token: ${poolData.tokenMint}`);

      const token = await DeployedToken.findOne({ mintAddress: poolData.tokenMint });
      if (!token) {
        console.error('Token not found:', poolData.tokenMint);
        return;
      }

      token.isMigrated = true;
      token.migratedPoolAddress = poolState.migratedPoolAddress || 'N/A';
      await token.save();

      const pendingCommitments = await LiquidityCommitment.find({
        tokenMint: poolData.tokenMint,
        status: 'pending',
      });

      if (pendingCommitments.length === 0) {
        console.log('No pending commitments to process');
        return;
      }

      console.log(`💰 Distributing LP tokens to ${pendingCommitments.length} commitments`);

      const totalCommittedSOL = pendingCommitments.reduce(
        (sum, c) => sum + c.amountSOL,
        0
      );

      const escrowReleaseResults = await escrowService.batchReleaseEscrows(
        pendingCommitments,
        poolState.migratedPoolAddress || poolData.poolAddress
      );

      for (const commitment of pendingCommitments) {
        try {
          const releaseResult = escrowReleaseResults.find(
            r => r.commitment.escrowAddress === commitment.escrowAddress
          );

          if (releaseResult && releaseResult.success) {
            const lpTokenShare = (commitment.amountSOL / totalCommittedSOL) * 100;
            const estimatedLPTokens = this.calculateLPTokens(
              commitment.amountSOL,
              totalCommittedSOL,
              poolState
            );

            commitment.status = 'fulfilled';
            commitment.fulfilledAt = new Date();
            commitment.fulfillmentSignature = releaseResult.signature;
            commitment.lpTokensReceived = estimatedLPTokens;
            await commitment.save();

            console.log(`✅ Commitment fulfilled: ${commitment._id} (${lpTokenShare.toFixed(2)}% share)`);

            if (global.io) {
              global.io.to('tokens').emit('commitment:fulfilled', {
                commitmentId: commitment._id,
                tokenMint: poolData.tokenMint,
                walletAddress: commitment.walletAddress,
                amountSOL: commitment.amountSOL,
                lpTokensReceived: estimatedLPTokens,
                signature: releaseResult.signature,
              });
            }
          } else {
            console.error(`Failed to release escrow for commitment ${commitment._id}`);
          }
        } catch (error) {
          console.error(`Error fulfilling commitment ${commitment._id}:`, error);
        }
      }

      if (global.io) {
        global.io.to('tokens').emit('pool:migrated', {
          tokenMint: poolData.tokenMint,
          poolAddress: poolData.poolAddress,
          migratedPoolAddress: poolState.migratedPoolAddress,
          totalCommitments: pendingCommitments.length,
          totalSOL: totalCommittedSOL,
        });
      }

      console.log(`✅ Migration processing complete for ${poolData.tokenMint}`);
    } catch (error) {
      console.error('Error handling migration:', error);
    }
  }

  calculateLPTokens(userSOL, totalSOL, poolState) {
    const userShare = userSOL / totalSOL;
    
    const estimatedPoolLPSupply = 1000000;
    
    return Math.floor(estimatedPoolLPSupply * userShare);
  }

  addPool(poolAddress, tokenMint, configAddress, migrationThreshold = 85) {
    this.monitoredPools.set(poolAddress, {
      tokenMint,
      poolAddress,
      configAddress,
      migrationThreshold,
    });
    console.log(`➕ Added pool to monitor: ${poolAddress}`);
  }

  removePool(poolAddress) {
    this.monitoredPools.delete(poolAddress);
    console.log(`➖ Removed pool from monitor: ${poolAddress}`);
  }
}

module.exports = new MigrationMonitorService();
