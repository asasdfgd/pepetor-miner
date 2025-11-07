# $PEPETOR TOKEN DEPLOYMENT GUIDE

## 📋 OVERVIEW

This guide walks you through deploying the $PEPETOR token on Solana mainnet with proper wallet distribution.

## 🎯 WALLET STRUCTURE (9 Wallets)

| Wallet | Purpose | Allocation | Security |
|--------|---------|------------|----------|
| **Treasury** | Core funds, protocol reserves | 20% | Multisig (3/5) |
| **Liquidity** | DEX liquidity pools | 10% | 2-sig, lock LP tokens |
| **Marketing/Ops** | Campaigns, partnerships | 5% | Hot wallet |
| **Rewards/Airdrop** | Mining rewards, promos | 15% | Backend-controlled |
| **Team/Vesting** | Team allocation (locked) | 20% | Multisig + time lock |
| **CEX** | Exchange listings | 10% | Cold storage |
| **Partnerships** | Ecosystem grants | 10% | Multisig |
| **Buyback/Burn** | Deflationary mechanism | 5% | Public wallet |
| **Community** | Community initiatives | 5% | DAO-controlled |

**Total: 100% of 1 billion $PEPETOR**

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Generate Deployer Wallet

```bash
cd apps/api
node scripts/deployToken.js
```

This creates `.wallets/deployer.json` and outputs an address like:
```
DUWzsLTbyWcaBAd9SrJEQvoD7yn9wKa7xeCYYLPP9EeP
```

### Step 2: Fund Deployer Wallet

Send **~0.05 SOL** (~$10) from Phantom or exchange to the deployer address.

**Why this amount?**
- Token mint creation: ~0.00144 SOL
- 9 token accounts: ~0.0203 SOL
- Transaction fees: ~0.001 SOL
- **Total: ~0.025 SOL** (buffer included)

### Step 3: Run Full Deployment

```bash
node scripts/deployToken.js
```

This will:
1. ✅ Generate 9 wallet keypairs
2. ✅ Create $PEPETOR token mint
3. ✅ Distribute tokens according to allocation percentages
4. ✅ Save deployment summary to `.wallets/deployment-summary.json`

**Expected output:**
```
✅ Token Mint Created: <MINT_ADDRESS>
🔗 https://solscan.io/token/<MINT_ADDRESS>

💰 Treasury: 200,000,000 $PEPETOR (20%)
💰 Liquidity: 100,000,000 $PEPETOR (10%)
... (all 9 wallets)
```

---

## 🔒 SECURITY CHECKLIST

After deployment:

