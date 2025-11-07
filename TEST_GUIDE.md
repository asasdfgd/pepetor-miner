# 🧪 Complete Testing Guide - PEPETOR Miner

This guide walks through testing **EVERY** component before mainnet deployment.

---

## 📋 Pre-Testing Checklist

- [ ] Node.js 16+ installed
- [ ] MongoDB running
- [ ] Phantom or Solflare wallet installed
- [ ] `apps/api/.env` configured
- [ ] `apps/web/.env` configured

---

## 🔧 Step 1: Configure Devnet Environment

### Backend Configuration

Edit `apps/api/.env`:

```bash
# Solana Configuration (DEVNET)
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PEPETOR_MINT_ADDRESS=          # Will be filled after deployment
TREASURY_WALLET_PATH=.wallets/treasury-keypair.json
REWARDS_WALLET_PATH=.wallets/rewards-keypair.json
SIMULATION_MODE=false
TRANSACTION_FEE_PERCENT=2
```

### Frontend Configuration

Edit `apps/web/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 🪙 Step 2: Deploy Test Token on Devnet

```bash
cd apps/api

# Install dependencies
npm install

# Deploy token to devnet
node scripts/deployToken.js
```

**Expected Output:**
```
🚀 Creating $PEPETOR token on Solana devnet
🔑 Generating deployer keypair...
📍 Deployer: <address>
💰 Requesting 2 SOL from devnet faucet...
🪙 Creating token mint...
✅ Token Mint: <mint_address>
💰 Minting 1,000,000,000 $PEPETOR
...
🎉 Deployment Complete!
```

**Action:** Copy the `PEPETOR_MINT_ADDRESS` to your `.env` file

---

## 🧪 Step 3: Run Automated Test Suite

```bash
cd apps/api
node scripts/testEverything.js
```

This tests:
- ✅ Environment variables configured
- ✅ Wallet files exist
- ✅ Solana RPC connection
- ✅ Token mint exists on-chain
- ✅ Treasury wallet has SOL
- ✅ Rewards wallet has SOL + $PEPETOR
- ✅ tokenService loads correctly
- ✅ API server is running
- ✅ MongoDB connection
- ✅ User model with wallet field
- ✅ Session model with signature field
- ✅ Token transfer simulation
- ✅ Frontend environment configured
- ✅ Treasury can receive fees

**Expected Output:**
```
🧪 ============================================================
🧪 PEPETOR MINER - COMPREHENSIVE TEST SUITE
🧪 ============================================================
✅ PASSED: Environment variables are configured
✅ PASSED: Wallet files exist
...
📊 ============================================================
📊 TEST RESULTS
📊 ============================================================
✅ Passed: 18/18
🎉 ALL TESTS PASSED! Ready for deployment.
```

---

## 🖥️ Step 4: Test Backend API

### Start API Server

```bash
cd apps/api
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 3001
✅ Connected to MongoDB
🔗 CORS enabled for: http://localhost:5173
```

### Test Endpoints Manually

**4.1 Health Check**

```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok"}`

**4.2 Wallet Authentication** (requires frontend running)

---

## 🎨 Step 5: Test Frontend

### Start Frontend

Open **new terminal**:

```bash
cd apps/web
npm install
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

---

## 🔐 Step 6: Test Wallet Connection

1. Open browser to `http://localhost:5173`
2. Switch Phantom/Solflare to **Devnet** (Settings → Network → Devnet)
3. Click "Connect Wallet"
4. Approve connection
5. Check browser console for wallet address
6. Verify backend logs show: `Wallet authenticated: <address>`

**✅ Pass Criteria:**
- Wallet connects without errors
- User created in MongoDB
- UI shows wallet address

---

## 💎 Step 7: Get Devnet SOL for Testing

Your connected wallet needs devnet SOL to pay transaction fees (not for token transfers, just on-chain operations).

**Option 1: Solana Faucet**
```bash
solana airdrop 1 <YOUR_WALLET_ADDRESS> --url devnet
```

**Option 2: Web Faucet**
- Go to https://faucet.solana.com
- Enter your wallet address
- Request 1 SOL

---

## ⛏️ Step 8: Test Mining Session

1. Go to Dashboard
2. Check "Start Mining Session" shows $PEPETOR balance (likely 0)
3. Click "Start Mining Session"
4. Wait 10-30 seconds (monitor logs)
5. Check `BalanceCard` shows session timer
6. Click "Submit Session"

**Backend Logs to Watch:**
```
Session submitted by wallet: <address>
Credits earned: 2.5
Sending 2.5 $PEPETOR to <address>
Fee (2%): 0.05 $PEPETOR to Treasury
Transaction signature: <tx_hash>
Session saved with signature
```

