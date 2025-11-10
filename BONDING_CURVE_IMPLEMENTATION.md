# Meteora DBC Bonding Curve Implementation Guide

## Overview
Implement pump.fun-style bonding curve token launches using Meteora's Dynamic Bonding Curve (DBC) SDK to eliminate the upfront 0.4 SOL OpenBook market creation fee.

## Current System vs Target System

### Current Flow
1. User pays 0.073 SOL (deployment) + liquidity (e.g., 1 SOL) + 0.4 SOL (OpenBook market)
2. Token deploys with instant OpenBook market + Raydium pool
3. Total upfront cost: ~1.473 SOL (~$247)

### Target Flow (Bonding Curve)
1. User pays only 0.073 SOL (deployment fee)
2. Token deploys with Meteora DBC bonding curve pool
3. Users buy/sell on curve (no liquidity needed upfront)
4. When curve reaches threshold (e.g., 85 SOL collected), auto-migrates to Meteora DAMM v2 DEX
5. Total deployment cost: 0.073 SOL (~$12)

## Architecture Changes

### Phase 1: Backend Implementation (apps/api)

#### 1.1 Install Dependencies
```bash
cd apps/api
npm install @meteora-ag/dynamic-bonding-curve-sdk bn.js
```

#### 1.2 Create New Service: `apps/api/src/services/bondingCurveService.js`

Create a new service that handles:
- Creating DBC config keys
- Creating bonding curve pools
- Swap quote calculations
- Pool state queries

**Key Functions to Implement:**
```javascript
class BondingCurveService {
  constructor() {
    // Initialize Solana connection and DynamicBondingCurveClient
  }

  async createConfigAndPool({
    tokenName,
    tokenSymbol,
    tokenMint, // PublicKey of already-created token
    totalSupply,
    deployer, // Keypair
    initialMarketCap = 30, // Starting market cap in SOL
    migrationMarketCap = 85, // Market cap threshold to migrate to DEX
  }) {
    // Step 1: Generate config keypair
    // Step 2: Build curve config using buildCurveWithMarketCap()
    // Step 3: Create config account using client.partner.createConfig()
    // Step 4: Create pool using client.pool.createPool()
    // Return: { configAddress, poolAddress, transactionSignature }
  }

  async getPoolState(poolAddress) {
    // Fetch pool state using client.state.getPool()
    // Return: pool details including reserves, price, isMigrated
  }

  async getSwapQuote({ poolAddress, amountIn, swapBaseForQuote }) {
    // Get swap quote using client.pool.swapQuote()
    // Return: { amountOut, minimumAmountOut, price, fee }
  }
}
```

**Configuration Parameters to Use:**
```javascript
const curveConfig = buildCurveWithMarketCap({
  totalTokenSupply: 1000000000, // 1B tokens
  initialMarketCap: 30, // ~$5,000 starting price (30 SOL at $167/SOL)
  migrationMarketCap: 85, // ~$14,000 graduation (85 SOL)
  migrationOption: MigrationOption.MET_DAMM_V2, // Migrate to Meteora DAMM v2
  tokenBaseDecimal: TokenDecimal.NINE, // 9 decimals for base token
  tokenQuoteDecimal: TokenDecimal.NINE, // 9 decimals for quote (SOL)
  lockedVestingParam: {
    totalLockedVestingAmount: 0,
    numberOfVestingPeriod: 0,
    cliffUnlockAmount: 0,
    totalVestingDuration: 0,
    cliffDurationFromMigrationTime: 0,
  },
  baseFeeParams: {
    baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
    feeSchedulerParam: {
      startingFeeBps: 100, // 1% trading fee
      endingFeeBps: 100,
      numberOfPeriod: 0,
      totalDuration: 0,
    },
  },
  dynamicFeeEnabled: true, // Enable anti-sniper dynamic fees
  activationType: ActivationType.Slot,
  collectFeeMode: CollectFeeMode.QuoteToken, // Collect fees in SOL
  migrationFeeOption: MigrationFeeOption.FixedBps100, // 1% migration fee
  tokenType: TokenType.SPL,
  partnerLpPercentage: 0,
  creatorLpPercentage: 0,
  partnerLockedLpPercentage: 0,
  creatorLockedLpPercentage: 100, // Lock 100% of LP tokens on migration
  creatorTradingFeePercentage: 50, // Creator gets 50% of trading fees
  leftover: 0,
  tokenUpdateAuthority: TokenUpdateAuthorityOption.Immutable,
  migrationFee: {
    feePercentage: 0,
    creatorFeePercentage: 0,
  },
});
```

