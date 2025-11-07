# 💸 Budget Deployment Guide - $500 Total

Deploy $PEPETOR with only $500 and still get DexScreener listing.

---

## 💰 Budget Breakdown

| Item | Amount | Notes |
|------|--------|-------|
| Buy SOL | 2.5 SOL | ~$500 @ $200/SOL |
| Token deployment | 0.1 SOL | Creates token + 9 wallets |
| Raydium pool | 2.3 SOL | Creates tradeable market |
| LP lock | 0.1 SOL | Locks liquidity |
| **Remaining** | ~0 SOL | All funds deployed |

**Total: $500** 🎯

---

## 🎯 What You Get

✅ Token deployed on Solana mainnet  
✅ Logo displays in wallets  
✅ Listed on DexScreener  
✅ Tradeable on Raydium  
✅ LP locked (anti-rug proof)  
✅ Fully functional miner rewards  

**Difference from $1,000+ launch:**
- Lower initial liquidity (2.5 SOL vs 5-10 SOL)
- Slightly more price slippage on trades
- Can add more liquidity later as you earn

---

## 📝 Step-by-Step

### 1. Buy 2.5 SOL ($500)

**Easiest: Buy in Phantom wallet**
1. Open Phantom
2. Click "Buy"
3. Pay with card/bank
4. Get ~2.5 SOL

**Or: Buy on Exchange**
1. Coinbase/Binance/Kraken
2. Buy $500 worth of SOL
3. Withdraw to Phantom

---

### 2. Deploy Token (0.1 SOL = $20)

```bash
cd apps/api

# Run deployment (generates deployer wallet)
node scripts/deployToken.js

# You'll see: Send 0.1 SOL to <ADDRESS>
# Send 0.1 SOL from Phantom to that address

# Run again to deploy
node scripts/deployToken.js
```

**Cost: 0.1 SOL**  
**Remaining: 2.4 SOL**

Copy the `PEPETOR_MINT_ADDRESS` to your `.env`

---

### 3. Upload Logo (included in 0.1 SOL)

First, add your logo:
```
apps/api/scripts/pepetor-logo.png (512x512 PNG)
```

Then:
```bash
node scripts/uploadMetadata.js
```

**Cost: Included above**  
**Remaining: 2.4 SOL**

---

### 4. Create Budget Raydium Pool (2.3 SOL = $460)

1. Go to https://raydium.io/liquidity/create/
2. Connect Phantom
3. Settings:
   - **Base Token:** Your $PEPETOR mint address
   - **Quote Token:** SOL
   - **$PEPETOR Amount:** 20,000,000 (from liquidity wallet)
   - **SOL Amount:** 2.3 SOL

4. Click "Create Pool"
5. Confirm in Phantom

**This creates a $460 market cap at ~$0.000023 per token**

**Cost: 2.3 SOL**  
**Remaining: 0.1 SOL**

---

### 5. Lock LP Tokens (0.1 SOL = $20)

1. Go to https://app.uncx.network/
2. Select Solana network
3. Find your LP tokens
4. Lock for **6-12 months** (longer = more trust)
5. Pay 0.1 SOL fee

**Cost: 0.1 SOL**  
**Remaining: 0 SOL**

---

### 6. DexScreener Auto-Lists (FREE)

**Wait 5-10 minutes** - DexScreener detects your Raydium pool automatically.

Check: `https://dexscreener.com/solana/<YOUR_MINT_ADDRESS>`

Should show:
- Your logo ✅
- Trading chart ✅
- Pool info ✅
- Price ✅

---

## 📊 Token Allocation (Budget Version)

| Wallet | Amount | Usage |
|--------|--------|-------|
| Treasury | 200M | Fees from users (grows over time) |
| **Liquidity** | **20M** | **Raydium pool (2% of supply)** |
| Marketing | 50M | Save for later campaigns |
| Rewards | 150M | Pay users for mining |
| Team | 200M | Team allocation |
| CEX | 100M | Future exchange listings |
| Partnerships | 100M | Partnerships |
| Buyback | 50M | Future buybacks |
| Community | 50M | Airdrops, events |
| **Reserved** | **80M** | **Add liquidity later** |

You're using **20M for initial pool** instead of 50M. Keep 80M in liquidity wallet to add more later.

---

## 💡 Growing From $500 Start

### Month 1: Launch Phase
- Token live on DexScreener ✅
- Users mining and earning $PEPETOR
- Treasury accumulating 2% fees
- Small initial liquidity ($460)

### Month 2-3: Growth Phase
- Treasury has grown from user fees
- Add more liquidity from treasury (increase to $1,000+)
- Price stabilizes with more liquidity
- Marketing campaigns with marketing wallet

### Month 4+: Scale Phase
- List on CoinGecko (free)
- List on CoinMarketCap (free)
- Apply for CEX listings (use CEX wallet)
- Community grown organically

