const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { setAuthority, AuthorityType } = require('@solana/spl-token');
const fs = require('fs');

async function revokeMintAuthority() {
  console.log('🔒 REVOKING MINT AUTHORITY\n');
  console.log('⚠️  WARNING: This action is IRREVERSIBLE!');
  console.log('⚠️  No more tokens can ever be minted after this.\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise(resolve => {
    readline.question('Are you sure you want to revoke mint authority? (yes/no): ', resolve);
  });
  readline.close();
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled. Mint authority NOT revoked.');
    process.exit(0);
  }
  
  const NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';
  const MINT_ADDRESS = process.env.PEPETOR_MINT_ADDRESS;
  
  if (!MINT_ADDRESS) {
    console.error('❌ PEPETOR_MINT_ADDRESS not set in .env');
    process.exit(1);
  }
  
  const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');
  
  const deployerPath = path.join(__dirname, '../.wallets/deployer.json');
  if (!fs.existsSync(deployerPath)) {
    console.error('❌ Deployer wallet not found');
    process.exit(1);
  }
  
  const deployerData = JSON.parse(fs.readFileSync(deployerPath, 'utf-8'));
  const deployer = Keypair.fromSecretKey(new Uint8Array(deployerData));
  const mintPubkey = new PublicKey(MINT_ADDRESS);
  
  console.log('');
  console.log('🔐 Current Authority:', deployer.publicKey.toString());
  console.log('🪙 Token Mint:', MINT_ADDRESS);
  console.log('🌐 Network:', NETWORK);
  console.log('');
  console.log('🔒 Revoking mint authority...');
  
  try {
    await setAuthority(
      connection,
      deployer,
      mintPubkey,
      deployer,
      AuthorityType.MintTokens,
      null
    );
    
    console.log('✅ Mint authority successfully revoked!');
    console.log('');
    console.log('🎉 Your token is now immutable!');
    console.log('   - Total supply is fixed at 1,000,000,000 $PEPETOR');
    console.log('   - No one can ever mint more tokens');
    console.log('   - This increases trust with your community');
    console.log('');
    console.log('🔗 Verify on Solscan:');
    console.log(`   https://solscan.io/token/${MINT_ADDRESS}`);
    console.log('   Look for "Mint Authority: Disabled"');
    
  } catch (error) {
    console.error('❌ Failed to revoke mint authority:', error.message);
    process.exit(1);
  }
}

revokeMintAuthority();