**Frontend Changes:**
- Session timer stops
- Balance updates with new $PEPETOR amount
- Session appears in history with Solscan link

**✅ Pass Criteria:**
- No errors in console/logs
- Transaction signature returned
- Balance increases
- Treasury receives 2% fee

---

## 🔍 Step 9: Verify On-Chain

Copy transaction signature from logs and check Solscan:

```
https://solscan.io/tx/<signature>?cluster=devnet
```

**Verify:**
- ✅ Transaction status: Success
- ✅ Token transfer from Rewards wallet to your wallet
- ✅ Small fee transfer to Treasury wallet
- ✅ Token program invoked

---

## 📊 Step 10: Test Balance Display

1. Check `BalanceCard` component
2. Verify it shows:
   - Your wallet address (truncated)
   - $PEPETOR balance (not credits)
   - "Refresh Balance" button works

**Test:**
```bash
# In browser console
window.solana.publicKey.toString()
```

Compare with displayed address.

---

## 📜 Step 11: Test Session History

1. Navigate to Sessions History page
2. Verify recent session shows:
   - Timestamp
   - Duration
   - $PEPETOR earned
   - Transaction signature (clickable to Solscan)
   - Status: "completed"

**MongoDB Check:**
```bash
# In MongoDB Compass or CLI
db.sessions.find().sort({createdAt: -1}).limit(1)
```

Verify `tokenTransferSignature` field exists.

---

## 💰 Step 12: Test Treasury Fee Collection

```bash
cd apps/api
node scripts/checkTreasuryBalance.js
```

Create this script if needed:

```javascript
const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getAccount } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

async function checkTreasury() {
  const connection = new Connection(process.env.SOLANA_RPC_URL);
  const treasuryPath = path.join(__dirname, '..', process.env.TREASURY_WALLET_PATH);
  const treasuryData = JSON.parse(fs.readFileSync(treasuryPath));
  const treasury = require('@solana/web3.js').Keypair.fromSecretKey(new Uint8Array(treasuryData));
  const mint = new PublicKey(process.env.PEPETOR_MINT_ADDRESS);
  
  const ata = await getAssociatedTokenAddress(mint, treasury.publicKey);
  const account = await getAccount(connection, ata);
  
  console.log('💰 Treasury Balance:', Number(account.amount) / 1e9, '$PEPETOR');
}

checkTreasury();
```

**Expected:** Treasury balance > 0 (2% of all rewards)

---

## 🧪 Step 13: Test Multiple Sessions

Submit 3-5 sessions in a row:

1. Start session → wait → submit
2. Start session → wait → submit
3. Start session → wait → submit

**Check:**
- All sessions succeed
- Balance increases each time
- No duplicate transactions
- Each session has unique signature

---

## ⚠️ Step 14: Test Error Handling

### Test 1: Submit session without wallet connected

**Expected:** Error message "Please connect wallet"

### Test 2: Submit session with 0 duration

**Expected:** Error "Invalid session data"

### Test 3: Check balance with no tokens

**Expected:** Balance shows "0 $PEPETOR"

### Test 4: Backend offline

1. Stop API server
2. Try submitting session
3. **Expected:** Error message "API unavailable"

---

## 🔄 Step 15: Test Auto-Submission

If you have auto-submission enabled:

1. Enable auto-submission in UI
2. Start mining
3. Walk away for 5 minutes
4. Check session history

**Expected:**
- Sessions auto-submitted every X seconds
- Multiple transactions in history
- All successful

---

## 🎯 Step 16: Full End-to-End Test

**Complete User Flow:**

1. **New User:**
   - Clear cookies/localStorage
   - Refresh page
   - Connect wallet
   - Verify new user created in MongoDB

2. **First Session:**
   - Start mining
   - Wait 30 seconds
   - Submit
   - Check balance went from 0 → X $PEPETOR

3. **View History:**
   - Navigate to sessions
   - Click transaction signature
   - Opens Solscan devnet explorer
   - Transaction shows success

4. **Second Session:**
   - Start mining again
   - Submit after 60 seconds
   - Balance increases
   - History shows 2 sessions

5. **Disconnect Wallet:**
   - Disconnect wallet
   - Verify UI shows "Connect Wallet" button
   - Try to start session → blocked

---

## 📱 Step 17: Test All UI Components

### Header Component
- [ ] Logo displays
- [ ] Wallet address shows when connected
- [ ] "Connect Wallet" button works
- [ ] Network badge shows "Devnet"

### BalanceCard Component
- [ ] Shows wallet address
- [ ] Shows $PEPETOR balance (not credits)
- [ ] Refresh button works
- [ ] Balance format: "1,234.56 $PEPETOR"

### AutoMiner Component
- [ ] Start/Stop button toggles
- [ ] Timer increments
- [ ] Shows "$PEPETOR earned" (not credits)
- [ ] Submit button appears after mining

