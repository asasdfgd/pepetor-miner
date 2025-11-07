const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Keypair, Connection, clusterApiUrl, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { Market } = require('@openbook-dex/openbook');
const { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const BN = require('bn.js');
const fs = require('fs');

async function createMarketAndPool() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('❌ Usage: node createMarketAndPool.js <MINT_ADDRESS> <LIQUIDITY_SOL> <LIQUIDITY_TOKENS>');
    console.log('');
    console.log('Example:');
    console.log('  node createMarketAndPool.js ABC...xyz 2 20000000');
    console.log('');
    console.log('  This will create:');
    console.log('    - OpenBook Market ID');
    console.log('    - Raydium Pool with 2 SOL + 20M tokens');
    process.exit(1);
  }

  const mintAddress = args[0];
  const liquiditySOL = parseFloat(args[1]);
  const liquidityTokens = parseFloat(args[2]);

  console.log('🏪 CREATING OPENBOOK MARKET & RAYDIUM POOL\n');
  console.log('Configuration:');
  console.log(`  Token Mint: ${mintAddress}`);
  console.log(`  Liquidity: ${liquiditySOL} SOL + ${liquidityTokens.toLocaleString()} tokens`);
  console.log('');

  const network = process.env.SOLANA_NETWORK || 'mainnet-beta';
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || clusterApiUrl(network),
    'confirmed'
  );

  const deployerPath = path.join(__dirname, '../.wallets/deployer.json');
  if (!fs.existsSync(deployerPath)) {
    console.error('❌ Deployer wallet not found');
    process.exit(1);
  }

  const deployerData = JSON.parse(fs.readFileSync(deployerPath, 'utf-8'));
  const deployer = Keypair.fromSecretKey(new Uint8Array(deployerData));

  const balance = await connection.getBalance(deployer.publicKey);
  const requiredBalance = (liquiditySOL + 1) * 1e9;

  if (balance < requiredBalance) {
    console.error(`❌ Insufficient SOL. Need ${requiredBalance / 1e9} SOL, have ${balance / 1e9} SOL`);
    process.exit(1);
  }

  console.log('💰 Deployer Balance:', (balance / 1e9).toFixed(4), 'SOL');
  console.log('');

  console.log('⚠️  MANUAL STEPS REQUIRED:\n');
  console.log('Due to the complexity of OpenBook/Raydium integration, please follow these steps:\n');
  
  console.log('STEP 1: Create OpenBook Market ID');
  console.log('  1. Go to: https://dexlab.space/market/create');
  console.log(`  2. Base Token: ${mintAddress}`);
  console.log('  3. Quote Token: SOL (So11111111111111111111111111111111111111112)');
  console.log('  4. Min Order Size: 1');
  console.log('  5. Price Tick: 0.00001');
  console.log('  6. Cost: ~0.4 SOL');
  console.log('  7. Save the Market ID!\n');

  console.log('STEP 2: Create Raydium Pool');
  console.log('  1. Go to: https://raydium.io/liquidity/create/');
  console.log('  2. Paste your Market ID from Step 1');
  console.log(`  3. Add liquidity: ${liquiditySOL} SOL + ${liquidityTokens.toLocaleString()} tokens`);
  console.log('  4. Confirm transaction');
  console.log('  5. Pool is now live!\n');

  console.log('STEP 3: Lock LP Tokens (IMPORTANT!)');
  console.log('  1. Go to: https://uncx.network/services/solana/liquidity-locks');
  console.log('  2. Find your pool LP tokens');
  console.log('  3. Lock for 6-12 months minimum');
  console.log('  4. Cost: ~0.1 SOL\n');

  console.log('STEP 4: DexScreener');
  console.log('  - Auto-detects pools in 5-10 minutes');
  console.log('  - No action needed\n');

  console.log('📝 ALTERNATIVE: Use solauncher.org');
  console.log('  - All-in-one platform');
  console.log('  - Create market: 0.39 SOL (cheaper!)');
  console.log('  - Create pool: integrated UI');
  console.log('  - URL: https://solauncher.org/\n');

  console.log('💡 TIP: Save all transaction signatures and addresses!');
}

createMarketAndPool().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
