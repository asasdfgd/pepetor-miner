const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} = require('@solana/web3.js');
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

const NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';
const TOKEN_DECIMALS = 9;
const INITIAL_SUPPLY = 1_000_000_000;

async function createPepetorToken() {
  console.log('🚀 Creating $PEPETOR token on Solana', NETWORK);
  
  const connection = new Connection(
    clusterApiUrl(NETWORK),
    'confirmed'
  );

  let mintAuthority;
  const keypairPath = path.join(__dirname, '../.solana-keypair.json');
  
  if (fs.existsSync(keypairPath)) {
    console.log('📂 Loading existing keypair...');
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  } else {
    console.log('🔑 Generating new keypair...');
    mintAuthority = Keypair.generate();
    fs.writeFileSync(
      keypairPath,
      JSON.stringify(Array.from(mintAuthority.secretKey))
    );
    console.log('💾 Keypair saved to', keypairPath);
    console.log('⚠️  IMPORTANT: Fund this address with ~0.01 SOL for gas fees');
    console.log('📍 Address:', mintAuthority.publicKey.toString());
    console.log('💰 Send SOL from Phantom/Exchange to this address');
    console.log('\n⚠️  MAINNET - Real SOL required (~$2-10 USD is plenty)');
    
    process.exit(0);
  }

  console.log('🔐 Mint Authority:', mintAuthority.publicKey.toString());

  const balance = await connection.getBalance(mintAuthority.publicKey);
  console.log('💰 Balance:', balance / 1e9, 'SOL');

  if (balance < 0.01 * 1e9) {
    console.error('❌ Insufficient SOL balance (need ~0.01 SOL). Fund the address first:');
    console.error('   Address:', mintAuthority.publicKey.toString());
    console.error('   Current balance:', (balance / 1e9).toFixed(4), 'SOL');
    console.error('   Send SOL from Phantom or exchange');
    process.exit(1);
  }

  console.log('🪙 Creating token mint...');
  const mint = await createMint(
    connection,
    mintAuthority,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    TOKEN_DECIMALS,
    undefined,
    { commitment: 'confirmed' },
    TOKEN_PROGRAM_ID
  );

  console.log('✅ Token Mint created:', mint.toString());

  console.log('🏦 Creating token account for mint authority...');
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    mintAuthority,
    mint,
    mintAuthority.publicKey
  );

  console.log('💵 Minting initial supply...');
  await mintTo(
    connection,
    mintAuthority,
    mint,
    tokenAccount.address,
    mintAuthority,
    INITIAL_SUPPLY * Math.pow(10, TOKEN_DECIMALS)
  );

  console.log('✅ Minted', INITIAL_SUPPLY.toLocaleString(), '$PEPETOR tokens');

  const config = {
    network: NETWORK,
    mintAddress: mint.toString(),
    mintAuthority: mintAuthority.publicKey.toString(),
    tokenDecimals: TOKEN_DECIMALS,
    initialSupply: INITIAL_SUPPLY,
    createdAt: new Date().toISOString(),
  };

  const configPath = path.join(__dirname, '../.token-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log('\n🎉 $PEPETOR Token Created Successfully!\n');
  console.log('📋 Configuration:');
  console.log('   Network:', NETWORK);
  console.log('   Mint Address:', mint.toString());
  console.log('   Authority:', mintAuthority.publicKey.toString());
  console.log('   Decimals:', TOKEN_DECIMALS);
  console.log('   Initial Supply:', INITIAL_SUPPLY.toLocaleString());
  console.log('\n💾 Config saved to:', configPath);
  console.log('\n🔗 View on Solana Explorer:');
  console.log(`   https://explorer.solana.com/address/${mint.toString()}?cluster=${NETWORK}`);
  console.log('\n⚠️  Keep .solana-keypair.json secure - it controls token minting!');
}

createPepetorToken().catch(console.error);
