# 🪙 $PEPETOR Token Deployment Guide

**Complete step-by-step guide to deploy the $PEPETOR token on Solana mainnet in 7 days**

---

## 📋 Prerequisites

Before starting, you'll need:

### 1. **Solana CLI Tools**
```bash
# macOS
brew install solana

# Linux
sh -c "$(curl -sSfL https://release.solana.com/v1.18.8/install)"

# Windows
https://docs.solana.com/cli/install-solana-cli-tools-windows

# Verify installation
solana --version
```

### 2. **Node.js Dependencies**
```bash
cd backend
npm install @solana/web3.js @solana/spl-token dotenv
```

### 3. **Funding**
- **Testnet**: Free SOL from faucet (for testing)
- **Mainnet**: ~2 SOL in wallet (~$50 USD) for deployment + transactions
  - Get SOL from: Coinbase, Kraken, Phantom wallet swap, or FTX

### 4. **Wallets**
Create 5 Solana wallets (use **Phantom** or **Solflare**):

| Wallet | Purpose | Allocation |
|--------|---------|-----------|
| **Deployer** | Deploys token, creates mint | Needs ~2 SOL |
| **Dev/Treasury** | Team/operations | 200M PEPETOR (20%) |
| **Public Sale** | Community sale | 400M PEPETOR (40%) |
| **Liquidity Pool** | DEX liquidity | 250M PEPETOR (25%) |
| **Rewards Pool** | Miner rewards | 150M PEPETOR (15%) |

---

## 📅 7-Day Timeline

### **Day 1-2: Setup & Testnet Testing**
- [ ] Set up Solana CLI
- [ ] Export wallet private keys
- [ ] Configure .env files
- [ ] Deploy token to **devnet**
- [ ] Test reward system

### **Day 3-4: Prepare for Mainnet**
- [ ] Get mainnet SOL funding
- [ ] Final code review
- [ ] Create deployment scripts
- [ ] Security audit checklist

### **Day 5: Mainnet Deployment**
- [ ] Deploy token to **mainnet**
- [ ] Distribute tokens to wallets
- [ ] Verify on SolScan
- [ ] Update contract addresses in backend

### **Day 6: Integration & Testing**
- [ ] Integrate reward system
- [ ] Test claim functionality
- [ ] Load test batch operations
- [ ] Create documentation

### **Day 7: Launch**
- [ ] Final security check
- [ ] Go live with limited beta
- [ ] Monitor for issues
- [ ] Public announcement

---

## 🛠️ Setup Instructions

### Step 1: Export Wallet Private Keys

**From Phantom Wallet:**
1. Settings → Security and privacy → Private key → Reveal
2. Copy the private key (starts with `[number,number,...]`)
3. Save to safe location

**Alternative (Solana CLI):**
```bash
solana config set --keypair /path/to/wallet.json

# Get public key
solana address

# Get private key
cat /path/to/wallet.json
```

### Step 2: Configure Environment Files

**Backend `.env` file:**

```env
# ========================
# SOLANA CONFIGURATION
# ========================

# Network: devnet | testnet | mainnet-beta
SOLANA_NETWORK=devnet

# RPC Endpoint
SOLANA_RPC_URL=https://api.devnet.solana.com

# Deployer wallet private key (KEEP SECURE!)
# Format: [1,2,3,...] from Phantom or Solana CLI
SOLANA_PAYER_SECRET_KEY='[1,2,3,...]'

# Wallet addresses (public keys)
DEV_TREASURY_WALLET=YourDevWalletPublicKey
PUBLIC_SALE_WALLET=YourPublicSaleWalletPublicKey
LIQUIDITY_POOL_WALLET=YourLiqPoolWalletPublicKey
REWARDS_WALLET=YourRewardsWalletPublicKey

# Backend service wallet (for reward distribution)
SOLANA_BACKEND_KEY='[1,2,3,...]'  # Different from payer for security

# Token addresses (set after deployment)
SOLANA_PEPETOR_MINT=TokenMintAddressGoesHere
SOLANA_REWARD_WALLET=RewardWalletTokenAccountHere

# Reward pool size (initial allocation for rewards)
SOLANA_REWARD_POOL_REMAINING=150000000
```

### Step 3: Testnet Deployment

**Get testnet SOL:**
```bash
solana airdrop 10 --url devnet
```

**Deploy token to devnet:**
```bash
cd backend/solana
node create-token.js
```

**Expected output:**
```
✅ Token mint created: 5uGe...
✅ Mint address saved to: token-mint.json
✅ Removed mint authority - supply is now immutable
🎉 $PEPETOR TOKEN SUCCESSFULLY CREATED!
```

