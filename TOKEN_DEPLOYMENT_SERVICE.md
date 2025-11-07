# 🪙 Token Deployment Service

Revenue stream #2: Let users deploy their own mineable tokens.

---

## 💡 Concept

**Users pay to deploy custom mineable tokens** - like pump.fun but for mineable tokens on Solana.

### Value Proposition

- ✅ Deploy your own token in 5 minutes
- ✅ No coding required
- ✅ Mineable by your community
- ✅ 4 specialized wallets (Treasury, Rewards, Liquidity, Marketing)
- ✅ Ready for Raydium listing
- ✅ Full ownership & control

---

## 💰 Pricing

### Current Pricing (SOL)
- **0.05 SOL** (~$10) per token deployment
- Covers: Gas fees + service fee

### Future Pricing ($PEPETOR)
- **10,000 $PEPETOR** per token deployment
- Creates utility for $PEPETOR
- Burns or sends to treasury

---

## 🔧 How It Works

### User Flow

```
1. User connects wallet
   └─ Phantom/Solflare

2. User fills form
   ├─ Token Name (e.g., "DogeMiner")
   ├─ Token Symbol (e.g., "DMINE")
   ├─ Total Supply (default: 1B)
   ├─ Decimals (default: 9)
   └─ Description (optional)

3. User pays 0.05 SOL
   └─ Sent to your Treasury wallet

4. Backend deploys token
   ├─ Creates SPL token mint
   ├─ Generates 4 wallets
   │   ├─ Treasury (20%)
   │   ├─ Rewards (30%)
   │   ├─ Liquidity (20%)
   │   └─ Marketing (15%)
   └─ Mints tokens to wallets

5. User receives:
   ├─ Token mint address
   ├─ All wallet addresses
   ├─ Private keys (downloaded securely)
   └─ Next steps guide
```

---

## 🏗️ Technical Implementation

### Backend (Already Built)

**API Endpoints:**
```
GET  /api/token-deployment/price
     → Returns current pricing (SOL or PEPETOR)

POST /api/token-deployment/deploy
     → Deploys token after payment verification
     Requires: JWT auth, payment signature

GET  /api/token-deployment/status/:deploymentId
     → Check deployment status

GET  /api/token-deployment/my-deployments
     → List all user's deployed tokens
```

**Database Model:** `DeployedToken`
- Tracks all deployed tokens
- Stores mint addresses
- Links to user wallet
- Stores payment signatures

**Service:** `tokenDeploymentService.js`
- Verifies SOL/PEPETOR payments
- Deploys custom tokens
- Generates wallets
- Configurable allocations

### Frontend (Already Built)

**Page:** `/deploy-token`
- Beautiful form UI
- Real-time pricing
- Payment flow (Phantom)
- Deployment progress tracker
- Success screen with details

---

## 💳 Payment Flow

### SOL Payment (Current)

```
1. User clicks "Deploy Token"
2. Phantom popup: "Send 0.05 SOL to Treasury"
3. User confirms
4. Transaction signature returned
5. Backend verifies payment on-chain
6. Deployment starts
7. User gets token details
```

### $PEPETOR Payment (Coming Soon)

```
1. User selects "Pay with $PEPETOR"
2. Backend shows: "10,000 $PEPETOR"
3. Phantom popup: "Send 10,000 $PEPETOR to Treasury"
4. User confirms
5. Backend verifies token transfer
6. Deployment starts
7. User gets token details
```

---

## 📊 Revenue Potential

### Assumptions
- **Pricing:** $10 per deployment
- **Cost:** ~$2 gas fees
- **Profit:** ~$8 per deployment

### Projections

| Deployments/Month | Revenue | Costs | Profit |
|-------------------|---------|-------|--------|
| 10 | $100 | $20 | $80 |
| 50 | $500 | $100 | $400 |
| 100 | $1,000 | $200 | $800 |
| 500 | $5,000 | $1,000 | $4,000 |
| 1,000 | $10,000 | $2,000 | $8,000 |

**If 1% of users deploy tokens:**
- 1,000 users → 10 deployments/month → **$80/month**
- 10,000 users → 100 deployments/month → **$800/month**
- 100,000 users → 1,000 deployments/month → **$8,000/month**

---

## 🎯 Marketing Angles

### Taglines

1. **"Launch Your Own Mineable Token in 5 Minutes"**
2. **"No Code Token Deployment on Solana"**
3. **"Turn Your Community into Miners"**
4. **"Pump.fun for Mineable Tokens"**

### Use Cases

**1. Communities**
- Discord servers
- Gaming guilds
- Content creators
- DAO projects

**2. Projects**
- New crypto projects
- NFT collections
- DeFi protocols
- Social tokens

**3. Influencers**
- YouTube channels
- Twitter personalities
- TikTok creators
- Streamers

---

## 🚀 Launch Strategy

### Phase 1: Beta (Free)
- Launch to early users
- Get feedback
- Fix bugs
- Build case studies

### Phase 2: Paid Launch
- Enable 0.05 SOL payment
- Market to Solana communities
- Showcase successful deployments
- Build documentation

### Phase 3: $PEPETOR Integration
- Add $PEPETOR payment option
- Discount for $PEPETOR (e.g., 10% off)
- Burns or treasury allocation
- Creates $PEPETOR demand

### Phase 4: Advanced Features
- Custom metadata upload
- Logo upload
- Raydium pool creation
- LP token locking
- DexScreener auto-listing

---

## 🛠️ Configuration

### Backend .env