- [ ] **Backup all wallet files** to encrypted cloud storage (1Password, Bitwarden, etc.)
- [ ] **Print seed phrases** for Treasury, Team, CEX wallets → store in safe
- [ ] **Delete deployer.json** from server (keep offline backup only)
- [ ] **Never commit** `.wallets/` to git (already in .gitignore)
- [ ] **Set up Squads multisig** for Treasury wallet (https://squads.so)
- [ ] **Transfer mint authority** to Treasury multisig OR revoke entirely

### Revoking Mint Authority (Optional)

To prevent any future minting (recommended for trust):

```javascript
// Add to deployToken.js after minting
await setAuthority(
  connection,
  deployer,
  mint,
  deployer.publicKey,
  AuthorityType.MintTokens,
  null  // null = revoke permanently
);
console.log('✅ Mint authority revoked - no more tokens can be minted');
```

---

## 📊 DEXSCREENER LISTING (Auto-Detection)

**DexScreener does NOT require manual submission.** It auto-indexes tokens with DEX liquidity.

### How to Get Listed on DexScreener

1. **Create Raydium Pool**
   - Go to https://raydium.io/liquidity/create/
   - Connect the **Liquidity Wallet** (from `.wallets/liquidity.json`)
   - Pair: $PEPETOR / SOL
   - Recommended initial liquidity: 50M $PEPETOR + 5-10 SOL

2. **Add Liquidity**
   - You'll receive LP tokens (Raydium LP-PEPETOR-SOL)
   - **IMMEDIATELY LOCK THESE LP TOKENS** (see below)

3. **Wait 5-10 Minutes**
   - DexScreener automatically detects new Raydium pools
   - Your token will appear at: `https://dexscreener.com/solana/<MINT_ADDRESS>`

4. **Claim Token Page**
   - Visit your DexScreener page
   - Click "Update Info" → verify ownership via wallet signature
   - Add logo, links, description, socials

### Locking LP Tokens (CRITICAL!)

**Never leave LP tokens unlocked - it's a rug pull red flag!**

**Option A: Unicrypt (Recommended)**
- Go to https://app.uncx.network/services/lock-liquidity (Solana)
- Connect wallet holding LP tokens
- Lock for 1+ year minimum
- Get public proof-of-lock URL

**Option B: Team Finance**
- https://www.team.finance/
- Similar process to Unicrypt

**Option C: Custom On-Chain Lock**
- Use Solana time-lock program (requires dev)

---

## 🎨 TOKEN METADATA (Jupiter, Wallets)

To show logo/name in Phantom, Jupiter, etc:

1. **Create metadata JSON:**
```json
{
  "name": "PEPETOR",
  "symbol": "$PEPETOR",
  "description": "The meme coin for Tor privacy miners",
  "image": "https://clearnetlabs.fun/pepetor-logo.png",
  "external_url": "https://clearnetlabs.fun",
  "tags": ["meme", "privacy", "mining"]
}
```

2. **Upload to IPFS or Arweave**
   - Use NFT.Storage (free IPFS): https://nft.storage
   - Get permanent URL like: `ipfs://bafybeig...`

3. **Use Metaplex to attach metadata**
```bash
npm install -g @metaplex-foundation/js
metaplex upload <your-metadata.json>
metaplex update <MINT_ADDRESS> --uri <IPFS_URL>
```

Or use GUI: https://www.metaboss.rs/ (Metaboss)

---

## 🛠️ POST-DEPLOYMENT TASKS

### Connect Rewards Wallet to Backend

The **Rewards/Airdrop wallet** should be used to send $PEPETOR to miners.

1. Copy mint address from `deployment-summary.json`
2. Update `.env`:
```bash
PEPETOR_MINT_ADDRESS=<your_mint_address>
REWARDS_WALLET_PATH=/path/to/.wallets/rewards.json
```

3. Backend will use this wallet to send tokens on session submission

### Set Up Multisig (Treasury, Team, Partnerships)

Use **Squads Protocol** (recommended for Solana):
- Website: https://squads.so
- Create 3-of-5 or 2-of-3 multisig
- Transfer tokens from single-key wallets to multisig addresses
- All signers must approve transactions

---

## ⚠️ COMMON MISTAKES TO AVOID

❌ **Deploying without locking liquidity** → instant rug pull accusations  
❌ **Keeping all keys in hot wallets** → hack risk  
❌ **Committing .wallets/ to GitHub** → exposed private keys  
❌ **Not revoking mint authority** → team can print unlimited tokens  
❌ **No team vesting** → team can dump tokens immediately  
❌ **Skipping metadata** → token shows as "Unknown Token" in wallets  

---

## 📞 SUPPORT

If deployment fails:
- Check deployer SOL balance: `solana balance <ADDRESS>`
- Verify network: mainnet-beta vs devnet
- Check Solana status: https://status.solana.com
- Join Solana Discord: https://discord.gg/solana

---

## 🎉 SUCCESS CHECKLIST

After full deployment:

- [ ] Token visible on Solscan
- [ ] All 9 wallets funded with correct %
- [ ] Raydium pool created
- [ ] LP tokens locked
- [ ] Listed on DexScreener
- [ ] Metadata uploaded (shows logo in wallets)
- [ ] Mint authority revoked or transferred
- [ ] Treasury/Team wallets set up as multisig
- [ ] Rewards wallet connected to backend
- [ ] All private keys backed up offline

**You're ready to launch! 🚀**