### Step 4: Test Reward System

**Start backend:**
```bash
npm run dev
```

**Test reward endpoints:**
```bash
# Record a mining session
curl -X POST http://localhost:3001/api/rewards/session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "durationMinutes": 60,
    "bytesTransferred": 1000000,
    "uptimePercentage": 100
  }'

# Check reward status
curl http://localhost:3001/api/rewards/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Claim rewards
curl -X POST http://localhost:3001/api/rewards/claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"walletAddress": "YourSolanaWallet"}'
```

---

## 🚀 Mainnet Deployment

### Step 1: Update Environment for Mainnet

**Backend `.env`:**
```env
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PAYER_SECRET_KEY='[your_mainnet_deployer_key]'
# ... update all wallet addresses ...
```

### Step 2: Deploy to Mainnet

```bash
cd backend/solana
node create-token.js
```

**This will:**
1. ✅ Create token mint on mainnet
2. ✅ Create token accounts for 4 wallets
3. ✅ Mint 1B tokens (250M to each wallet)
4. ✅ Remove mint authority (immutable)
5. ✅ Save configuration to `launch-config.json`

### Step 3: Verify on SolScan

Go to https://solscan.io and search for your mint address

**Verify:**
- [ ] Total supply: 1,000,000,000 PEPETOR
- [ ] Decimals: 8
- [ ] Mint authority: ❌ None (immutable)
- [ ] Freeze authority: ❌ None
- [ ] Token accounts: 4 wallets with tokens

### Step 4: Update Backend Configuration

Copy the mint address from `launch-config.json`:

**Backend `.env`:**
```env
SOLANA_PEPETOR_MINT=YOUR_MINT_ADDRESS_HERE
SOLANA_REWARD_WALLET=YOUR_REWARD_WALLET_TOKEN_ACCOUNT
```

---

## 💻 Integration with PEPETOR-MINER

### Step 1: Update User Model

**`backend/src/models/User.js`** - Add reward fields:

```javascript
const userSchema = new Schema({
  // ... existing fields ...
  
  // Reward system
  pendingRewards: {
    type: Number,
    default: 0,
    description: 'PEPETOR tokens waiting to be claimed'
  },
  claimedRewards: {
    type: Number,
    default: 0,
    description: 'PEPETOR tokens already claimed'
  },
  totalPepetorEarned: {
    type: Number,
    default: 0,
    description: 'Total PEPETOR earned (claimed + pending)'
  },
  
  // Wallet
  solanaWallet: {
    type: String,
    description: 'User\'s Solana wallet address for receiving rewards'
  },
  
  // Mining history
  miningSessions: [{
    startTime: Date,
    duration: Number,
    reward: Number,
    bytesTransferred: Number,
    peerId: String
  }],
  
  // Claims
  claimHistory: [{
    amount: Number,
    wallet: String,
    txHash: String,
    date: Date
  }],
  lastRewardClaim: Date,
  lastClaimTx: String,
  
  // Referrals
  referrals: {
    type: Number,
    default: 0
  },
  referralBonuses: [{
    referredUserId: String,
    bonus: Number,
    date: Date
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Step 2: Register Routes

**`backend/src/index.js`:**

```javascript
const rewardRoutes = require('./routes/rewardRoutes');

// Add to Express app
app.use('/api/rewards', rewardRoutes);
```

### Step 3: Add to Package.json Scripts

**`backend/package.json`:**

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "token:create": "node solana/create-token.js",
    "token:test": "node solana/test-rewards.js",
    "rewards:distribute": "node solana/distribute-tokens.js"
  }
}
```

### Step 4: Frontend Integration

