const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const BN = require('bn.js');

const ESCROW_SEED_PREFIX = 'liquidity_escrow';
const ESCROW_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

class EscrowService {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
      'confirmed'
    );
    
    const treasuryKeypairData = require(process.env.TREASURY_WALLET_PATH || './.wallets/deployer.json');
    this.treasuryKeypair = Keypair.fromSecretKey(Uint8Array.from(treasuryKeypairData));
  }

  async deriveEscrowAddress(userWallet, tokenMint, nonce = 0) {
    const seeds = [
      Buffer.from(ESCROW_SEED_PREFIX),
      new PublicKey(userWallet).toBuffer(),
      new PublicKey(tokenMint).toBuffer(),
      Buffer.from([nonce]),
    ];

    const [escrowPDA, bump] = await PublicKey.findProgramAddress(
      seeds,
      ESCROW_PROGRAM_ID
    );

    return { escrowAddress: escrowPDA.toString(), bump, nonce };
  }

  async createCommitment({
    userWallet,
    tokenMint,
    amountSOL,
  }) {
    try {
      console.log('🔒 Creating liquidity commitment escrow...');
      console.log('User:', userWallet);
      console.log('Token:', tokenMint);
      console.log('Amount:', amountSOL, 'SOL');

      const { escrowAddress, bump, nonce } = await this.deriveEscrowAddress(
        userWallet,
        tokenMint
      );

      const userPublicKey = new PublicKey(userWallet);
      const escrowPublicKey = new PublicKey(escrowAddress);
      const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

      const rentExemption = await this.connection.getMinimumBalanceForRentExemption(0);
      const totalLamports = lamports + rentExemption;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: escrowPublicKey,
          lamports: totalLamports,
        })
      );

      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      return {
        escrowAddress,
        bump,
        nonce,
        transaction: serializedTransaction.toString('base64'),
        blockhash,
        lastValidBlockHeight,
      };
    } catch (error) {
      console.error('Error creating commitment escrow:', error);
      throw error;
    }
  }

  async verifyCommitment(escrowAddress, expectedAmount) {
    try {
      const escrowPublicKey = new PublicKey(escrowAddress);
      const balance = await this.connection.getBalance(escrowPublicKey);
      const expectedLamports = Math.floor(expectedAmount * LAMPORTS_PER_SOL);
      const rentExemption = await this.connection.getMinimumBalanceForRentExemption(0);

      return balance >= (expectedLamports + rentExemption);
    } catch (error) {
      console.error('Error verifying commitment:', error);
      return false;
    }
  }

  async getEscrowBalance(escrowAddress) {
    try {
      const escrowPublicKey = new PublicKey(escrowAddress);
      const balance = await this.connection.getBalance(escrowPublicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting escrow balance:', error);
      return 0;
    }
  }

  async releaseEscrow({
    escrowAddress,
    destinationWallet,
    amount,
  }) {
    try {
      console.log('🔓 Releasing escrow funds...');
      console.log('Escrow:', escrowAddress);
      console.log('Destination:', destinationWallet);
      console.log('Amount:', amount, 'SOL');

      const escrowPublicKey = new PublicKey(escrowAddress);
      const destinationPublicKey = new PublicKey(destinationWallet);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: escrowPublicKey,
          toPubkey: destinationPublicKey,
          lamports,
        })
      );

      const signature = await this.connection.sendTransaction(
        transaction,
        [this.treasuryKeypair],
        { skipPreflight: false }
      );

      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ Escrow released:', signature);
      return signature;
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  }

  async refundCommitment({
    escrowAddress,
    userWallet,
  }) {
    try {
      console.log('↩️ Refunding commitment...');
      console.log('Escrow:', escrowAddress);
      console.log('User:', userWallet);

      const balance = await this.getEscrowBalance(escrowAddress);
      
      if (balance <= 0) {
        throw new Error('Escrow has no balance to refund');
      }

      const rentExemption = await this.connection.getMinimumBalanceForRentExemption(0);
      const refundAmount = balance - (rentExemption / LAMPORTS_PER_SOL);

      const signature = await this.releaseEscrow({
        escrowAddress,
        destinationWallet: userWallet,
        amount: refundAmount,
      });

      console.log('✅ Commitment refunded:', signature);
      return signature;
    } catch (error) {
      console.error('Error refunding commitment:', error);
      throw error;
    }
  }

  async batchReleaseEscrows(commitments, destinationWallet) {
    try {
      console.log(`🔓 Batch releasing ${commitments.length} escrows...`);

      const results = [];
      for (const commitment of commitments) {
        try {
          const signature = await this.releaseEscrow({
            escrowAddress: commitment.escrowAddress,
            destinationWallet,
            amount: commitment.amountSOL,
          });
          results.push({ success: true, signature, commitment });
        } catch (error) {
          console.error(`Failed to release escrow ${commitment.escrowAddress}:`, error);
          results.push({ success: false, error: error.message, commitment });
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Released ${successCount}/${commitments.length} escrows`);

      return results;
    } catch (error) {
      console.error('Error in batch release:', error);
      throw error;
    }
  }
}

module.exports = new EscrowService();
