# 🚀 Mainnet Deployment Guide - $PEPETOR

Complete step-by-step guide to deploy $PEPETOR to Solana mainnet.

---

## 📋 Prerequisites

- [ ] ~$10-15 worth of SOL (for deployment + fees)
- [ ] PEPETOR logo (512x512 PNG)
- [ ] MongoDB configured
- [ ] All code tested locally
- [ ] Domain name (optional but recommended)

---

## 🎨 Step 1: Prepare Logo

### Option A: Create Your Own
1. Use **Canva** or **Photoshop**
2. Size: **512x512 pixels**
3. Format: **PNG** with transparent background
4. File size: Under 1 MB

### Option B: Hire Designer
- **Fiverr**: $5-20 for logo design
- **99designs**: Contest-based, $299+
- **Upwork**: Hourly rate

### Save Logo
```bash
# Save your logo here:
apps/api/scripts/pepetor-logo.png
```

**Important:** File must be named **exactly** `pepetor-logo.png`

---

## 💰 Step 2: Get SOL for Deployment

### Cost Breakdown
- Token deployment: ~0.02 SOL (~$4)
- Metadata upload (Arweave): ~0.01 SOL (~$2)
- Transaction fees: ~0.01 SOL (~$2)
- Buffer: ~0.01 SOL (~$2)
- **Total: ~0.05 SOL (~$10)**

### How to Get SOL

**Option 1: Buy on Exchange**
1. Coinbase, Binance, Kraken, etc.
2. Buy SOL
3. Withdraw to your Phantom wallet

**Option 2: Buy in Phantom**
1. Open Phantom wallet
2. Click "Buy"
3. Use credit card or bank transfer

---

## 🔧 Step 3: Configure Environment

Your `.env` should already be set to mainnet:

```bash
# apps/api/.env
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PEPETOR_MINT_ADDRESS=          # Will be filled after deployment
TREASURY_WALLET_PATH=.wallets/treasury-keypair.json
REWARDS_WALLET_PATH=.wallets/rewards-keypair.json
SIMULATION_MODE=false
TRANSACTION_FEE_PERCENT=2
```

---

## 🪙 Step 4: Deploy Token

```bash
cd apps/api

# Deploy token and create 9 wallets
node scripts/deployToken.js
```

### First Run (Generates Deployer Wallet)

**Output:**
```
🚀 DEPLOYING $PEPETOR TOKEN ON SOLANA MAINNET-BETA

🔑 Generating deployer keypair...
💾 Deployer keypair saved to .wallets/deployer.json
⚠️  IMPORTANT: Fund this address with ~0.05 SOL for gas fees
📍 Deployer Address: <YOUR_DEPLOYER_ADDRESS>

💰 Send SOL from Phantom/Exchange to this address
```

**Action Required:**
1. Copy the deployer address
2. Send **0.1 SOL** from Phantom to this address
3. Wait for confirmation (10-30 seconds)
4. Run the script again

### Second Run (Deploys Token)

```bash
node scripts/deployToken.js
```

**Output:**
```
🚀 DEPLOYING $PEPETOR TOKEN ON SOLANA MAINNET-BETA

🔐 Deployer: <address>
💰 Balance: 0.1 SOL

🪙 Creating token mint...
✅ Token Mint: <MINT_ADDRESS>

💰 Minting 1,000,000,000 $PEPETOR...

📂 Creating specialized wallets:
  ✅ Treasury (200,000,000 $PEPETOR)
  ✅ Liquidity (100,000,000 $PEPETOR)
  ✅ Marketing (50,000,000 $PEPETOR)
  ✅ Rewards (150,000,000 $PEPETOR)
  ✅ Team (200,000,000 $PEPETOR)
  ✅ CEX (100,000,000 $PEPETOR)
  ✅ Partnerships (100,000,000 $PEPETOR)
  ✅ Buyback (50,000,000 $PEPETOR)
  ✅ Community (50,000,000 $PEPETOR)

🎉 DEPLOYMENT COMPLETE!

📋 Token Mint Address: <MINT_ADDRESS>
📂 Wallet files saved to: .wallets/
🔗 View on Solscan: https://solscan.io/token/<MINT_ADDRESS>
```

**Action Required:**
1. Copy the **Token Mint Address**
2. Update `.env`:
   ```bash
   PEPETOR_MINT_ADDRESS=<MINT_ADDRESS>
   ```
3. **BACKUP `.wallets/` folder** to encrypted USB/cloud storage
4. Verify on Solscan that token exists

---

## 📤 Step 5: Upload Metadata

This makes your token display with logo in wallets and DexScreener.

```bash
cd apps/api

# Upload logo and metadata to Arweave
node scripts/uploadMetadata.js
```

