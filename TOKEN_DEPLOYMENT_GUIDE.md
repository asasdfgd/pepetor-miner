# 🚀 $PEPETOR Token Creation Guide

**Final step before launching rewards system!**

---

## ⚠️ SECURITY REMINDER

- **NEVER commit the token creation script to git**
- **NEVER share your private keys**
- This script runs **ONCE** to create the token
- After creation, **DELETE** the script file

---

## 📋 Prerequisites

### 1. Solana Wallets (4 Required)
You need 4 **Phantom** or **Solflare** wallet addresses on **Mainnet**:

- **Dev/Treasury Wallet**: For team (200M PEPETOR)
- **Public Sale Wallet**: For public (400M PEPETOR)
- **Liquidity Pool Wallet**: For DEX (250M PEPETOR)
- **Rewards Pool Wallet**: For mining (150M PEPETOR)

### 2. Deployer Wallet with SOL
Separate Solana wallet with **2+ SOL** for fees:
- Get address and private key
- Fund from exchange (Coinbase, Kraken, etc.)

---

## 🔧 Setup

### Step 1: Add Environment Variables

Edit `backend/.env`:

```bash
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PAYER_SECRET_KEY=[your-deployer-private-key-as-numbers]
WALLET_DEV_TREASURY=[dev-wallet]
WALLET_PUBLIC_SALE=[public-wallet]
WALLET_LIQUIDITY_POOL=[liquidity-wallet]
WALLET_REWARDS_POOL=[rewards-wallet]
```

**Convert Phantom private key to numbers format:**
```bash
# From Phantom, get your private key (base58 format)
# Then use: solana-cli or https://cryptotools.net/
# Output should be comma-separated: 123,45,67,89,...

# Or use Node:
node -e "
const keypair = require('@solana/web3.js').Keypair.fromSecretKey(Buffer.from('[YOUR_BASE58_KEY]', 'base58'));
console.log(Array.from(keypair.secretKey).join(','));
"
```

### Step 2: Check Environment

```bash
cd /Users/josephpietravalle/PEPETOR-MINER/backend
cat .env | grep SOLANA
cat .env | grep WALLET
```

---

## ✅ Create Token

### Run Script

The script is at: `~/create-pepetor-token.js`

```bash
node ~/create-pepetor-token.js
```

**What it does:**
1. ✓ Connects to Solana mainnet
2. ✓ Creates SPL token (1B supply, 8 decimals)
3. ✓ Distributes to 4 wallets
4. ✓ **Removes mint authority** (immutable forever)

### Save Output

When complete, you'll see:
```
✅ TOKEN CREATED!
Mint Address: [LONG_ADDRESS]
```

**SAVE THIS MINT ADDRESS!**

---

## 📝 Post-Creation

### Add Mint to .env

```bash
# backend/.env
SOLANA_TOKEN_MINT=[your-mint-address]
```

### Update reward-config.json

```json
{
  "rewardSystem": {
    "tokenMint": "[your-mint-address]",
    "rewardWallet": "[rewards-wallet-address]"
  }
}
```

### Verify on SolScan

Visit: `https://solscan.io/token/[MINT_ADDRESS]?cluster=mainnet`

Check:
- ✓ Total supply: 1,000,000,000
- ✓ Decimals: 8
- ✓ 4 token holders (your wallets)
- ✓ Mint Authority: None (**Immutable!**)

---

## 🚀 Integration

```bash
# Backend
cd /Users/josephpietravalle/PEPETOR-MINER/backend
npm install
npm run dev

# Frontend (new terminal)
cd /Users/josephpietravalle/PEPETOR-MINER/frontend
npm run dev
```

Visit `http://localhost:3000` to test mining and claiming!

---

## 🧪 Quick Test

```bash
# Test mining session
curl -X POST http://localhost:3001/api/rewards/session \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","duration":60,"verified":true}'

# Test claim
curl -X POST http://localhost:3001/api/rewards/claim \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","walletAddress":"[your-wallet]"}'
```

---

## 🔒 Security

- [ ] Private key NOT in git
- [ ] .env in .gitignore
- [ ] Script deleted after creation
- [ ] Mint authority removed (SolScan confirms)
- [ ] All wallets funded correctly

---

## ❌ Troubleshooting

**"Insufficient SOL"**: Add 2+ SOL to deployer wallet
**"Invalid private key"**: Ensure comma-separated numbers format
**"Connection timeout"**: RPC endpoint congested, retry later
**Token doesn't show in Phantom**: Manually add via "Add Token" button

---

## ✅ Done!

Your $PEPETOR token is **LIVE ON MAINNET** with:
- ✓ 1 Billion supply
- ✓ Immutable (permanent)
- ✓ Distributed to 4 wallets
- ✓ Ready for rewards

**Clean up:**
```bash
rm ~/create-pepetor-token.js
```

**Next**: Beta testing and community launch!