#### 1.3 Modify `apps/api/src/services/tokenDeploymentService.js`

**Changes Required:**
1. Import the new BondingCurveService
2. In `deployCustomToken()` method, after token creation:
   - If `useBondingCurve: true` in config:
     - Call `bondingCurveService.createConfigAndPool()` instead of OpenBook/Raydium flow
     - Store bonding curve pool address in deployment record
   - Else: use existing OpenBook/Raydium flow

**Code Location:** Around line 90-210 in `tokenDeploymentService.js`

```javascript
// Add after token mint creation
if (config.useBondingCurve) {
  console.log('🎢 Creating Meteora Bonding Curve pool...');
  const bondingCurveResult = await this.bondingCurveService.createConfigAndPool({
    tokenName,
    tokenSymbol,
    tokenMint: mint.publicKey,
    totalSupply,
    deployer: this.deployerKeypair,
    initialMarketCap: config.bondingCurveInitialMC || 30,
    migrationMarketCap: config.bondingCurveMigrationMC || 85,
  });
  
  return {
    ...baseResult,
    bondingCurvePool: bondingCurveResult.poolAddress.toString(),
    bondingCurveConfig: bondingCurveResult.configAddress.toString(),
    tradingUrl: `https://app.meteora.ag/dlmm/${bondingCurveResult.poolAddress.toString()}`,
  };
}
```

#### 1.4 Update `apps/api/src/controllers/tokenDeploymentController.js`

**Changes in `getPrice()` endpoint (line ~20-50):**
```javascript
const getPrice = async (req, res) => {
  try {
    const { liquidityAmount, useBondingCurve } = req.query;
    
    if (useBondingCurve === 'true') {
      // Bonding curve: no upfront liquidity or OpenBook fee
      const deploymentPrice = 0.073;
      const totalPrice = deploymentPrice;
      const solPrice = await tokenDeploymentService.fetchSOLPrice();
      
      return res.json({
        success: true,
        deploymentPrice,
        liquidityAmount: 0,
        marketCreationCost: 0,
        totalPrice,
        priceUSD: (totalPrice * solPrice).toFixed(2),
        treasuryWallet: TREASURY_WALLET,
        launchType: 'bonding_curve',
      });
    }
    
    // Existing logic for traditional launch
    // ...
  } catch (error) {
    // ...
  }
};
```

#### 1.5 Add New Routes: `apps/api/src/routes/bondingCurveRoutes.js`

Create new API endpoints:
- `GET /api/bonding-curve/pool/:address` - Get pool state
- `POST /api/bonding-curve/quote` - Get swap quote
- `GET /api/bonding-curve/chart/:address` - Get price history for chart

```javascript
const express = require('express');
const router = express.Router();
const bondingCurveService = require('../services/bondingCurveService');