```bash
# Treasury wallet that receives payments
TREASURY_WALLET_ADDRESS=<your_treasury_wallet_public_key>

# After $PEPETOR deployment
PEPETOR_MINT_ADDRESS=<your_pepetor_mint>
```

**Important:** Set `TREASURY_WALLET_ADDRESS` to your Treasury wallet's **public key** (not the keypair file).

### Get Treasury Address

```bash
cd apps/api

# Install Solana CLI tools
npm install -g @solana/web3.js

# Extract public key from treasury keypair
node -e "
const fs = require('fs');
const { Keypair } = require('@solana/web3.js');
const data = JSON.parse(fs.readFileSync('.wallets/treasury-keypair.json'));
const keypair = Keypair.fromSecretKey(new Uint8Array(data));
console.log('Treasury Address:', keypair.publicKey.toString());
"
```

Copy the address and add to `.env`:
```
TREASURY_WALLET_ADDRESS=<address>
```

---

## 📋 Deployment Steps

### 1. Deploy $PEPETOR First

Follow `MAINNET_DEPLOYMENT.md` or `BUDGET_DEPLOYMENT.md` to deploy your main $PEPETOR token.

### 2. Get Treasury Address

```bash
cd apps/api
# Get treasury public key (see above)
```

### 3. Update .env

```bash
TREASURY_WALLET_ADDRESS=<treasury_public_key>
```

### 4. Restart API

```bash
npm run dev
```

### 5. Test Frontend

```bash
cd apps/web
npm run dev

# Visit http://localhost:5173/deploy-token
```

### 6. Test Deployment

1. Connect wallet
2. Fill form
3. Click "Deploy Token"
4. Confirm 0.05 SOL payment
5. Wait 2-5 minutes
6. Receive token details

---

## 🎨 Frontend Integration

### Add to Header/Nav

```jsx
<Link to="/deploy-token">Deploy Token</Link>
```

### Homepage CTA

```jsx
<section className="deploy-cta">
  <h2>🪙 Launch Your Own Token</h2>
  <p>Deploy a mineable token in minutes</p>
  <Link to="/deploy-token" className="btn">
    Get Started →
  </Link>
</section>
```

---

## 🔒 Security Considerations

### Payment Verification

- ✅ Verifies transaction on-chain
- ✅ Checks payment amount
- ✅ Prevents duplicate payments
- ✅ Records payment signature

### Wallet Generation

- ✅ Generates secure random keypairs
- ✅ Stores in isolated directories
- ✅ One directory per token
- ✅ User downloads private keys

### Rate Limiting

- ⚠️ **TODO:** Add rate limiting
- Max 5 deployments per user per day
- Prevents abuse

---

## 📊 Monitoring

### Track Metrics

**Database Queries:**
```javascript
// Total deployments
await DeployedToken.countDocuments({ status: 'deployed' });

// Revenue (SOL)
await DeployedToken.aggregate([
  { $match: { status: 'deployed', paymentMethod: 'SOL' } },
  { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
]);

// Top deployers
await DeployedToken.aggregate([
  { $group: { _id: '$owner', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);
```

### Analytics Dashboard (Future)

- Total deployments
- Revenue breakdown (SOL vs PEPETOR)
- Popular token names
- Success rate
- Average deployment time

---

## 🎁 Future Enhancements

### V2 Features

1. **Logo Upload**
   - Drag & drop logo
   - Auto-resize to 512x512
   - Upload to Arweave
   - Attach metadata

2. **One-Click Raydium Pool**
   - Create pool automatically
   - User provides SOL amount
   - Deploys token + pool together

3. **LP Lock Integration**
   - Auto-lock via Uncx.network
   - Included in deployment
   - Show lock certificate

4. **DexScreener Integration**
   - Auto-claim token page
   - Pre-fill metadata
   - Upload logo

5. **Bulk Deployments**
   - Deploy multiple tokens
   - Discounted pricing
   - CSV upload

6. **Token Templates**
   - Gaming token (40% rewards)
   - Community token (50% rewards)
   - Investment token (10% rewards)

---

## 💡 Marketing Ideas

### 1. Case Studies
- Feature successful deployments
- "How [User] launched [Token] in 5 minutes"
- Share revenue/growth numbers

### 2. Twitter Campaign
- Daily deployments showcase
- "Today's tokens: [list]"
- Retweet user launches

### 3. Affiliate Program
- Referral links
- 20% commission
- Track with codes

### 4. Bundle Deals
- Deploy 5 tokens, get 1 free
- Deploy 10 tokens, get 3 free

### 5. Contests
- "Best token name" contest
- "Most unique use case" award
- Winners featured

---

## ✅ Ready to Launch

Everything is built and ready:

- ✅ API endpoints
- ✅ Database models
- ✅ Payment verification
- ✅ Token deployment service
- ✅ Frontend page
- ✅ Progress tracking
- ✅ Success screen

**Just need to:**
1. Set `TREASURY_WALLET_ADDRESS` in `.env`
2. Test deployment flow
3. Market the service
4. Scale as demand grows

---

## 📞 Support

### Documentation
- Deployment guide for users
- FAQ page
- Video tutorials

### Customer Support
- Discord support channel
- Email support
- Troubleshooting guide

### Developer Resources
- API documentation
- Integration guide
- Webhook notifications (future)

---

## 🚀 Next Steps

1. **Test thoroughly** on devnet
2. **Set treasury address** in production
3. **Add to navigation** menu
4. **Create marketing page** on homepage
5. **Launch announcement** on social media
6. **Monitor deployments** and revenue
7. **Iterate based on feedback**
8. **Add $PEPETOR payment** after mainnet launch

Good luck! 🎉
