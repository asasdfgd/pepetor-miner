# ✅ Ready to Deploy - Pre-Launch Checklist

Everything is configured for **mainnet deployment**. DexScreener listing comes AFTER you create the Raydium liquidity pool.

---

## 📦 What's Ready

### ✅ Backend (apps/api)
- [x] Token deployment script (`deployToken.js`)
- [x] Token service for transfers (`tokenService.js`)
- [x] Wallet authentication (`/auth/wallet-auth`)
- [x] Session submission with token rewards
- [x] 2% fee to Treasury wallet
- [x] Metadata upload script (`uploadMetadata.js`)
- [x] Mint authority revocation script (`revokeMintAuthority.js`)
- [x] Environment configured for mainnet

### ✅ Frontend (apps/web)
- [x] Wallet connection (Phantom/Solflare)
- [x] Balance display from blockchain
- [x] Mining session UI
- [x] Transaction history with Solscan links
- [x] $PEPETOR branding (not credits)

### ✅ Documentation
- [x] Complete mainnet deployment guide (`MAINNET_DEPLOYMENT.md`)
- [x] Testing guide (`TEST_GUIDE.md`)
- [x] Integration overview (`INTEGRATION_COMPLETE.md`)

### ✅ Configuration
- [x] `.env` set to `mainnet-beta`
- [x] Deployer wallet generated
- [x] 9-wallet structure ready

---

## 🎯 Deployment Workflow

### Phase 1: Token Creation (Do Before DexScreener)

```
1. Get Logo
   ├─ Create 512x512 PNG
   └─ Save as apps/api/scripts/pepetor-logo.png

2. Fund Deployer
   ├─ Send 0.1 SOL to: Gwco8bgPcpKwpzyzpXCF9sjyZA7EvETVZ7NKBt8aDo88
   └─ (This wallet already exists in .wallets/deployer.json)

3. Deploy Token
   ├─ cd apps/api
   ├─ node scripts/deployToken.js
   └─ Copy PEPETOR_MINT_ADDRESS to .env

4. Upload Metadata
   ├─ node scripts/uploadMetadata.js
   └─ Logo will appear in wallets

5. Test Everything
   ├─ Start API: npm run dev
   ├─ Start Web: cd ../web && npm run dev
   ├─ Connect wallet
   ├─ Submit mining session
   └─ Verify token transfer on Solscan
```

### Phase 2: Liquidity & DexScreener (Do After Testing)

```
6. Create Raydium Pool
   ├─ Visit https://raydium.io/liquidity/create/
   ├─ Budget: 20M $PEPETOR + 2.3 SOL ($500)
   ├─ Standard: 50M $PEPETOR + 5-10 SOL ($1,000+)
   └─ Confirm transaction

7. Lock LP Tokens
   ├─ Visit https://app.uncx.network/
   ├─ Lock for 6-12 months
   └─ Save lock certificate

8. DexScreener Auto-Lists
   ├─ Wait 5-10 minutes
   ├─ Check https://dexscreener.com/solana/<MINT_ADDRESS>
   └─ Claim your page

9. Deploy to Production
   ├─ Deploy frontend (Vercel/Netlify)
   ├─ Deploy backend (VPS/Heroku)
   └─ Update CORS/API URLs

10. Announce Launch
    ├─ Post on X (Twitter)
    ├─ Share DexScreener link
    ├─ Post LP lock proof
    └─ Start marketing
```

---

## 💰 Cost Summary

### Full Launch ($1,000+)
| Item | Cost (SOL) | Cost (USD) |
|------|-----------|-----------|
| Token deployment | 0.02 | ~$4 |
| Metadata upload | 0.01 | ~$2 |
| Transaction fees | 0.01 | ~$2 |
| Buffer | 0.01 | ~$2 |
| **Subtotal** | **0.05** | **~$10** |
| | | |
| Raydium liquidity | 5-10 | $1,000-2,000 |
| LP lock fee | 0.1 | ~$20 |
| **Grand Total** | **5.15-10.15** | **$1,030-2,030** |

### Budget Launch ($500)
| Item | Cost (SOL) | Cost (USD) |
|------|-----------|-----------|
| Token + metadata | 0.1 | ~$20 |
| Raydium liquidity | 2.3 | ~$460 |
| LP lock fee | 0.1 | ~$20 |
| **Total** | **2.5** | **~$500** |

**With $500 you get:**
- Token deployed ✅
- Logo on wallets ✅
- DexScreener listing ✅
- Lower initial liquidity (can add more later)

---

## 📋 Pre-Deployment Checklist

### Required Before Running Scripts

- [ ] Logo ready (`apps/api/scripts/pepetor-logo.png`)
- [ ] 0.1 SOL in deployer wallet
- [ ] MongoDB running and accessible
- [ ] `.env` configured with correct values
- [ ] `.wallets/` directory backed up after deployment

### Optional But Recommended

- [ ] Domain name purchased
- [ ] SSL certificate configured
- [ ] Social media accounts created (Twitter, Telegram)
- [ ] Marketing plan drafted
- [ ] Community ready to onboard

---

## 🚀 Quick Start Commands

### Deploy Token (First Time)

```bash
cd apps/api

# Step 1: Run deployment (generates deployer wallet)
node scripts/deployToken.js

# Step 2: Fund the deployer wallet shown in output
# Send 0.1 SOL to the address displayed

# Step 3: Run deployment again (actually deploys)
node scripts/deployToken.js

# Step 4: Update .env with PEPETOR_MINT_ADDRESS

# Step 5: Upload metadata
node scripts/uploadMetadata.js
```