**Output:**
```
📤 UPLOADING $PEPETOR METADATA TO ARWEAVE

🔐 Update Authority: <deployer_address>
🪙 Token Mint: <mint_address>
🌐 Network: mainnet-beta

📤 Step 1: Uploading logo to Arweave...
✅ Logo uploaded: https://arweave.net/<logo_hash>

📤 Step 2: Uploading metadata JSON...
✅ Metadata uploaded: https://arweave.net/<metadata_hash>

📝 Step 3: Creating on-chain metadata account...
✅ Metadata account created!

🎉 TOKEN METADATA COMPLETE!

📋 Summary:
   Logo URI: https://arweave.net/<logo_hash>
   Metadata URI: https://arweave.net/<metadata_hash>
   Mint Address: <mint_address>

🔗 View on Solana Explorer:
   https://explorer.solana.com/address/<mint_address>?cluster=mainnet-beta

✅ Wallets will now display your logo and token info!
```

**Verify:**
1. Open Phantom wallet
2. Import token by mint address
3. Logo should display

---

## 🔒 Step 6: Secure Wallets

### Backup Wallet Files

**Critical Files:**
```
.wallets/
  ├── deployer.json           # Token mint authority
  ├── treasury-keypair.json   # 200M $PEPETOR
  ├── liquidity-keypair.json  # 100M $PEPETOR
  ├── rewards-keypair.json    # 150M $PEPETOR
  └── ... (6 more wallets)
```

**Backup Steps:**
1. Copy `.wallets/` folder to encrypted USB drive
2. Store in safe/vault
3. Optional: Use password manager (1Password, Bitwarden)
4. **NEVER** commit to GitHub
5. **NEVER** share with anyone

### Set Up Multisig (Recommended)

**Treasury & Team wallets should use multisig:**

```bash
# Use Squads Protocol (3-of-5 signature requirement)
# Visit: https://squads.so
```

1. Create Squads multisig
2. Transfer tokens from treasury/team wallets to multisig
3. Requires 3 of 5 signers to approve transactions

---

## 🧪 Step 7: Test Everything

```bash
# Backend
cd apps/api
npm run dev

# Frontend (new terminal)
cd apps/web
npm run dev
```

### Test Checklist

- [ ] Connect wallet (Phantom/Solflare)
- [ ] User created in MongoDB
- [ ] Start mining session
- [ ] Submit session
- [ ] Token transfer succeeds
- [ ] Balance updates
- [ ] Transaction appears on Solscan
- [ ] Treasury receives 2% fee

**Solscan Check:**
```
https://solscan.io/tx/<TRANSACTION_SIGNATURE>
```

---

## 💧 Step 8: Create Raydium Liquidity Pool

**DexScreener will NOT list until you create a Raydium pool.**

### Budget Options

#### Option A: Standard Pool ($1,000+)
- **$PEPETOR:** 50,000,000 (5% of supply)
- **SOL:** 5-10 SOL (~$1,000-2,000)
- **Market Cap:** $1,000-2,000
- **Benefits:** Higher liquidity, less slippage

#### Option B: Budget Pool ($500)
- **$PEPETOR:** 20,000,000 (2% of supply)
- **SOL:** 2-2.5 SOL (~$400-500)
- **Market Cap:** $400-500
- **Benefits:** Lower cost, still gets DexScreener listing
- **Note:** Can add more liquidity later

### Steps

1. **Go to Raydium:**
   ```
   https://raydium.io/liquidity/create/
   ```

2. **Create Pool:**
   - Base Token: $PEPETOR (paste mint address)
   - Quote Token: SOL
   - Initial Price: Set your starting price
   - Amount: Choose based on budget

3. **Confirm Transaction:**
   - Sign in Phantom
   - Wait for confirmation

4. **Get Pool Address:**
   - Copy the pool address from transaction
   - Save for next step

**Example Calculations:**
```
Budget Pool ($500):
20M $PEPETOR + 2.5 SOL = ~$500 market cap @ 0.000125 SOL per token

Standard Pool ($1,000):
50M $PEPETOR + 5 SOL = ~$1,000 market cap @ 0.0001 SOL per token

Large Pool ($2,000):
50M $PEPETOR + 10 SOL = ~$2,000 market cap @ 0.0002 SOL per token
```

**Important:** Smaller pools work fine - you can add liquidity later as project grows.

---

## 🔐 Step 9: Lock LP Tokens (CRITICAL!)

**DO NOT SKIP THIS** - Community will assume rug pull without locked LP.

### Option A: Uncx.network (Formerly Unicrypt)

1. Visit: `https://app.uncx.network/`
2. Select "Solana"
3. Find your LP token
4. Lock for **1 year minimum** (longer = more trust)
5. Cost: ~0.1 SOL

### Option B: Team Finance

1. Visit: `https://www.team.finance/`
2. Select Solana
3. Lock LP tokens
4. Lock for **1 year minimum**

**Save Lock Certificate:**
- Take screenshot
- Save transaction signature
- Post on social media: "LP LOCKED ✅"

