# Chrome Extension Setup & Testing Guide

## Overview
This guide walks you through loading the PEPETOR Miner extension in Chrome and testing all functionality.

---

## Part 1: Prepare Your Environment

### Prerequisites
- Chrome/Chromium browser (latest version)
- Backend running: `npm run dev` in `/backend`
- Frontend running: `npm run dev` in `/frontend`
- MongoDB running

### Verify Services
```bash
# Backend should be running on http://localhost:3001
# Frontend should be running on http://localhost:3000
# Check Chrome DevTools console for any errors
```

---

## Part 2: Load Extension in Chrome

### Step 1: Open Chrome Extensions Page
1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)

### Step 2: Load Unpacked Extension
1. Click **Load unpacked**
2. Navigate to: `/Users/josephpietravalle/PEPETOR-MINER/chrome-extension`
3. Click **Select Folder**
4. Extension should load with purple "P" icon

### Step 3: Pin Extension to Toolbar
1. Click puzzle icon in toolbar
2. Find "PEPETOR Miner"
3. Click pin icon to make always visible

---

## Part 3: Initial Configuration

### Configure API URL & Token
1. Click extension icon (purple P)
2. Click **Settings** button (bottom)
3. In **API Configuration**:
   - API URL: `http://localhost:3001/api`
   - (Token will be auto-filled after login)

### Test Connection
1. Keep settings page open
2. Go to frontend: `http://localhost:3000`
3. Login with test account
4. Check extension settings - token should auto-populate
5. Click **Test Connection**
6. Should see green success message

---

## Part 4: Test Extension Functionality

### Test 1: Login Flow & Auto-Sync
**Scenario**: Login via web app, extension gets token
1. Close extension popup
2. Open frontend: `http://localhost:3000`
3. Login with test credentials
4. Click extension icon (popup should open)
5. **Expected**: 
   - ✅ Shows balance
   - ✅ Tor status visible
   - ✅ Settings saved token

### Test 2: Balance Display
**Scenario**: Balance matches across web app and extension
1. Login on web app (make sure backend has test data)
2. Open extension popup
3. Go to web app dashboard
4. **Expected**:
   - ✅ Balance in extension ≈ Balance in app
   - ✅ Updates within 5 seconds

### Test 3: Tor Control (if Tor running)
**Scenario**: Control Tor from extension
1. Ensure Tor is installed on system
2. In extension popup:
   - Click **Start Tor** button
   - Wait 2-3 seconds
3. **Expected**:
   - ✅ Status changes to "running"
   - ✅ Byte stats appear
   - ✅ Blue spinner on sync button

### Test 4: Monitoring Controls
**Scenario**: Start/stop auto-submission monitoring
1. In extension popup (with Tor running):
   - Click **Start Monitoring** button
2. **Expected**:
   - ✅ Submission badge shows "monitoring"
   - ✅ Submitted count updates
   - ✅ Credits earned increments

### Test 5: Manual Sync
**Scenario**: Force sync button updates data
1. In extension popup:
   - Click refresh icon (sync button)
2. **Expected**:
   - ✅ Button shows spinner animation
   - ✅ All values refresh
   - ✅ Last sync time updates

### Test 6: Navigation
**Scenario**: Links from popup work
1. In extension popup:
   - Click **Open Dashboard**
   - Should open http://localhost:3000/dashboard in new tab
2. Click extension icon again:
   - Click **Settings** 
   - Should open extension settings page

### Test 7: Logout
**Scenario**: Logout clears extension state
1. In extension popup:
   - Click **Logout** (bottom)
   - Confirm
2. **Expected**:
   - ✅ Extension shows "Not Logged In" state
   - ✅ All controls disabled
   - ✅ Token cleared from storage

---

## Part 5: Fallback Mode Testing

### Test 8: Web App Closed Fallback
**Scenario**: Extension works even without app tab open
1. Login on web app
2. Close frontend tab (but keep backend running)
3. Click extension icon
4. **Expected**:
   - ✅ Still shows balance (from API fallback)
   - ✅ Still shows Tor status
   - ✅ No 404 errors in extension console

