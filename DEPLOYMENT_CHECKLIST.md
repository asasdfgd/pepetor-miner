# Bonding Curve Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Add Meteora env vars to `apps/api/.env`:
  ```bash
  METEORA_FEE_CLAIMER=<your_wallet_address>
  METEORA_LEFTOVER_RECEIVER=<your_wallet_address>
  ```

### Testing (Optional but Recommended)
- [ ] Test on devnet first:
  ```bash
  # Update .env
  SOLANA_NETWORK=devnet
  SOLANA_RPC_URL=https://api.devnet.solana.com
  ```
- [ ] Deploy test token with bonding curve
- [ ] Verify pool creation on Solana Explorer
- [ ] Test trading on Meteora (devnet)

## Deployment

### 1. Backend (Fly.io)
```bash
cd /Users/josephpietravalle/Desktop/PEPETOR-MINER
fly deploy
```

**Expected output:**
- ✅ Build successful
- ✅ Deploy successful
- ✅ Health checks passing
- ⏱️ Takes ~2-3 minutes

**Verify:**
- [ ] Check logs: `fly logs`
- [ ] Test pricing API:
  ```bash
  curl "https://pepetor-miner.fly.dev/api/token-deployment/price?useBondingCurve=true"
  ```
- [ ] Should return: `totalPrice: 0.073, launchType: 'bonding_curve'`

### 2. Set Fly Secrets
```bash
fly secrets set METEORA_FEE_CLAIMER=<address>
fly secrets set METEORA_LEFTOVER_RECEIVER=<address>
```

### 3. Frontend (Vercel)
```bash
cd apps/web
npm run build
vercel --prod
```

**Expected output:**
- ✅ Build successful  
- ✅ Deployed to production
- 🌐 URL: https://clearnetlabs.fun
- ⏱️ Takes ~3-5 minutes

**Verify:**
- [ ] Visit https://clearnetlabs.fun
- [ ] Navigate to Deploy Token page
- [ ] See "Bonding Curve" option (should be selected by default)
- [ ] Verify pricing shows 0.073 SOL
- [ ] Toggle to "Instant DEX" and verify traditional pricing

## Post-Deployment Verification

### API Endpoints
Test all endpoints:
```bash
# 1. Pricing (Bonding Curve)
curl "https://pepetor-miner.fly.dev/api/token-deployment/price?useBondingCurve=true"

# 2. Pricing (Traditional)
curl "https://pepetor-miner.fly.dev/api/token-deployment/price?liquidityAmount=1&useBondingCurve=false"

# 3. Health Check
curl "https://pepetor-miner.fly.dev/api/health"
```

### Frontend Checks
- [ ] Launch type selector displays correctly
- [ ] Default selection is "Bonding Curve"
- [ ] Pricing updates when toggling launch types
- [ ] Bonding curve info card displays
- [ ] Traditional liquidity input hidden when bonding curve selected
- [ ] Form submission works

### Database
- [ ] Check MongoDB has new schema fields:
  ```javascript
  {
    useBondingCurve: Boolean,
    bondingCurvePool: String,
    bondingCurveConfig: String,
    // ... etc
  }
  ```

## First Production Test

### Deploy Test Token (Mainnet)
1. [ ] Connect wallet with ~0.1 SOL
2. [ ] Select "Bonding Curve" launch type
3. [ ] Fill minimal info:
   - Name: "Test Token"
   - Symbol: "TEST"
   - (Leave other fields default)
4. [ ] Deploy token
5. [ ] Verify deployment success
6. [ ] Check bonding curve pool created
7. [ ] Click trading link → Verify Meteora page loads
8. [ ] **IMPORTANT**: Save all wallet keypairs!

### Verify on Blockchain
- [ ] Check token on Solana Explorer: `https://explorer.solana.com/address/{mintAddress}`
- [ ] Check pool on Solana Explorer: `https://explorer.solana.com/address/{poolAddress}`
- [ ] Verify program interactions: Should see Meteora DBC program

## Rollback Plan (If Issues)

### If Backend Issues
```bash
# Revert to previous version
fly releases
fly rollback <version>
```

### If Frontend Issues
```bash
# Revert on Vercel dashboard
# Or redeploy previous version
vercel rollback
```

### Emergency Disable
To disable bonding curve without redeploying:
- Update database to set all new deployments to `useBondingCurve: false`
- Or add feature flag in env vars

## Monitoring

### First 24 Hours
- [ ] Monitor deployment success rate
- [ ] Check for errors in Fly logs: `fly logs`
- [ ] Monitor MongoDB for deployment records
- [ ] Check user feedback/support tickets

### First Week
- [ ] Track conversion rate (bonding curve vs traditional)
- [ ] Monitor average cost per deployment
- [ ] Track bonding curve pool creation success rate
- [ ] Collect user testimonials

## Marketing Announcement

### Social Media Posts
- [ ] Twitter announcement
- [ ] Discord announcement
- [ ] Telegram announcement
- [ ] Update landing page

### Key Messaging
- "Deploy Solana tokens for just $12 (was $247)"
- "95% cost reduction with bonding curve launches"
- "No upfront liquidity needed"
- "Earn 50% of all trading fees"
- "Auto-graduates to DEX at 85 SOL"

### Content Ideas
- [ ] Tutorial video showing deployment
- [ ] Comparison chart: PEPETOR vs competitors
- [ ] Case study: First successful bonding curve token
- [ ] Blog post explaining bonding curves

## Success Criteria

### Week 1
- [ ] 10+ successful bonding curve deployments
- [ ] 0 critical bugs
- [ ] >80% of users choose bonding curve over traditional
- [ ] Positive user feedback

### Week 2
- [ ] 50+ bonding curve deployments
- [ ] At least 1 token reaches migration threshold
- [ ] Creator testimonial about fee earnings
- [ ] Increased overall deployment volume

### Month 1
- [ ] 200+ bonding curve deployments
- [ ] Multiple successful migrations to DEX
- [ ] Measurable increase in platform revenue
- [ ] Featured on Solana community channels

## Support Resources

### User Questions
**Q: Why is bonding curve recommended?**  
A: 95% cheaper ($12 vs $247), no upfront liquidity needed, earn fees from trades

**Q: What happens at 85 SOL?**  
A: Auto-migrates to Meteora DEX, liquidity locked forever

**Q: Can I still use traditional DEX launch?**  
A: Yes! Just toggle to "Instant DEX" option

**Q: How do I trade my bonding curve token?**  
A: Click the Meteora trading link in success screen

### Known Issues
None currently identified. Update as discovered.

## Team Handoff

### Files to Review
- `BONDING_CURVE_COMPLETE.md` - Full implementation summary
- `BONDING_CURVE_IMPLEMENTATION.md` - Technical implementation guide
- `apps/api/src/services/bondingCurveService.js` - Core service
- `apps/web/src/pages/DeployTokenPage.jsx` - UI implementation

### Key Contacts
- Meteora Support: https://discord.com/invite/meteora
- Solana RPC: Helius/QuickNode support

---

## Final Checks Before Going Live

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Backend deployed and healthy
- [ ] Frontend deployed and tested
- [ ] Database schema updated
- [ ] Marketing materials ready
- [ ] Support team briefed
- [ ] Monitoring configured
- [ ] Rollback plan documented

**🚀 Ready to Launch!**