router.get('/pool/:address', async (req, res) => {
  try {
    const poolState = await bondingCurveService.getPoolState(req.params.address);
    res.json({ success: true, pool: poolState });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/quote', async (req, res) => {
  try {
    const { poolAddress, amountIn, swapBaseForQuote } = req.body;
    const quote = await bondingCurveService.getSwapQuote({
      poolAddress,
      amountIn,
      swapBaseForQuote,
    });
    res.json({ success: true, quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

Register routes in `apps/api/src/server.js`:
```javascript
const bondingCurveRoutes = require('./routes/bondingCurveRoutes');
app.use('/api/bonding-curve', bondingCurveRoutes);
```

#### 1.6 Update Database Model: `apps/api/src/models/DeployedToken.js`

Add new fields around line 30-60:
```javascript
{
  // Existing fields...
  
  // Bonding curve fields
  useBondingCurve: {
    type: Boolean,
    default: false,
  },
  bondingCurvePool: {
    type: String,
    default: null,
  },
  bondingCurveConfig: {
    type: String,
    default: null,
  },
  bondingCurveInitialMC: {
    type: Number,
    default: 30,
  },
  bondingCurveMigrationMC: {
    type: Number,
    default: 85,
  },
  isMigrated: {
    type: Boolean,
    default: false,
  },
  migratedPoolAddress: {
    type: String,
    default: null,
  },
}
```

### Phase 2: Frontend Implementation (apps/web)

#### 2.1 Install Dependencies
```bash
cd apps/web
npm install @meteora-ag/dynamic-bonding-curve-sdk bn.js recharts
```

#### 2.2 Update `apps/web/src/pages/DeployTokenPage.jsx`

**Add Launch Type Selection (before liquidity input, around line 715):**
```jsx
<div className="form-group launch-type-group">
  <label>🚀 Launch Type</label>
  <div className="launch-type-options">
    <button
      type="button"
      className={`launch-type-btn ${!formData.useBondingCurve ? 'active' : ''}`}
      onClick={() => setFormData(prev => ({ ...prev, useBondingCurve: false }))}
    >
      <div className="launch-type-header">
        <span className="launch-type-icon">⚡</span>
        <span className="launch-type-name">Instant DEX</span>
      </div>
      <div className="launch-type-details">
        <p>• Immediate trading on Raydium</p>
        <p>• Requires upfront liquidity</p>
        <p>• Cost: ~1.5 SOL total</p>
      </div>
    </button>
    
    <button
      type="button"
      className={`launch-type-btn ${formData.useBondingCurve ? 'active' : ''}`}
      onClick={() => setFormData(prev => ({ ...prev, useBondingCurve: true }))}
    >
      <div className="launch-type-header">
        <span className="launch-type-icon">📈</span>
        <span className="launch-type-name">Bonding Curve (Recommended)</span>
        <span className="badge-new">NEW</span>
      </div>
      <div className="launch-type-details">
        <p>✅ No upfront liquidity needed</p>
        <p>✅ Auto-graduates to DEX at 85 SOL</p>
        <p>✅ Cost: Only 0.073 SOL</p>
        <p>✅ Earn fees from every trade</p>
      </div>
    </button>
  </div>
</div>
```

**Update Pricing Fetch (modify `fetchPricing` function around line 49):**
```javascript
const fetchPricing = async (liquidityAmount = formData.liquidityAmount) => {
  try {
    const useBondingCurve = formData.useBondingCurve || false;
    const url = `${import.meta.env.VITE_API_BASE_URL}/token-deployment/price?liquidityAmount=${liquidityAmount || 0}&useBondingCurve=${useBondingCurve}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('API pricing response:', data);
    if (data.success) {
      setPricing(data);
    }
  } catch (error) {
    console.error('Failed to fetch pricing:', error);
  }
};
```

**Update Form Data State (line 15):**
```javascript
const [formData, setFormData] = useState({
  tokenName: '',
  tokenSymbol: '',
  totalSupply: '1000000000',
  decimals: '9',
  description: '',
  website: '',
  twitter: '',
  walletAddress: '',
  liquidityAmount: '1',
  useBondingCurve: true, // Default to bonding curve
});
```

**Conditionally Show Liquidity Input (modify around line 716):**
```jsx
{!formData.useBondingCurve && (
  <div className="form-group liquidity-group">
    <label htmlFor="liquidityAmount">
      🚀 Instant Launch Liquidity (SOL)
    </label>
    {/* Existing liquidity input */}
  </div>
)}

{formData.useBondingCurve && (
  <div className="bonding-curve-info">
    <h4>📈 Bonding Curve Launch</h4>
    <ul>
      <li>✅ No upfront liquidity required</li>
      <li>✅ Token price increases as more SOL is added</li>
      <li>✅ Auto-graduates to Meteora DEX at 85 SOL market cap</li>
      <li>✅ You earn 50% of all trading fees</li>
      <li>✅ Buyers can sell back to curve before graduation</li>
    </ul>
  </div>
)}
```

**Update Deploy Handler (modify `handleDeploy` around line 168):**
```javascript
const formDataToSend = new FormData();
formDataToSend.append('tokenName', formData.tokenName);
formDataToSend.append('tokenSymbol', formData.tokenSymbol);
formDataToSend.append('totalSupply', formData.totalSupply);
formDataToSend.append('decimals', formData.decimals);
formDataToSend.append('description', formData.description);
formDataToSend.append('paymentSignature', signature);
formDataToSend.append('paymentMethod', 'SOL');
formDataToSend.append('useBondingCurve', formData.useBondingCurve.toString());

// Only add liquidity params if NOT using bonding curve
if (!formData.useBondingCurve) {
  const liquidityAmount = parseFloat(formData.liquidityAmount) || 0;
  if (liquidityAmount > 0) {
    formDataToSend.append('createPool', 'true');
    formDataToSend.append('poolLiquiditySOL', liquidityAmount.toString());
  }
}
```

#### 2.3 Create Bonding Curve Trading UI: `apps/web/src/components/BondingCurveTrading.jsx`

Create a new component for trading on the bonding curve:

```jsx
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import BN from 'bn.js';
import './BondingCurveTrading.css';

const BondingCurveTrading = ({ poolAddress, tokenSymbol, tokenName }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [poolState, setPoolState] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [buyQuote, setBuyQuote] = useState(null);
  const [sellQuote, setSellQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPoolState();
    const interval = setInterval(fetchPoolState, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, [poolAddress]);

  const fetchPoolState = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bonding-curve/pool/${poolAddress}`);
      const data = await response.json();
      if (data.success) {
        setPoolState(data.pool);
      }
    } catch (error) {
      console.error('Failed to fetch pool state:', error);
    }
  };

  const handleBuy = async () => {
    if (!publicKey || !buyAmount) return;
    
    setLoading(true);
    try {
      const client = new DynamicBondingCurveClient(connection, 'confirmed');
      const pool = new PublicKey(poolAddress);
      
      const swapTx = await client.pool.swap({
        amountIn: new BN(parseFloat(buyAmount) * 1e9), // SOL amount
        minimumAmountOut: new BN(0), // Use quote for slippage
        swapBaseForQuote: false, // Buying tokens with SOL
        owner: publicKey,
        pool: pool,
        referralTokenAccount: null,
      });

      const signature = await sendTransaction(swapTx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      alert(`✅ Bought ${tokenSymbol}! Tx: ${signature}`);
      fetchPoolState();
      setBuyAmount('');
    } catch (error) {
      console.error('Buy failed:', error);
      alert('❌ Buy failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!poolState) return 0;
    const threshold = 85; // 85 SOL migration threshold
    const current = poolState.quoteReserve / 1e9;
    return Math.min((current / threshold) * 100, 100);
  };

  if (!poolState) {
    return <div>Loading pool data...</div>;
  }

  const progress = calculateProgress();
  const currentPrice = poolState.sqrtPrice ? (poolState.sqrtPrice / 1e9) ** 2 : 0;
  const marketCap = (poolState.quoteReserve / 1e9) * 167; // Approximate USD

  return (
    <div className="bonding-curve-trading">
      <h2>📈 Trade {tokenSymbol}</h2>
      
      <div className="pool-stats">
        <div className="stat">
          <label>Current Price</label>
          <value>{currentPrice.toFixed(8)} SOL</value>
        </div>
        <div className="stat">
          <label>Market Cap</label>
          <value>${marketCap.toFixed(2)}</value>
        </div>
        <div className="stat">
          <label>SOL Raised</label>
          <value>{(poolState.quoteReserve / 1e9).toFixed(2)} / 85 SOL</value>
        </div>
      </div>

      <div className="migration-progress">
        <label>🎯 Progress to DEX Migration</label>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span>{progress.toFixed(1)}%</span>
      </div>

      {poolState.isMigrated && (
        <div className="migration-notice">
          🎉 This token has graduated to Meteora DEX!
          <a href={`https://app.meteora.ag/pools/${poolState.migratedPool}`} target="_blank">
            Trade on DEX →
          </a>
        </div>
      )}

      {!poolState.isMigrated && (
        <div className="trading-panel">
          <div className="trade-box">
            <h3>Buy {tokenSymbol}</h3>
            <input
              type="number"
              placeholder="SOL amount"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              step="0.01"
            />
            <button onClick={handleBuy} disabled={loading || !buyAmount}>
              {loading ? 'Processing...' : `Buy ${tokenSymbol}`}
            </button>
          </div>

          <div className="trade-box">
            <h3>Sell {tokenSymbol}</h3>
            <input
              type="number"
              placeholder="Token amount"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              step="1"
            />
            <button disabled={loading || !sellAmount}>
              {loading ? 'Processing...' : `Sell ${tokenSymbol}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BondingCurveTrading;
```

#### 2.4 Update Success Screen in `DeployTokenPage.jsx`

After deployment success (around line 313), conditionally show bonding curve info:

```jsx
{deploymentStatus.useBondingCurve && deploymentStatus.bondingCurvePool && (
  <div className="bonding-curve-success">
    <h3>📈 Bonding Curve Pool Created!</h3>
    <div className="detail-item">
      <label>Pool Address:</label>
      <code>{deploymentStatus.bondingCurvePool}</code>
      <button onClick={() => copyToClipboard(deploymentStatus.bondingCurvePool, 'Pool address')} className="copy-btn">
        Copy
      </button>
    </div>
    <div className="detail-item">
      <label>Trading Page:</label>
      <a href={`/trade/${deploymentStatus.bondingCurvePool}`} className="btn btn-primary">
        Start Trading →
      </a>
    </div>
    <div className="bonding-curve-explainer">
      <h4>What's Next?</h4>
      <p>✅ Your token is now live on a bonding curve!</p>
      <p>📈 Share the trading link with your community</p>
      <p>💰 You earn 50% of all trading fees</p>
      <p>🎯 At 85 SOL raised, token auto-migrates to Meteora DEX</p>
      <p>🔥 After migration, liquidity is locked forever</p>
    </div>
  </div>
)}
```

#### 2.5 Create Trading Page: `apps/web/src/pages/TradePage.jsx`

Create a new page for trading specific bonding curve tokens:

```jsx
import { useParams } from 'react-router-dom';
import BondingCurveTrading from '../components/BondingCurveTrading';
import './TradePage.css';

const TradePage = () => {
  const { poolAddress } = useParams();
  
  return (
    <div className="trade-page">
      <BondingCurveTrading poolAddress={poolAddress} />
    </div>
  );
};

export default TradePage;
```

Add route in `apps/web/src/App.jsx`:
```jsx
import TradePage from './pages/TradePage';

// In routes:
<Route path="/trade/:poolAddress" element={<TradePage />} />
```

#### 2.6 Add CSS Styles

Create `apps/web/src/components/BondingCurveTrading.css`:
```css
.bonding-curve-trading {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.pool-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 12px;
  color: white;
}

.stat label {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.migration-progress {
  margin: 2rem 0;
}

.progress-bar {
  height: 40px;
  background: #e0e0e0;
  border-radius: 20px;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
}

.trading-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.trade-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.trade-box input {
  width: 100%;
  padding: 1rem;
  margin: 1rem 0;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.125rem;
}

.trade-box button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.trade-box button:hover:not(:disabled) {
  transform: scale(1.02);
}

.trade-box button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.launch-type-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

.launch-type-btn {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.launch-type-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.launch-type-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.launch-type-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.launch-type-icon {
  font-size: 1.5rem;
}

.launch-type-name {
  font-weight: bold;
  font-size: 1.125rem;
}

.badge-new {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: auto;
}

.launch-type-details p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
}

.bonding-curve-info {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1rem 0;
}

.bonding-curve-info h4 {
  margin-top: 0;
}

.bonding-curve-info ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.bonding-curve-info li {
  margin: 0.5rem 0;
}
```

### Phase 3: Environment Configuration

#### 3.1 Update `.env` files

**apps/api/.env:**
```bash
# Existing vars...

# Meteora Bonding Curve
METEORA_FEE_CLAIMER=<YOUR_WALLET_ADDRESS>
METEORA_LEFTOVER_RECEIVER=<YOUR_WALLET_ADDRESS>
```

### Phase 4: Testing Checklist

#### Backend Tests
- [ ] Config and pool creation works on devnet
- [ ] Pool state query returns correct data
- [ ] Swap quote calculation works
- [ ] Trading fees are calculated correctly
- [ ] Migration triggers at correct threshold

#### Frontend Tests
- [ ] Launch type toggle works
- [ ] Pricing updates based on launch type
- [ ] Bonding curve info displays correctly
- [ ] Trading UI connects to wallet
- [ ] Buy/sell transactions execute successfully
- [ ] Pool stats update in real-time
- [ ] Migration progress bar displays correctly

#### Integration Tests
- [ ] Full flow: deploy → trade → migrate
- [ ] Cost is 0.073 SOL for bonding curve launch
- [ ] Token creator receives trading fees
- [ ] LP tokens locked after migration

### Phase 5: Deployment

#### 5.1 Deploy Backend
```bash
cd apps/api
fly deploy
```

#### 5.2 Deploy Frontend
```bash
cd apps/web
npm run build
vercel --prod
```

#### 5.3 Announce Feature
- Update landing page with new pricing
- Create tutorial video
- Write blog post explaining bonding curve benefits
- Share on Twitter/Discord

## Key Implementation Notes

### Security Considerations
1. Always validate pool addresses
2. Implement slippage protection on swaps
3. Add rate limiting to swap endpoints
4. Validate user has sufficient balance before swaps

### UX Considerations
1. Show clear progress to migration
2. Explain what happens at migration
3. Display trading fees prominently
4. Add price chart if possible (use Recharts)
5. Show transaction history

### Performance Considerations
1. Cache pool states (5-10 second refresh)
2. Batch RPC calls where possible
3. Use WebSocket for real-time price updates (optional)
4. Optimize quote calculations

### Error Handling
1. Handle RPC failures gracefully
2. Show user-friendly error messages
3. Log all errors to monitoring service
4. Implement retry logic for transactions

## Success Metrics

After implementation, track:
- Deployment conversion rate (should increase significantly)
- Average time to migration (how long tokens take to reach 85 SOL)
- Trading volume on bonding curves
- Creator fee earnings
- User satisfaction with new flow

## References

- Meteora DBC Docs: https://docs.meteora.ag/developer-guide/guides/dbc/typescript-sdk/getting-started
- Meteora DBC SDK: https://www.npmjs.com/package/@meteora-ag/dynamic-bonding-curve-sdk
- Example Scripts: https://docs.meteora.ag/developer-guide/guides/dbc/typescript-sdk/example-scripts
- Bonding Curve Formulas: https://docs.meteora.ag/overview/products/dbc/bonding-curve-formulas

## Estimated Implementation Time

- Backend: 6-8 hours
- Frontend: 4-6 hours  
- Testing: 2-3 hours
- **Total: 12-17 hours**

## Post-Implementation Tasks

1. Update documentation
2. Create user guide for bonding curve launches
3. Add analytics tracking
4. Monitor first 10 deployments closely
5. Gather user feedback
6. Optimize based on usage patterns