### Test Locally

```bash
# Terminal 1: Backend
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev

# Open browser to http://localhost:5173
```

### After Testing Succeeds

```bash
# Create Raydium pool (web UI)
https://raydium.io/liquidity/create/

# Lock LP tokens (web UI)
https://app.uncx.network/

# Deploy frontend
cd apps/web
npm run build
vercel --prod

# Deploy backend
cd apps/api
# Deploy to your VPS/cloud provider
```

---

## 🔗 Important Addresses

### Deployer Wallet (Already Generated)
```
Address: Gwco8bgPcpKwpzyzpXCF9sjyZA7EvETVZ7NKBt8aDo88
Path: apps/api/.wallets/deployer.json
Purpose: Creates token mint, uploads metadata
```

### Other Wallets (Generated During Deployment)
```
Treasury:     .wallets/treasury-keypair.json
Liquidity:    .wallets/liquidity-keypair.json
Marketing:    .wallets/marketing-keypair.json
Rewards:      .wallets/rewards-keypair.json
Team:         .wallets/team-keypair.json
CEX:          .wallets/cex-keypair.json
Partnerships: .wallets/partnerships-keypair.json
Buyback:      .wallets/buyback-keypair.json
Community:    .wallets/community-keypair.json
```

---

## 🛡️ Security Reminders

### BEFORE Deployment
- [ ] `.wallets/` is in `.gitignore` ✅
- [ ] `.env` is in `.gitignore` ✅
- [ ] No private keys in code ✅

### AFTER Deployment
- [ ] Backup `.wallets/` to encrypted USB
- [ ] Store backup in safe/vault
- [ ] Set up multisig for Treasury & Team wallets
- [ ] Revoke mint authority (after confirming everything works)

---

## 📊 Token Allocation (1B Total)

| Wallet | Amount | % | Purpose |
|--------|--------|---|---------|
| Treasury | 200M | 20% | Fees, reserves |
| Liquidity | 100M | 10% | Raydium pool |
| Marketing | 50M | 5% | Campaigns, ads |
| Rewards | 150M | 15% | User mining rewards |
| Team | 200M | 20% | Team allocation |
| CEX | 100M | 10% | Exchange listings |
| Partnerships | 100M | 10% | Collaborations |
| Buyback | 50M | 5% | Token buybacks |
| Community | 50M | 5% | Airdrops, events |

---

## 🎯 Success Criteria

Before considering deployment successful:

- [ ] Token mint exists on Solscan
- [ ] Metadata displays logo in Phantom
- [ ] 10+ successful mining sessions
- [ ] All transactions verified on Solscan
- [ ] Treasury receiving 2% fees
- [ ] No errors in console/logs
- [ ] Balance updates correctly
- [ ] Session history working

---

## 🔄 What Happens After Raydium Pool

1. **Immediately:**
   - Token becomes tradeable
   - Price discovery begins
   - Arbitrage bots may appear

2. **5-10 Minutes:**
   - DexScreener auto-detects pool
   - Chart becomes visible
   - Logo displays (from metadata)

3. **24 Hours:**
   - Trading volume establishes
   - Price volatility normalizes
   - Community starts forming

4. **7 Days:**
   - Eligible for CoinGecko listing
   - Can apply to other aggregators
   - Marketing campaigns ramp up

5. **30 Days:**
   - Eligible for CoinMarketCap
   - Can apply for CEX listings
   - Community fully established

---

## ⚡ Common Issues

### "Deployer wallet has no SOL"
**Fix:** Send 0.1 SOL to `Gwco8bgPcpKwpzyzpXCF9sjyZA7EvETVZ7NKBt8aDo88`

### "Logo not found"
**Fix:** Save logo as `apps/api/scripts/pepetor-logo.png` (exact name)

### "Token not showing in wallet"
**Fix:** Import by mint address, wait 1 minute for metadata to propagate

### "Transaction failing"
**Fix:** Ensure rewards wallet has SOL for transaction fees

### "DexScreener not listing"
**Fix:** Create Raydium pool first, then wait 5-10 minutes

---

## 📞 Resources

### Scripts Location
```
apps/api/scripts/
├── deployToken.js           # Deploy token + 9 wallets
├── uploadMetadata.js        # Upload logo to Arweave
├── revokeMintAuthority.js   # Make supply immutable
└── testEverything.js        # Automated test suite
```

### Documentation
```
MAINNET_DEPLOYMENT.md        # Detailed deployment guide
TEST_GUIDE.md               # Complete testing guide
INTEGRATION_COMPLETE.md     # Technical overview
READY_TO_DEPLOY.md          # This file
```

### Useful Links
- Raydium: https://raydium.io
- DexScreener: https://dexscreener.com
- Solscan: https://solscan.io
- Uncx (LP Lock): https://app.uncx.network
- Squads (Multisig): https://squads.so

---

## ✅ You're Ready!

Everything is configured for mainnet. When you're ready to deploy:

1. **Get your logo ready** (512x512 PNG)
2. **Send 0.1 SOL** to the deployer address
3. **Run `deployToken.js`** to create token
4. **Run `uploadMetadata.js`** to add logo
5. **Test everything** locally
6. **Create Raydium pool** (50M tokens + 5-10 SOL)
7. **Lock LP tokens** for 1+ year
8. **DexScreener auto-lists** in 5-10 minutes
9. **Announce launch** on social media

Questions? Check `MAINNET_DEPLOYMENT.md` for detailed step-by-step instructions.

Good luck! 🚀
