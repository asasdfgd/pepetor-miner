const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

class TokenService {
  constructor() {
    this.network = process.env.SOLANA_NETWORK || 'devnet';
    this.rpcUrl = process.env.SOLANA_RPC_URL || this.getDefaultRpcUrl();
    this.connection = new Connection(this.rpcUrl, 'confirmed');
    
    this.mintAddress = process.env.PEPETOR_MINT_ADDRESS;
    this.rewardsWalletPath = process.env.REWARDS_WALLET_PATH || '.wallets/rewards.json';
    this.treasuryWalletPath = process.env.TREASURY_WALLET_PATH || '.wallets/treasury.json';
    
    this.rewardsWallet = this.loadWallet('REWARDS_WALLET', this.rewardsWalletPath);
    this.treasuryWallet = this.loadWallet('TREASURY_WALLET', this.treasuryWalletPath);
    
    this.tokenDecimals = 9;
    this.feePercentage = 2;
    this.loadFeePercentage();
    
    console.log('[TokenService] Initialized');
    console.log('  Network:', this.network);
    console.log('  RPC:', this.rpcUrl);
    console.log('  Mint:', this.mintAddress || 'NOT SET');
    console.log('  Rewards Wallet:', this.rewardsWallet ? this.rewardsWallet.publicKey.toString() : 'NOT LOADED');
    console.log('  Treasury Wallet:', this.treasuryWallet ? this.treasuryWallet.publicKey.toString() : 'NOT LOADED');
    console.log('  Fee %:', this.feePercentage + '%');
  }

  getDefaultRpcUrl() {
    const urls = {
      'mainnet-beta': 'https://api.mainnet-beta.solana.com',
      'devnet': 'https://api.devnet.solana.com',
      'testnet': 'https://api.testnet.solana.com',
    };
    return urls[this.network] || urls['devnet'];
  }

  loadWallet(envVarName, relativePath) {
    try {
      if (process.env[envVarName]) {
        console.log(`[TokenService] Loading ${envVarName} from environment variable`);
        const base64Data = process.env[envVarName];
        const keypairData = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf-8'));
        const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
        console.log(`[TokenService] Loaded wallet from env: ${envVarName}`);
        return keypair;
      }

      const walletPath = path.join(__dirname, '../../', relativePath);
      
      if (!fs.existsSync(walletPath)) {
        console.warn(`[TokenService] Wallet not found: ${walletPath}`);
        return null;
      }

      const keypairData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
      const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
      
      console.log(`[TokenService] Loaded wallet from ${relativePath}`);
      return keypair;
    } catch (error) {
      console.error(`[TokenService] Error loading wallet ${relativePath}:`, error.message);
      return null;
    }
  }

  async loadFeePercentage() {
    try {
      const SystemSettings = require('../models/SystemSettings');
      const fee = await SystemSettings.getSetting('transaction_fee_percent', 2);
      this.feePercentage = parseFloat(fee);
      console.log('[TokenService] Fee percentage loaded from database:', this.feePercentage + '%');
    } catch (error) {
      console.error('[TokenService] Failed to load fee from database, using default:', error.message);
      this.feePercentage = 2;
    }
  }

  async sendPepetorReward(userWalletAddress, grossAmount) {
    if (!this.mintAddress) {
      throw new Error('PEPETOR_MINT_ADDRESS not configured in .env');
    }

    if (!this.rewardsWallet) {
      throw new Error('Rewards wallet not loaded - check REWARDS_WALLET_PATH');
    }

    try {
      const userPublicKey = new PublicKey(userWalletAddress);
      const mintPublicKey = new PublicKey(this.mintAddress);

      const fee = (grossAmount * this.feePercentage) / 100;
      const netAmount = grossAmount - fee;

      console.log('[TokenService] Sending $PEPETOR reward:');
      console.log('  User:', userWalletAddress);
      console.log('  Gross Amount:', grossAmount);
      console.log('  Fee (' + this.feePercentage + '%):', fee);
      console.log('  Net Amount:', netAmount);

      const rewardsTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.rewardsWallet,
        mintPublicKey,
        this.rewardsWallet.publicKey
      );

      const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.rewardsWallet,
        mintPublicKey,
        userPublicKey
      );

      const netAmountLamports = Math.floor(netAmount * Math.pow(10, this.tokenDecimals));

