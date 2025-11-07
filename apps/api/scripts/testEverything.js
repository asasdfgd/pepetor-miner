const { Connection, Keypair, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getAccount } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TESTS = [];
let passed = 0;
let failed = 0;

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function test(name, fn) {
  TESTS.push({ name, fn });
}

async function runTests() {
  log('🧪', '='.repeat(60));
  log('🧪', 'PEPETOR MINER - COMPREHENSIVE TEST SUITE');
  log('🧪', '='.repeat(60));
  
  for (const { name, fn } of TESTS) {
    try {
      log('▶️ ', `Testing: ${name}`);
      await fn();
      log('✅', `PASSED: ${name}`);
      passed++;
    } catch (error) {
      log('❌', `FAILED: ${name}`);
      console.error('   Error:', error.message);
      failed++;
    }
    console.log('');
  }
  
  log('📊', '='.repeat(60));
  log('📊', 'TEST RESULTS');
  log('📊', '='.repeat(60));
  log('✅', `Passed: ${passed}/${TESTS.length}`);
  log('❌', `Failed: ${failed}/${TESTS.length}`);
  
  if (failed === 0) {
    log('🎉', 'ALL TESTS PASSED! Ready for deployment.');
  } else {
    log('⚠️ ', 'Some tests failed. Fix issues before deployment.');
    process.exit(1);
  }
}