---

## ⚠️ Budget Launch Trade-offs

### What's Different
❌ Lower initial liquidity ($460 vs $1,000+)  
❌ More price slippage on large trades  
❌ Smaller initial market cap  

### What's The Same
✅ Token fully functional  
✅ Logo displays everywhere  
✅ DexScreener listing  
✅ Mining rewards work  
✅ Can add liquidity anytime  

---

## 🚀 After Launch

### Earn More SOL for Liquidity

**Treasury wallet grows automatically:**
- 2% fee on every user reward
- User does 10 $PEPETOR session = 0.2 $PEPETOR to treasury
- 1,000 sessions = 200 $PEPETOR in treasury
- Sell small % of treasury $PEPETOR → get SOL
- Add SOL + $PEPETOR back to Raydium pool
- Liquidity grows organically

**Example:**
```
Week 1: $460 liquidity (your initial)
Week 4: $600 liquidity (added $140 from treasury fees)
Week 8: $800 liquidity (added another $200)
Week 12: $1,000+ liquidity (growing steadily)
```

---

## 📈 Price Impact Example

### With Budget Pool ($460 liquidity)
- Buy $10 worth: ~0.5% slippage ✅
- Buy $50 worth: ~2% slippage ✅
- Buy $100 worth: ~5% slippage ⚠️
- Buy $500 worth: ~25% slippage ❌

### After Growing to $1,000+ liquidity
- Buy $10 worth: ~0.2% slippage ✅
- Buy $50 worth: ~1% slippage ✅
- Buy $100 worth: ~2% slippage ✅
- Buy $500 worth: ~10% slippage ✅

**For early launch, budget pool is fine.** Most buyers won't trade more than $10-50 at first.

---

## 🎯 Success Metrics

### Week 1 Goals
- [ ] Token deployed
- [ ] DexScreener listed
- [ ] 10+ active miners
- [ ] 100+ sessions completed
- [ ] Treasury earning fees

### Month 1 Goals
- [ ] 100+ users
- [ ] $100+ earned in treasury fees
- [ ] Add $100 more liquidity
- [ ] Social media presence

### Month 3 Goals
- [ ] 500+ users
- [ ] $1,000+ liquidity
- [ ] CoinGecko listing
- [ ] 1M+ tokens traded

---

## 💸 Alternative: Start Even Cheaper

### Micro Launch ($250)

**If you only have $250:**
```
Buy: 1.25 SOL ($250)
Deploy: 0.1 SOL
Pool: 1.0 SOL + 10M $PEPETOR
Lock: 0.15 SOL
```

**Trade-offs:**
- Even lower liquidity ($200)
- More slippage (10-20% on $50 buys)
- Still gets DexScreener listing
- Grows same way via treasury fees

**Still works!** Just slower initial growth.

---

## 🛡️ Budget Security

**Even with $500 budget, maintain security:**

✅ Lock LP tokens (prevents rug pull)  
✅ Backup wallet files  
✅ Never share private keys  
✅ Set up multisig for treasury  
✅ Revoke mint authority  

Budget ≠ Less secure. Same safety standards.

---

## 📞 FAQ

**Q: Can I add more liquidity later?**  
A: Yes! Add anytime. Just go to Raydium and add to existing pool.

**Q: Will DexScreener still list me with only $460 liquidity?**  
A: Yes! Minimum liquidity for listing is ~$100. You're well above.

**Q: Can users still mine and earn with small liquidity?**  
A: Yes! Mining rewards are separate from liquidity pool.

**Q: What if token price drops?**  
A: Liquidity pool maintains ratio. If price drops, your SOL side increases. This is called "impermanent loss" but applies to all pools.

**Q: Should I wait until I have $1,000?**  
A: No! Start with $500. Treasury fees will help you grow liquidity organically. Waiting = missed opportunity.

---

## ✅ Budget Deployment Checklist

- [ ] Buy 2.5 SOL (~$500)
- [ ] Create logo (512x512 PNG)
- [ ] Deploy token (0.1 SOL)
- [ ] Upload metadata (included)
- [ ] Create Raydium pool (2.3 SOL + 20M tokens)
- [ ] Lock LP tokens (0.1 SOL, 6-12 months)
- [ ] Wait for DexScreener (5-10 min)
- [ ] Test mining sessions
- [ ] Announce launch
- [ ] Grow liquidity from treasury fees

---

## 🚀 Ready to Launch

**Your $500 is enough!**

Follow these steps:
1. Read main guide: `MAINNET_DEPLOYMENT.md`
2. Use budget numbers: 2.3 SOL pool, 20M tokens
3. Everything else is the same

After launch, focus on:
- Getting users to mine
- Treasury accumulates fees
- Add more liquidity monthly
- Market organically

**Small start, big potential.** 🚀