---

## 📊 Step 10: DexScreener Auto-Listing

DexScreener **automatically detects** Raydium pools.

### Timeline
- **5-10 minutes** after pool creation
- No manual submission needed
- No fee required

### Verify Listing

1. **Search for your token:**
   ```
   https://dexscreener.com/solana/<MINT_ADDRESS>
   ```

2. **Check it appears:**
   - Logo should display (from metadata)
   - Pool info visible
   - Trading chart active

### Claim Your Page

1. Click "Update Token Info" on DexScreener
2. Verify ownership
3. Add:
   - Website
   - Twitter
   - Telegram
   - Description

---

## 🌐 Step 11: Deploy Frontend

### Update Production URLs

**apps/web/.env:**
```bash
VITE_API_BASE_URL=https://clearnetlabs.fun/api
```

**apps/api/.env:**
```bash
CORS_ORIGIN=https://clearnetlabs.fun
```

### Deploy Options

**Option A: Vercel (Recommended)**
```bash
cd apps/web
vercel --prod
```

**Option B: Netlify**
```bash
cd apps/web
netlify deploy --prod
```

**Option C: Your Server**
```bash
cd apps/web
npm run build
# Upload dist/ folder to server
```

---

## 📈 Step 12: Monitor & Market

### Essential Links

**Solscan (Blockchain Explorer):**
```
https://solscan.io/token/<MINT_ADDRESS>
```

**DexScreener (Price Chart):**
```
https://dexscreener.com/solana/<MINT_ADDRESS>
```

**Raydium (Pool):**
```
https://raydium.io/liquidity/
```

### Marketing Checklist

- [ ] Post on X (Twitter) about launch
- [ ] Share DexScreener link
- [ ] Post LP lock proof
- [ ] Join Solana NFT/Token Discord servers
- [ ] List on CoinGecko (30+ days old, 10k holders)
- [ ] List on CoinMarketCap (30+ days old)
- [ ] Create Telegram community
- [ ] Run airdrop campaigns

---

## 🛡️ Security Best Practices

### Post-Deployment

1. **Revoke Mint Authority** (no more tokens can be created):
   ```bash
   node scripts/revokeMintAuthority.js
   ```

2. **Transfer Authority to Multisig:**
   - Use Squads Protocol
   - Requires 3-of-5 signatures

3. **Enable Rate Limiting:**
   - Add Cloudflare in front of API
   - Prevent abuse

4. **Monitor Wallets:**
   - Set up alerts for treasury withdrawals
   - Track reward distributions

---

## 🔄 Ongoing Operations

### Daily Tasks

- Monitor reward wallet balance
- Refill if running low
- Check transaction success rate
- Monitor for errors in logs

### Weekly Tasks

- Review user sessions
- Check treasury accumulation
- Verify LP still locked
- Monitor token price

### Monthly Tasks

- Community updates
- Team token vesting releases
- Marketing campaigns
- Partnership outreach

---

## 🐛 Troubleshooting

### Token not showing in wallet
- **Fix:** Import manually by mint address in Phantom

### DexScreener not listing
- **Fix:** Ensure Raydium pool exists, wait 10 minutes

### Logo not displaying
- **Fix:** Run `uploadMetadata.js` again

### Transactions failing
- **Fix:** Check rewards wallet has SOL for fees

### "Insufficient funds" error
- **Fix:** Airdrop more SOL to rewards/treasury wallets

---

## 📞 Support

### Useful Resources

- **Solana Docs:** https://docs.solana.com
- **Raydium Docs:** https://docs.raydium.io
- **Metaplex Docs:** https://docs.metaplex.com
- **Squads (Multisig):** https://squads.so

### Community

- **Solana Discord:** https://discord.gg/solana
- **Raydium Discord:** https://discord.gg/raydium

---

## ✅ Final Checklist

Before announcing launch:

- [ ] Token deployed to mainnet
- [ ] Metadata uploaded (logo visible)
- [ ] All 9 wallets funded
- [ ] Wallet backups secured
- [ ] Raydium pool created
- [ ] LP tokens locked (1+ year)
- [ ] DexScreener listing live
- [ ] Frontend deployed to production
- [ ] API running on production server
- [ ] MongoDB configured
- [ ] SSL certificates installed
- [ ] All endpoints tested
- [ ] 10+ successful mining sessions
- [ ] Treasury receiving fees
- [ ] Social media accounts created
- [ ] Launch announcement drafted

---

## 🎉 Congratulations!

Your $PEPETOR token is now live on Solana mainnet!

**Next Steps:**
1. Announce on social media
2. Start marketing campaign
3. Engage with community
4. Monitor metrics
5. Scale as needed

**Remember:**
- Be transparent with community
- Regular updates
- Deliver on roadmap
- Build trust over time

Good luck! 🚀