test('Environment variables are configured', () => {
  const required = [
    'SOLANA_NETWORK',
    'SOLANA_RPC_URL',
    'PEPETOR_MINT_ADDRESS',
    'TREASURY_WALLET_PATH',
    'REWARDS_WALLET_PATH'
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
  
  log('  ', `Network: ${process.env.SOLANA_NETWORK}`);
  log('  ', `RPC: ${process.env.SOLANA_RPC_URL}`);
  log('  ', `Mint: ${process.env.PEPETOR_MINT_ADDRESS}`);
});

test('Wallet files exist', () => {
  const walletPaths = [
    process.env.TREASURY_WALLET_PATH,
    process.env.REWARDS_WALLET_PATH
  ];
  
  for (const walletPath of walletPaths) {
    const fullPath = path.join(__dirname, '..', walletPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Wallet file not found: ${fullPath}`);
    }
    log('  ', `Found: ${walletPath}`);
  }
});

test('Can connect to Solana RPC', async () => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
  const version = await connection.getVersion();
  log('  ', `Connected to Solana ${version['solana-core']}`);
});

test('Token mint exists on-chain', async () => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
  const mintPubkey = new PublicKey(process.env.PEPETOR_MINT_ADDRESS);
  const mintInfo = await connection.getAccountInfo(mintPubkey);
  
  if (!mintInfo) {
    throw new Error('Token mint not found on-chain');
  }
  
  log('  ', `Token mint verified: ${mintPubkey.toString()}`);
});

test('Treasury wallet has SOL balance', async () => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
  const treasuryPath = path.join(__dirname, '..', process.env.TREASURY_WALLET_PATH);
  const treasuryData = JSON.parse(fs.readFileSync(treasuryPath, 'utf-8'));
  const treasury = Keypair.fromSecretKey(new Uint8Array(treasuryData));
  
  const balance = await connection.getBalance(treasury.publicKey);
  const solBalance = balance / LAMPORTS_PER_SOL;
  
  log('  ', `Treasury: ${treasury.publicKey.toString()}`);
  log('  ', `Balance: ${solBalance.toFixed(4)} SOL`);
  
  if (balance < 0.001 * LAMPORTS_PER_SOL) {
    throw new Error('Treasury wallet needs more SOL for transaction fees');
  }
});

test('Rewards wallet has SOL balance', async () => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
  const rewardsPath = path.join(__dirname, '..', process.env.REWARDS_WALLET_PATH);
  const rewardsData = JSON.parse(fs.readFileSync(rewardsPath, 'utf-8'));
  const rewards = Keypair.fromSecretKey(new Uint8Array(rewardsData));
  
  const balance = await connection.getBalance(rewards.publicKey);
  const solBalance = balance / LAMPORTS_PER_SOL;
  
  log('  ', `Rewards: ${rewards.publicKey.toString()}`);
  log('  ', `Balance: ${solBalance.toFixed(4)} SOL`);
  
  if (balance < 0.001 * LAMPORTS_PER_SOL) {
    throw new Error('Rewards wallet needs more SOL for transaction fees');
  }
});

test('Rewards wallet has $PEPETOR tokens', async () => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
  const rewardsPath = path.join(__dirname, '..', process.env.REWARDS_WALLET_PATH);
  const rewardsData = JSON.parse(fs.readFileSync(rewardsPath, 'utf-8'));
  const rewards = Keypair.fromSecretKey(new Uint8Array(rewardsData));
  const mintPubkey = new PublicKey(process.env.PEPETOR_MINT_ADDRESS);
  
  const ata = await getAssociatedTokenAddress(mintPubkey, rewards.publicKey);
  const tokenAccount = await getAccount(connection, ata);
  const balance = Number(tokenAccount.amount) / 1e9;
  
  log('  ', `Token Balance: ${balance.toLocaleString()} $PEPETOR`);
  
  if (balance < 1000) {
    throw new Error('Rewards wallet needs more $PEPETOR tokens for testing');
  }
});

test('tokenService can load correctly', () => {
  const tokenService = require('../src/services/tokenService');
  
  if (typeof tokenService.sendPepetorReward !== 'function') {
    throw new Error('tokenService.sendPepetorReward is not a function');
  }
  
  if (typeof tokenService.getPepetorBalance !== 'function') {
    throw new Error('tokenService.getPepetorBalance is not a function');
  }
  
  log('  ', 'tokenService functions available');
});

test('API server is running', async () => {
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  
  try {
    const response = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
    log('  ', `Server responding at ${apiUrl}`);
  } catch (error) {
    throw new Error(`API server not reachable at ${apiUrl}. Start it with: npm run dev`);
  }
});

test('MongoDB connection works', async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not configured');
  }
  
  const mongoose = require('mongoose');
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  
  const state = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState];
  log('  ', `MongoDB: ${state}`);
  
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB not connected');
  }
});

test('Can create test user with wallet', async () => {
  const mongoose = require('mongoose');
  const User = require('../src/models/User');
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  
  const testWallet = Keypair.generate().publicKey.toString();
  
  let user = await User.findOne({ walletAddress: testWallet });
  if (!user) {
    user = new User({
      walletAddress: testWallet,
      credits: 0
    });
    await user.save();
  }
  
  log('  ', `Test user created: ${testWallet.substring(0, 8)}...`);
  
  await User.deleteOne({ walletAddress: testWallet });
});

test('Session model has tokenTransferSignature field', async () => {
  const mongoose = require('mongoose');
  const Session = require('../src/models/Session');
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  
  const schema = Session.schema.obj;
  if (!schema.tokenTransferSignature) {
    throw new Error('Session model missing tokenTransferSignature field');
  }
  
  log('  ', 'Session model schema valid');
});

test('Can simulate token transfer (dry run)', async () => {
  const tokenService = require('../src/services/tokenService');
  
  const originalMode = process.env.SIMULATION_MODE;
  process.env.SIMULATION_MODE = 'true';
  
  const testWallet = Keypair.generate().publicKey.toString();
  const amount = 10;
  
  const result = await tokenService.sendPepetorReward(testWallet, amount);
  
  if (!result.signature) {
    throw new Error('No signature returned from simulation');
  }
  
  log('  ', `Simulated tx: ${result.signature}`);
  
  process.env.SIMULATION_MODE = originalMode;
});

test('Frontend can parse wallet addresses', () => {
  const testAddress = 'DUWzsLTbyWcaBAd9SrJEQvoD7yn9wKa7xeCYYLPP9EeP';
  
  try {
    new PublicKey(testAddress);
    log('  ', 'PublicKey validation works');
  } catch (error) {
    throw new Error('PublicKey validation failed');
  }
});

test('All required npm packages installed', () => {
  const packages = [
    '@solana/web3.js',
    '@solana/spl-token',
    'mongoose',
    'express',
    'axios'
  ];
  
  for (const pkg of packages) {
    try {
      require(pkg);
      log('  ', `✓ ${pkg}`);
    } catch (error) {
      throw new Error(`Missing package: ${pkg}. Run: npm install ${pkg}`);
    }
  }
});

test('Frontend .env configured', () => {
  const webEnvPath = path.join(__dirname, '../../web/.env');
  
  if (!fs.existsSync(webEnvPath)) {
    throw new Error('Frontend .env file missing at apps/web/.env');
  }
  
  const envContent = fs.readFileSync(webEnvPath, 'utf-8');
  if (!envContent.includes('VITE_API_BASE_URL')) {
    throw new Error('Frontend .env missing VITE_API_BASE_URL');
  }
  
  log('  ', 'Frontend environment configured');
});

test('Treasury wallet can receive fees', async () => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
  const treasuryPath = path.join(__dirname, '..', process.env.TREASURY_WALLET_PATH);
  const treasuryData = JSON.parse(fs.readFileSync(treasuryPath, 'utf-8'));
  const treasury = Keypair.fromSecretKey(new Uint8Array(treasuryData));
  const mintPubkey = new PublicKey(process.env.PEPETOR_MINT_ADDRESS);
  
  const ata = await getAssociatedTokenAddress(mintPubkey, treasury.publicKey);
  
  try {
    const tokenAccount = await getAccount(connection, ata);
    log('  ', `Treasury ATA exists: ${ata.toString()}`);
  } catch (error) {
    throw new Error('Treasury token account not initialized. Run deployToken.js first.');
  }
});

runTests();