**`frontend/src/components/RewardsPanel.jsx`:**

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function RewardsPanel() {
  const [rewards, setRewards] = useState({
    pending: 0,
    earned: 0,
    claimed: 0,
    wallet: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await axios.get('/api/rewards/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRewards(response.data.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    const wallet = prompt('Enter your Solana wallet address:');
    if (!wallet) return;

    try {
      const response = await axios.post('/api/rewards/claim', 
        { walletAddress: wallet },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert(`Successfully claimed ${response.data.data.amount} PEPETOR!`);
      fetchRewards();
    } catch (error) {
      alert(`Error: ${error.response?.data?.error}`);
    }
  };

  if (loading) return <div>Loading rewards...</div>;

  return (
    <div className="rewards-panel">
      <h2>💰 Rewards</h2>
      <div className="rewards-info">
        <p>Pending: {rewards.pending.toFixed(2)} PEPETOR</p>
        <p>Total Earned: {rewards.earned.toFixed(2)} PEPETOR</p>
        <p>Claimed: {rewards.claimed.toFixed(2)} PEPETOR</p>
      </div>
      {rewards.pending > 1 && (
        <button onClick={handleClaim}>Claim {rewards.pending.toFixed(2)} PEPETOR</button>
      )}
    </div>
  );
}
```

---

## 🔐 Security Checklist

Before mainnet launch, verify:

### Wallet Security
- [ ] Private keys stored securely (NOT in git)
- [ ] Environment variables used for all keys
- [ ] Backup keys in secure location (encrypted)
- [ ] Never share private keys

### Smart Contract Security
- [ ] Mint authority removed ✅ (supply immutable)
- [ ] Freeze authority not set ✅ (no account freezing)
- [ ] Decimals correct (8) ✅
- [ ] Total supply correct (1B) ✅

### Backend Security
- [ ] Rate limiting on claim endpoint
- [ ] Input validation on wallet addresses
- [ ] SQL injection protection (Mongoose handles)
- [ ] CORS properly configured
- [ ] JWT tokens validated

### Network Security
- [ ] HTTPS only on production
- [ ] Backend key separate from payer key
- [ ] Reward pool limited per day
- [ ] Transaction monitoring enabled

### Testing
- [ ] [ ] Testnet deployment successful
- [ ] Reward calculations tested
- [ ] Claim transactions successful
- [ ] Leaderboard working
- [ ] No transaction errors

---

## 📊 Monitoring & Maintenance

### Post-Launch Monitoring

**Daily Checks:**
```bash
# Check reward pool balance
curl https://api.mainnet-beta.solana.com \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getTokenAccountBalance",
    "params": ["YOUR_REWARD_WALLET_TOKEN_ACCOUNT"]
  }'

# Check transaction history
solana confirm -v TRANSACTION_SIGNATURE

# Monitor backend logs
tail -f backend/logs/app.log
```

**Weekly Reports:**
- Total PEPETOR distributed
- Active users/miners
- Average reward per user
- Transaction success rate
- Any errors or issues

---

## 🎯 Success Criteria

✅ **Deployment Complete When:**

1. Token mint created on mainnet
2. All wallet accounts funded
3. Mint authority removed (immutable)
4. Backend reward system integrated
5. Frontend displaying rewards
6. User can claim PEPETOR to wallet
7. Transaction verified on SolScan
8. Leaderboard showing top miners
9. No transaction errors for 24 hours
10. Mainnet liquidity pool established

---

## 🆘 Troubleshooting

### Error: "Insufficient SOL"
**Solution:** Fund deployer wallet with more SOL
```bash
solana transfer <destination> <amount> --allow-unfunded-recipient
```

### Error: "Invalid keypair"
**Solution:** Ensure private key format is correct `[1,2,3,...]`

### Error: "Mint authority still set"
**Solution:** Token creation failed to remove authority, retry

### Error: "Invalid wallet address"
**Solution:** Verify Solana address format (44 chars, base58)

### Claim transaction fails
**Solution:**
- Check reward pool has tokens
- Verify backend private key is correct
- Ensure user wallet account exists

---

## 📞 Support

**Resources:**
- Solana Docs: https://docs.solana.com
- SolScan Explorer: https://solscan.io
- Phantom Wallet: https://phantom.app
- SPL Token Documentation: https://github.com/solana-labs/solana-program-library

**Community:**
- Solana Discord: https://discord.gg/solana
- PEPETOR Issues: Create GitHub issue

---

## 🎉 Launch Announcement Template

```
🚀 Exciting news! $PEPETOR token is now LIVE on Solana mainnet!

📊 Tokenomics:
• Total Supply: 1 Billion PEPETOR
• Dev/Treasury: 200M (20%)
• Public Sale: 400M (40%)
• Liquidity Pool: 250M (25%)
• Rewards Pool: 150M (15%)

💰 How to earn:
1. Run the PepeTor miner
2. Earn PEPETOR tokens per minute of mining
3. Claim rewards directly to your wallet
4. Trade on DEXes (coming soon)

🔗 Token Address: [MINT_ADDRESS]
📱 Get started: https://pepetor-miner.com
💬 Questions? Join our Discord!

#Solana #PEPETOR #DeFi #Mining
```

---

**🎯 You're ready to launch $PEPETOR! Follow this guide day by day for guaranteed success.** ✅