      const transferInstruction = createTransferInstruction(
        rewardsTokenAccount.address,
        userTokenAccount.address,
        this.rewardsWallet.publicKey,
        netAmountLamports,
        [],
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(transferInstruction);

      const signature = await this.connection.sendTransaction(
        transaction,
        [this.rewardsWallet],
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );

      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('[TokenService] ✅ Transfer successful');
      console.log('  Signature:', signature);
      console.log('  Explorer:', this.getExplorerUrl(signature));

      if (fee > 0 && this.treasuryWallet) {
        await this.sendFeeToTreasury(fee);
      }

      return {
        success: true,
        signature,
        netAmount,
        fee,
        explorerUrl: this.getExplorerUrl(signature),
      };

    } catch (error) {
      console.error('[TokenService] Error sending reward:', error);
      throw error;
    }
  }

  async sendFeeToTreasury(feeAmount) {
    if (!this.treasuryWallet) {
      console.warn('[TokenService] Treasury wallet not loaded - skipping fee transfer');
      return null;
    }

    try {
      const mintPublicKey = new PublicKey(this.mintAddress);
      
      const rewardsTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.rewardsWallet,
        mintPublicKey,
        this.rewardsWallet.publicKey
      );

      const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.rewardsWallet,
        mintPublicKey,
        this.treasuryWallet.publicKey
      );

      const feeAmountLamports = Math.floor(feeAmount * Math.pow(10, this.tokenDecimals));

      const transferInstruction = createTransferInstruction(
        rewardsTokenAccount.address,
        treasuryTokenAccount.address,
        this.rewardsWallet.publicKey,
        feeAmountLamports,
        [],
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(transferInstruction);

      const signature = await this.connection.sendTransaction(
        transaction,
        [this.rewardsWallet],
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );

      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('[TokenService] ✅ Fee sent to Treasury:', feeAmount);
      console.log('  Signature:', signature);

      return signature;

    } catch (error) {
      console.error('[TokenService] Error sending fee to treasury:', error);
      return null;
    }
  }

  async getTokenBalance(walletAddress) {
    try {
      if (!this.mintAddress) {
        throw new Error('PEPETOR_MINT_ADDRESS not configured');
      }

      const walletPublicKey = new PublicKey(walletAddress);
      const mintPublicKey = new PublicKey(this.mintAddress);

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.rewardsWallet,
        mintPublicKey,
        walletPublicKey
      );

      const balance = Number(tokenAccount.amount) / Math.pow(10, this.tokenDecimals);

      return {
        balance,
        tokenAccount: tokenAccount.address.toString(),
      };

    } catch (error) {
      console.error('[TokenService] Error fetching balance:', error);
      return { balance: 0, error: error.message };
    }
  }

  getExplorerUrl(signature) {
    const baseUrls = {
      'mainnet-beta': 'https://solscan.io/tx/',
      'devnet': 'https://solscan.io/tx/',
      'testnet': 'https://solscan.io/tx/',
    };
    
    const cluster = this.network === 'mainnet-beta' ? '' : `?cluster=${this.network}`;
    return `${baseUrls[this.network] || baseUrls['devnet']}${signature}${cluster}`;
  }

  calculateReward(durationSeconds, bytesTransferred) {
    const durationCredits = durationSeconds * 0.1;
    const megabytes = bytesTransferred / (1024 * 1024);
    const dataCredits = megabytes * 0.5;
    
    const totalCredits = durationCredits + dataCredits;
    return Math.min(totalCredits, 100);
  }

  async healthCheck() {
    try {
      const slot = await this.connection.getSlot();
      
      let rewardsBalance = null;
      if (this.rewardsWallet && this.mintAddress) {
        const rewardsData = await this.getTokenBalance(this.rewardsWallet.publicKey.toString());
        rewardsBalance = rewardsData.balance;
      }

      return {
        connected: true,
        network: this.network,
        slot,
        mintConfigured: !!this.mintAddress,
        rewardsWalletLoaded: !!this.rewardsWallet,
        treasuryWalletLoaded: !!this.treasuryWallet,
        rewardsBalance,
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }
}

let tokenServiceInstance = null;

function getTokenService() {
  if (!tokenServiceInstance) {
    tokenServiceInstance = new TokenService();
  }
  return tokenServiceInstance;
}

module.exports = {
  TokenService,
  getTokenService,
};