### Test 9: Dual Connection Mode
**Scenario**: Works through both app tab and direct API
1. Open web app in one tab
2. Check extension (should use app connection)
3. Close web app tab
4. Open different tab (youtube, etc)
5. Check extension (should fallback to API)
6. **Expected**:
   - ✅ Balance same in both modes
   - ✅ No errors in console

---

## Part 6: Debug & Troubleshooting

### Check Extension Logs

**Background Service Worker Logs**:
1. Go to `chrome://extensions/`
2. Find "PEPETOR Miner"
3. Click **Service Worker** link
4. DevTools opens with background script logs
5. Look for `[PEPETOR]` prefixed messages

**Popup Console**:
1. Right-click extension icon
2. Select **Inspect popup**
3. Go to Console tab
4. Look for `[POPUP]` messages

**Content Script Logs**:
1. Open web app: `http://localhost:3000`
2. Right-click → Inspect
3. Go to Console tab
4. Look for `[CONTENT]` and `[BRIDGE]` messages

### Common Issues

**❌ "Not Logged In" State Always**
- Check background worker logs
- Verify token saved to settings
- Check if backend is running
- Try clicking "Test Connection" in settings

**❌ Balance Always Shows 0**
- Verify backend `/api/sessions/balance/:pubkey` endpoint
- Check token format (first 43 chars extracted)
- Look for 401 errors in background worker logs
- Try manual sync

**❌ Tor Status Stays "Unknown"**
- Check if Tor installed: `which tor`
- Check backend `/api/tor/status` endpoint
- Verify backend can access Tor socket/port
- Check for permission errors in logs

**❌ Popup Won't Open**
- Check if extension loaded properly (no red X)
- Look for manifest errors in extension page
- Try reloading extension (refresh button)
- Check for 401 errors (usually auth issue)

**❌ Icon Not Showing**
- Images should be `.svg` files (fixed)
- Location: `/chrome-extension/images/icon-*.svg`
- Reload extension if files added
- Try restarting Chrome

---

## Part 7: Settings Advanced Options

### Sync Interval Configuration
1. Open extension settings
2. In **Sync Settings**:
   - Default: 5 seconds
   - Range: 3-60 seconds
   - Lower = more responsive but more API calls
   - Higher = less API calls but slower updates

### Testing Custom Intervals
- Set to 3 seconds (most responsive)
- Watch balance update very quickly
- Set to 60 seconds (least responsive)
- Watch balance update slowly

### Storage Clearing
1. In settings page:
   - Click **Clear All Data**
   - Confirms clearing all extension data
2. **Expected**:
   - ✅ Token removed
   - ✅ Settings reset to defaults
   - ✅ Extension shows "Not Logged In"

---

## Part 8: Production Deployment Checklist

Before deploying to production:

- [ ] Replace `http://localhost:3001` with production backend URL
- [ ] Replace `http://localhost:3000` with production frontend URL  
- [ ] Add real app icons (replace SVG placeholder icons)
- [ ] Test with production backend
- [ ] Verify CORS settings on backend
- [ ] Set up HTTPS endpoints
- [ ] Test token refresh logic
- [ ] Update manifest version for publish
- [ ] Add privacy policy
- [ ] Test all scenarios with real user accounts

---

## Part 9: Quick Test Checklist

Use this to quickly verify everything works:

```
☐ Extension loads without errors
☐ Icon visible in toolbar
☐ Settings page opens
☐ Token syncs from login
☐ Test connection passes
☐ Balance displays correctly
☐ Popup auto-updates every 5 seconds
☐ Tor start/stop buttons work
☐ Monitoring toggle works
☐ Logout clears state
☐ Works with app closed (fallback)
☐ Manual sync button works
☐ No console errors
☐ No 401 auth errors
```

---

## Summary

You now have a fully functional Chrome extension that:
✅ Loads without errors
✅ Communicates with backend API
✅ Syncs with React web app
✅ Shows balance and Tor status
✅ Controls Tor and monitoring
✅ Has settings and configuration
✅ Works in fallback mode

**Next Step**: See `PHASE_4B_ENHANCEMENTS.md` for planned improvements like:
- Session history charts
- Earnings graphs
- Multiple account profiles
- Hardware wallet integration