### SessionHistory Component
- [ ] Sessions load from MongoDB
- [ ] Shows transaction signature
- [ ] Solscan link opens in new tab
- [ ] Pagination works (if >10 sessions)

---

## 🛡️ Step 18: Security Checks

```bash
# Check wallet files are gitignored
git status

# Should NOT show:
# .wallets/
# .solana-keypair.json
# .token-config.json
```

```bash
# Verify private keys are not in code
grep -r "secretKey" apps/web/src/
# Should return NO results
```

```bash
# Check .env not committed
git log --all --full-history -- "**/.env"
# Should be empty
```

---

## 🚀 Step 19: Performance Test

Submit 10 sessions rapidly:

```bash
# In browser console
for(let i=0; i<10; i++) {
  setTimeout(() => {
    console.log('Auto-submitting session', i);
    // Click submit button programmatically
  }, i * 5000);
}
```

**Monitor:**
- All transactions succeed
- No rate limiting errors
- No duplicate transactions
- All signatures unique

---

## 📊 Step 20: Final Verification Checklist

Before switching to mainnet:

- [ ] All 18 automated tests pass
- [ ] Wallet connection works
- [ ] Mining sessions submit successfully
- [ ] Token transfers confirmed on Solscan
- [ ] Treasury receives 2% fees
- [ ] Balance updates correctly
- [ ] Session history displays
- [ ] No errors in console
- [ ] No errors in backend logs
- [ ] MongoDB stores sessions correctly
- [ ] Transaction signatures valid
- [ ] UI shows $PEPETOR (not credits)
- [ ] Wallet files are secure (.gitignore)
- [ ] .env files not committed
- [ ] Frontend connects to backend
- [ ] CORS configured correctly
- [ ] JWT authentication works
- [ ] All npm packages installed
- [ ] No TypeScript errors
- [ ] No linter warnings

---

## 🎉 Success Criteria

✅ **All tests passed**
✅ **Zero errors in 10 consecutive sessions**
✅ **All transactions verified on Solscan**
✅ **Treasury balance increasing**
✅ **UI displays correct $PEPETOR amounts**

---

## 🐛 Common Issues & Fixes

### Issue: "Insufficient funds for transaction"

**Fix:** Airdrop more SOL to Rewards/Treasury wallets
```bash
solana airdrop 1 <WALLET_ADDRESS> --url devnet
```

### Issue: "Token account not found"

**Fix:** Re-run `deployToken.js` or create token accounts manually

### Issue: "API server not responding"

**Fix:** Check backend is running on port 3001
```bash
lsof -i :3001
```

### Issue: "Wallet not connecting"

**Fix:** 
1. Switch wallet to devnet
2. Refresh page
3. Clear browser cache
4. Try different browser

### Issue: "Transaction signature invalid"

**Fix:** Check `SOLANA_NETWORK=devnet` in `.env`

### Issue: "Balance not updating"

**Fix:**
1. Check RPC URL is correct
2. Verify mint address is correct
3. Check browser console for errors
4. Refresh balance manually

---

## 🔄 Reset Testing Environment

```bash
# Clear all test data
cd apps/api

# Delete test wallets
rm -rf .wallets

# Clear MongoDB sessions
mongo clearnetlabs --eval "db.sessions.deleteMany({})"

# Re-deploy token
node scripts/deployToken.js
```

---

## 📞 Next Steps After Testing

Once all tests pass on devnet:

1. **Switch to Mainnet:**
   - Update `SOLANA_NETWORK=mainnet-beta`
   - Update `SOLANA_RPC_URL=https://api.mainnet-beta.solana.com`
   - Get ~$10 worth of SOL
   - Run `deployToken.js` on mainnet

2. **Create Raydium Pool:**
   - Add liquidity (50M $PEPETOR + 5-10 SOL)
   - Lock LP tokens via Unicrypt

3. **DexScreener Listing:**
   - Auto-detects Raydium pool in 5-10 minutes
   - Claim token page
   - Upload metadata

4. **Go Live:**
   - Update `CORS_ORIGIN` to production domain
   - Update frontend `VITE_API_BASE_URL`
   - Deploy to production

---

## 📝 Test Log Template

Use this to track your testing:

```
Date: ___________
Tester: ___________

✅ Token deployed to devnet
✅ Automated tests passed (18/18)
✅ Backend API running
✅ Frontend running
✅ Wallet connected
✅ First session submitted: Tx ___________
✅ Balance updated from 0 to ___ $PEPETOR
✅ Treasury received ___ $PEPETOR fee
✅ 10 consecutive sessions passed
✅ All transactions verified on Solscan
✅ No errors in console/logs

Issues Found:
- None

Ready for Mainnet: ✅ YES / ❌ NO
```
