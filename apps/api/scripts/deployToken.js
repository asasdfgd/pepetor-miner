const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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
  setAuthority,
  AuthorityType,
} = require('@solana/spl-token');
const fs = require('fs');

const NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';
const TOKEN_DECIMALS = 9;
const TOTAL_SUPPLY = 1_000_000_000;

const ALLOCATIONS = {
  treasury: { percent: 20, name: 'Treasury (Multisig)' },
  liquidity: { percent: 10, name: 'Liquidity Pool' },
  marketing: { percent: 5, name: 'Marketing/Ops' },
  rewards: { percent: 15, name: 'Rewards/Airdrop' },
  team: { percent: 20, name: 'Team/Vesting' },
  cex: { percent: 10, name: 'CEX/Market Making' },
  partnerships: { percent: 10, name: 'Partnerships/Grants' },
  buyback: { percent: 5, name: 'Buyback/Burn' },
  community: { percent: 5, name: 'Community Reserve' },
};

async function deployPepetorToken() {
  console.log(`🚀 DEPLOYING $PEPETOR TOKEN ON SOLANA ${NETWORK.toUpperCase()}\n`);
  console.log('⚠️  This will create the token and distribute to 9 wallets\n');
  
  const connection = new Connection(
    clusterApiUrl(NETWORK),
    'confirmed'
  );

  let deployer;
  const deployerPath = path.join(__dirname, '../.wallets/deployer.json');
  const walletsDir = path.join(__dirname, '../.wallets');
  
  if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir, { recursive: true });
  }

  if (fs.existsSync(deployerPath)) {
    console.log('📂 Loading existing deployer keypair...');
    const keypairData = JSON.parse(fs.readFileSync(deployerPath, 'utf-8'));
    deployer = Keypair.fromSecretKey(new Uint8Array(keypairData));
  } else {
    console.log('🔑 Generating deployer keypair...');
    deployer = Keypair.generate();
    fs.writeFileSync(
      deployerPath,
      JSON.stringify(Array.from(deployer.secretKey))
    );
    console.log('💾 Deployer keypair saved to .wallets/deployer.json');
    console.log('⚠️  IMPORTANT: Fund this address with ~0.05 SOL for gas fees');
    console.log('📍 Deployer Address:', deployer.publicKey.toString());
    console.log('\n💰 Send SOL from Phantom/Exchange to this address');
    console.log('💰 Cost: ~$10 worth of SOL\n');
    
    process.exit(0);
  }

  console.log('🔐 Deployer Address:', deployer.publicKey.toString());

  const balance = await connection.getBalance(deployer.publicKey);
  console.log('💰 Deployer Balance:', (balance / 1e9).toFixed(4), 'SOL\n');

  if (balance < 0.01 * 1e9) {
    console.error('❌ Insufficient SOL balance (need ~0.05 SOL)');
    console.error('   Address:', deployer.publicKey.toString());
    console.error('   Current:', (balance / 1e9).toFixed(4), 'SOL');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════');
  console.log('STEP 1: GENERATING ALL WALLET KEYPAIRS');
  console.log('═══════════════════════════════════════════════\n');

  const wallets = {};
  
  for (const [key, config] of Object.entries(ALLOCATIONS)) {
    const walletPath = path.join(walletsDir, `${key}.json`);
    
    if (fs.existsSync(walletPath)) {
      const keypairData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
      wallets[key] = Keypair.fromSecretKey(new Uint8Array(keypairData));
      console.log(`✓ ${config.name}: ${wallets[key].publicKey.toString()} (existing)`);
    } else {
      wallets[key] = Keypair.generate();
      fs.writeFileSync(
        walletPath,
        JSON.stringify(Array.from(wallets[key].secretKey))
      );
      console.log(`✓ ${config.name}: ${wallets[key].publicKey.toString()} (new)`);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('STEP 2: CREATING TOKEN MINT');
  console.log('═══════════════════════════════════════════════\n');

  console.log('🪙 Creating $PEPETOR mint...');
  const mint = await createMint(
    connection,
    deployer,
    deployer.publicKey,
    deployer.publicKey,
    TOKEN_DECIMALS,
    undefined,
    { commitment: 'confirmed' },
    TOKEN_PROGRAM_ID
  );

  console.log('✅ Token Mint Created:', mint.toString());
  console.log(`🔗 https://solscan.io/token/${mint.toString()}\n`);

  console.log('═══════════════════════════════════════════════');
  console.log('STEP 3: DISTRIBUTING TOKENS TO WALLETS');
  console.log('═══════════════════════════════════════════════\n');

  const distribution = {};

  for (const [key, config] of Object.entries(ALLOCATIONS)) {
    const wallet = wallets[key];
    const amount = Math.floor((TOTAL_SUPPLY * config.percent / 100) * Math.pow(10, TOKEN_DECIMALS));
    
    console.log(`💰 ${config.name} (${config.percent}%)...`);
    
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      deployer,
      mint,
      wallet.publicKey
    );

    await mintTo(
      connection,
      deployer,
      mint,
      tokenAccount.address,
      deployer,
      amount
    );

    const tokens = (amount / Math.pow(10, TOKEN_DECIMALS)).toLocaleString();
    console.log(`   ✓ Minted ${tokens} $PEPETOR`);
    console.log(`   ✓ Token Account: ${tokenAccount.address.toString()}`);
    console.log(`   ✓ Owner: ${wallet.publicKey.toString()}\n`);

    distribution[key] = {
      name: config.name,
      percent: config.percent,
      tokens: tokens,
      wallet: wallet.publicKey.toString(),
      tokenAccount: tokenAccount.address.toString(),
    };
  }

  console.log('═══════════════════════════════════════════════');
  console.log('STEP 4: REVOKING MINT AUTHORITY (OPTIONAL)');
  console.log('═══════════════════════════════════════════════\n');

  console.log('⚠️  Mint authority is still held by deployer');
  console.log('   You can revoke it or transfer to Treasury multisig');
  console.log('   To revoke permanently, uncomment the code below\n');

  console.log('═══════════════════════════════════════════════');
  console.log('DEPLOYMENT COMPLETE!');
  console.log('═══════════════════════════════════════════════\n');

  const summary = {
    network: NETWORK,
    mintAddress: mint.toString(),
    deployer: deployer.publicKey.toString(),
    totalSupply: TOTAL_SUPPLY.toLocaleString(),
    decimals: TOKEN_DECIMALS,
    distribution,
    createdAt: new Date().toISOString(),
    explorerUrl: `https://solscan.io/token/${mint.toString()}`,
  };

  const summaryPath = path.join(walletsDir, 'deployment-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('📋 DEPLOYMENT SUMMARY:');
  console.log('   Network:', NETWORK);
  console.log('   Mint Address:', mint.toString());
  console.log('   Total Supply:', TOTAL_SUPPLY.toLocaleString(), '$PEPETOR');
  console.log('   Decimals:', TOKEN_DECIMALS);
  console.log('\n📊 DISTRIBUTION:');
  
  for (const [key, info] of Object.entries(distribution)) {
    console.log(`   ${info.name}: ${info.tokens} $PEPETOR (${info.percent}%)`);
  }

  console.log('\n💾 Files saved to .wallets/');
  console.log('   - deployment-summary.json (full details)');
  console.log('   - deployer.json (KEEP SECRET)');
  for (const key of Object.keys(ALLOCATIONS)) {
    console.log(`   - ${key}.json (KEEP SECRET)`);
  }

  console.log('\n🔒 SECURITY CHECKLIST:');
  console.log('   [ ] Backup all .json files to encrypted vault');
  console.log('   [ ] Store Treasury, Team, CEX keys in hardware wallet');
  console.log('   [ ] Setup Squads multisig for Treasury wallet');
  console.log('   [ ] Never commit .wallets/ folder to git');
  console.log('   [ ] Consider revoking mint authority');

  console.log('\n🚀 NEXT STEPS FOR DEXSCREENER:');
  console.log('   1. Transfer liquidity tokens from Liquidity Wallet');
  console.log('   2. Create Raydium pool (use liquidity wallet)');
  console.log('   3. DexScreener will auto-detect within 5-10 min');
  console.log('   4. Claim token page: https://dexscreener.com/solana/' + mint.toString());
  console.log('   5. Lock LP tokens via Unicrypt or on-chain lock');

  console.log('\n⚠️  IMPORTANT: Add .wallets/ to .gitignore NOW!');
}

deployPepetorToken().catch(console.error);
