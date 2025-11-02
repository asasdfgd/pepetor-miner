# Phase 3B Testing & Verification Guide

**Status**: ✅ READY FOR TESTING

## Quick Test (5 minutes)

### 1. Start Backend
```bash
cd backend
npm install  # if not done
npm run dev
# Expected: Server running on http://localhost:3001
```

### 2. Start Frontend
```bash
cd frontend
npm install  # if not done
npm run dev
# Expected: App running on http://localhost:3000
```

### 3. Login & Navigate to Dashboard
- Open http://localhost:3000
- Login with test credentials (from Phase 2)
- Click "Dashboard" in nav

### 4. Verify Components Render
**Expected on Dashboard:**
- ✅ **BalanceCard** at top (shows "💰 Your Balance" with 0 credits initially)
- ✅ **SessionSubmitForm** in middle (form with three preset buttons: Light, Medium, Heavy)
- ✅ **SessionHistory** below (initially empty)

### 5. Test Session Submission (Light Preset)
- Click **Light** button (30s, 1KB)
- Form should auto-fill and submit
- Expect success message: "✅ Session submitted successfully! Credits earned: X.XX"
- Balance should still show 0 (or newly calculated value)

### 6. Test Session History
- Scroll to SessionHistory section
- Click to expand submitted session
- Verify you see:
  - Session ID
  - Timestamp
  - Duration & Bytes
  - Status (✅ valid or ⚠️ warning)
  - Validation metadata

### 7. Test Balance Auto-Refresh
- Wait 30 seconds
- Balance should auto-update (if backend is calculating credits)
- Manual refresh: Click 🔄 button

## Issues & Solutions

### Issue: Frontend shows "Error: Failed to fetch balance"
**Solution:**
1. Verify backend is running: `curl http://localhost:3001/api/health`
2. Check `.env` in frontend has correct `VITE_API_BASE_URL`
3. Check CORS enabled in backend

### Issue: "tweetnacl is not defined"
**Solution:**
```bash
cd frontend
npm install tweetnacl
```

### Issue: Session submit shows error about signature
**Solution:**
1. Check browser console for full error
2. Verify sessionService is using tweetnacl correctly
3. Backend signature verification might be failing - check backend logs

### Issue: Balance shows "undefined" or "NaN"
**Solution:**
1. Backend might not be returning `currentBalance` field
2. Check sessionController.getBalance() response format
3. Verify backend is calculating credits

## Debug Mode

### View Client Keypair
In browser console:
```javascript
import sessionService from './src/services/sessionService.js'
sessionService.exportKeypair()
```

### Clear & Reset Keypair
```javascript
sessionService.resetKeypair()
```

### Test API Directly
```bash
curl http://localhost:3001/api/sessions/policy
curl "http://localhost:3001/api/sessions/balance?pubkey=YOUR_HEX_PUBLIC_KEY"
```

## Full Workflow Test

1. **Start services** → Backend + Frontend
2. **Login** → Authenticate
3. **Submit 3 sessions** → Light, Medium, Heavy
4. **View history** → All 3 should appear
5. **Check balance** → Should show earned credits
6. **Refresh** → Balance persists
7. **Restart browser** → Keypair persists in localStorage

## Expected Credits

- **Light**: 30s/1KB ≈ 3-5 credits
- **Medium**: 120s/10KB ≈ 12-25 credits
- **Heavy**: 300s/50KB ≈ 40-75 credits

Total after all 3: ≈ 55-105 credits

## Performance Expectations

- Balance load: < 500ms
- Session list load: < 1s
- Form submission: < 2s
- Auto-refresh interval: 30 seconds

## Files Changed This Phase

- ✅ frontend/src/components/BalanceCard.jsx (new)
- ✅ frontend/src/components/BalanceCard.css (new)
- ✅ frontend/src/components/SessionSubmitForm.jsx (new)
- ✅ frontend/src/components/SessionSubmitForm.css (new)
- ✅ frontend/src/components/SessionHistory.jsx (new)
- ✅ frontend/src/components/SessionHistory.css (new)
- ✅ frontend/src/services/sessionService.js (new)
- ✅ frontend/src/pages/DashboardPage.jsx (modified)
- ✅ frontend/src/pages/DashboardPage.css (modified)
- ✅ frontend/package.json (tweetnacl added)

## Next Steps (Phase 3C)

After confirming Phase 3B works:
1. Native Tor process management
2. Auto-session submission from Tor activity
3. Real earning simulation