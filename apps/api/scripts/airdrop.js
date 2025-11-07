const { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function requestAirdrop() {
  const keypairPath = path.join(__dirname, '../.solana-keypair.json');
  
  if (!fs.existsSync(keypairPath)) {
    console.error('❌ Keypair not found. Run createToken.js first.');
    process.exit(1);
  }

  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
  console.log('💰 Requesting airdrop for:', keypair.publicKey.toString());
  
  try {
    const signature = await connection.requestAirdrop(
      keypair.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    
    console.log('⏳ Confirming transaction...');
    await connection.confirmTransaction(signature);
    
    const balance = await connection.getBalance(keypair.publicKey);
    console.log('✅ Airdrop successful!');
    console.log('💰 New balance:', balance / LAMPORTS_PER_SOL, 'SOL');
    
  } catch (error) {
    console.error('❌ Airdrop failed:', error.message);
    console.log('\n💡 Try the web faucet:');
    console.log('   https://faucet.solana.com');
    console.log('   Address:', keypair.publicKey.toString());
  }
}

requestAirdrop();
