# Phase 4B Testing Validation Script

## Purpose
Automated checklist to verify Phase 4B-1 implementation is working correctly.

---

## Prerequisites Checklist

```bash
# 1. Verify backend running
curl http://localhost:3001/api/sessions/balance/test 2>/dev/null && echo "✅ Backend OK" || echo "❌ Backend down"

# 2. Verify frontend running  
curl http://localhost:3000 2>/dev/null && echo "✅ Frontend OK" || echo "❌ Frontend down"

# 3. Verify MongoDB running
# From another terminal:
mongo --eval "db.version()" 2>/dev/null && echo "✅ MongoDB OK" || echo "❌ MongoDB down"

# 4. Verify extension loaded
# Check chrome://extensions/ for PEPETOR Miner (should have purple P icon)
```

---

## Test 1: File Verification (2 minutes)

### Check all new files exist
```bash
# From /Users/josephpietravalle/PEPETOR-MINER directory:

# Services
test -f chrome-extension/services/StorageService.js && echo "✅ StorageService.js exists" || echo "❌ Missing StorageService.js"
test -f chrome-extension/services/AnalyticsService.js && echo "✅ AnalyticsService.js exists" || echo "❌ Missing AnalyticsService.js"

# Pages
test -f chrome-extension/pages/analytics.html && echo "✅ analytics.html exists" || echo "❌ Missing analytics.html"
test -f chrome-extension/pages/analytics.js && echo "✅ analytics.js exists" || echo "❌ Missing analytics.js"
test -f chrome-extension/pages/analytics.css && echo "✅ analytics.css exists" || echo "❌ Missing analytics.css"

# Updated files contain new code
grep -q "StorageService" chrome-extension/background.js && echo "✅ background.js updated" || echo "❌ background.js not updated"
grep -q "openAnalyticsBtn" chrome-extension/popup.html && echo "✅ popup.html updated" || echo "❌ popup.html not updated"
grep -q "openAnalyticsBtn" chrome-extension/popup.js && echo "✅ popup.js updated" || echo "❌ popup.js not updated"

# Manifest updated
grep -q "services/\*" chrome-extension/manifest.json && echo "✅ manifest.json updated" || echo "❌ manifest.json not updated"
```

### Expected Output
```
✅ StorageService.js exists
✅ AnalyticsService.js exists
✅ analytics.html exists
✅ analytics.js exists
✅ analytics.css exists
✅ background.js updated
✅ popup.html updated
✅ popup.js updated
✅ manifest.json updated
```

---

## Test 2: Extension Loading (3 minutes)

### Verify extension loads without errors

1. **Open Chrome**
2. **Navigate to** `chrome://extensions/`
3. **Find PEPETOR Miner** extension
4. **Check for errors:**
   - Click "Details" button
   - Look for red "Errors" section
   - Should be empty

### Expected Result
```
✅ No errors displayed
✅ Extension shows as enabled
✅ Version shows 1.0.0
```

---

## Test 3: UI Integration (5 minutes)

### Verify Analytics button in popup

1. **Click extension icon** (purple P in toolbar)
2. **Look for button:**
   - Should see "📈 Analytics" button in footer
   - Located next to "📊 Dashboard" button

### Expected Result
```
✅ Analytics button visible
✅ Button is clickable (not disabled)
✅ Button has correct emoji (📈)
✅ Positioned in footer
```

---

## Test 4: Dashboard Launch (3 minutes)

### Verify analytics dashboard opens

1. **Click extension icon** → **📈 Analytics**
2. **Verify window opens:**
   - New window (not tab) should open
   - Window size should be approximately 1200×800
   - Title should be "PEPETOR Miner - Analytics Dashboard"

3. **Check content:**
   - Header with "📊 Earnings Dashboard"
   - 4 summary cards visible
   - Control buttons (refresh 🔄, export 📥, clear 🗑️)
   - Chart containers
   - Stats section
   - Footer with "← Back to Popup" button

### Expected Result
```
✅ Dashboard window opens
✅ All UI elements render
✅ No console errors
✅ Page loads in < 2 seconds
```

---

## Test 5: Initial Data State (2 minutes)

### Verify dashboard handles no data gracefully

1. **Open analytics dashboard** (fresh install)
2. **Check all values:**
   - Total Lifetime: 0 cr
   - Today's Earnings: 0 cr
   - Credits/Hour: 0 cr
   - Projected Daily: 0 cr
   - Charts show "No data yet"

### Expected Result
```
✅ All values show 0 or empty
✅ Charts display loading message
✅ No error messages
✅ Clear button is disabled/grayed out
```

---

## Test 6: Background Recording (15 minutes)

### Verify session recording starts

1. **Open analytics dashboard** and leave it open
2. **Ensure extension running:**
   - Click extension icon → Should show balance
   - Should say "logged in"
3. **Let extension run for 5-10 minutes**
4. **Check dashboard:**
   - Click refresh button 🔄
   - Check if data appears

### Expected Result
```
✅ After 5 minutes, data starts appearing
✅ Total Lifetime shows > 0
✅ Today's Earnings shows > 0
✅ Refresh button updates data
```

---

## Test 7: Data Persistence (10 minutes)

### Verify data survives close/reopen

1. **Generate 5 minutes of data** (from Test 6)
2. **Note the values:**
   - Total Lifetime Credits: ______
   - Today's Earnings: ______
3. **Close analytics window**
4. **Close extension popup**
5. **Click extension again** → **📈 Analytics**
6. **Verify same values appear**

### Expected Result
```
✅ Data persists after close
✅ Same values as before
✅ Charts still show data
✅ No data loss
```

---

## Test 8: Export Functionality (3 minutes)

### Verify data export works

1. **With data present, click** 📥 **(export button)**
2. **Check downloads:**
   - File should download
   - Filename: `pepetor-sessions-YYYY-MM-DD.json`
3. **Open downloaded file:**
   - Should be valid JSON
   - Should contain session array
   - Each session has: timestamp, date, credits, torStatus, etc.

### Expected Result
```
✅ File downloads successfully
✅ Filename format correct
✅ Contains valid JSON
✅ Has session records
```

### Sample JSON
```json
[
  {
    "id": 1,
    "timestamp": 1704067200000,
    "date": "2024-01-01",
    "credits": 2.5,
    "torStatus": "running",
    "balance": 50.0,
    "bytesIn": 1024000,
    "bytesOut": 2048000
  },
  ...
]
```

---

## Test 9: Clear Functionality (3 minutes)

### Verify clear data works

1. **With data present, click** 🗑️ **(clear button)**
2. **Confirm dialog appears:**
   - Warning message: "Are you sure you want to clear all session history?"
   - Should say "cannot be undone"
3. **Click OK to confirm**
4. **Verify deletion:**
   - All values reset to 0
   - Charts become empty
   - "No data yet" message returns

### Expected Result
```
✅ Confirmation dialog appears
✅ After confirmation, all data deleted
✅ Dashboard shows empty state
✅ Cannot undo (no restore option)
```

---

## Test 10: Refresh Functionality (2 minutes)

### Verify refresh updates data

1. **With active session running, click** 🔄 **(refresh button)**
2. **Button should:**
   - Briefly rotate/animate
   - Update all values
3. **Check data changes:**
   - Likely see total increase (more credits earned)
   - Timestamps update to current time
4. **Click refresh multiple times**

### Expected Result
```
✅ Button animates during refresh
✅ Data updates after refresh
✅ Can refresh multiple times
✅ No memory issues with rapid clicking
```

---

## Test 11: Performance Monitoring (5 minutes)

### Check performance metrics

**Open DevTools** (F12) → **Application tab:**

1. **Check Memory:**
   - Take initial snapshot
   - Refresh dashboard 10 times
   - Take another snapshot
   - Memory increase should be < 10 MB

2. **Check Storage:**
   - IndexedDB → PEPETOR_Miner → sessions
   - Count sessions stored
   - Should be < 2000

3. **Check Performance:**
   - Use DevTools Performance tab
   - Click refresh, record for 5 seconds
   - Stop recording
   - Check metrics:
     - Rendering: < 500ms
     - Total time: < 1 second

### Expected Result
```
✅ Memory stable (< 50 MB total)
✅ Storage reasonable (< 100 MB)
✅ Rendering fast (< 500ms)
✅ No memory leaks
✅ No excessive CPU usage
```

---

## Test 12: Error Handling (5 minutes)

### Verify graceful error handling

1. **Turn off backend** (stop Node.js server)
2. **Try to refresh dashboard**
   - Should show cached data
   - Should not crash
3. **Turn backend back on**
4. **Try to refresh again**
   - Should recover and show live data

### Expected Result
```
✅ No crash when backend down
✅ Shows cached data if available
✅ Shows "Error" message gracefully
✅ Recovers when backend back online
```

---

## Test 13: Chrome DevTools Console (3 minutes)

### Check for errors in console

1. **Open analytics dashboard**
2. **Right-click → Inspect** (or F12)
3. **Go to Console tab**
4. **Look for errors:**
   - Should see some info logs (blue)
   - Should NOT see red error messages
   - Common errors to avoid:
     - "Cannot read property of undefined"
     - "Uncaught SyntaxError"
     - "Failed to load"

### Expected Result
```
✅ No red error messages
✅ Only blue info logs
✅ No warnings if possible
✅ Console clear
```

### Sample Good Console
```
[Analytics] Initializing
[StorageService] Initialized
[Analytics] Dashboard data loaded
...
```

---

## Test 14: Browser Compatibility (2 minutes)

### Verify extension works in Chrome

1. **Check Chrome version:**
   ```bash
   google-chrome --version
   # Should be 90+
   ```

2. **Test in different scenarios:**
   - [ ] Dark mode on
   - [ ] Light mode on
   - [ ] Zoom at 100%
   - [ ] Zoom at 150%
   - [ ] Zoom at 75%

### Expected Result
```
✅ Works at all zoom levels
✅ Theme applies correctly
✅ Text readable
✅ Buttons accessible
```

---

## Test 15: Integration with Phase 4 (5 minutes)

### Verify Phase 4 features still work

1. **Core popup still works:**
   - [ ] Balance displays
   - [ ] Tor controls work
   - [ ] Monitoring controls work
   - [ ] Settings button works

2. **New analytics works:**
   - [ ] Analytics button visible
   - [ ] Analytics opens
   - [ ] Data displays

3. **No interference:**
   - [ ] Popup size unchanged
   - [ ] Popup responsive
   - [ ] Dashboard independent

### Expected Result
```
✅ Both popup and analytics work
✅ No conflicts
✅ Seamless integration
✅ All Phase 4 features intact
```

---

## Automated Test Summary

### Quick Validation (5 minutes)
```bash
#!/bin/bash

echo "Phase 4B Validation Summary"
echo "============================"
echo ""

# File checks
FILE_CHECKS=0
test -f chrome-extension/services/StorageService.js && ((FILE_CHECKS++)) || echo "❌ Missing StorageService.js"
test -f chrome-extension/services/AnalyticsService.js && ((FILE_CHECKS++)) || echo "❌ Missing AnalyticsService.js"
test -f chrome-extension/pages/analytics.html && ((FILE_CHECKS++)) || echo "❌ Missing analytics.html"
test -f chrome-extension/pages/analytics.js && ((FILE_CHECKS++)) || echo "❌ Missing analytics.js"
test -f chrome-extension/pages/analytics.css && ((FILE_CHECKS++)) || echo "❌ Missing analytics.css"

echo "Files Present: $FILE_CHECKS/5"
echo ""

# Updated files
UPDATE_CHECKS=0
grep -q "StorageService" chrome-extension/background.js && ((UPDATE_CHECKS++)) || echo "❌ background.js not updated"
grep -q "openAnalyticsBtn" chrome-extension/popup.html && ((UPDATE_CHECKS++)) || echo "❌ popup.html not updated"
grep -q "openAnalyticsBtn" chrome-extension/popup.js && ((UPDATE_CHECKS++)) || echo "❌ popup.js not updated"

echo "Files Updated: $UPDATE_CHECKS/3"
echo ""

if [ $FILE_CHECKS -eq 5 ] && [ $UPDATE_CHECKS -eq 3 ]; then
    echo "✅ All Phase 4B-1 files verified!"
    echo "Ready for deployment."
else
    echo "❌ Some files missing or outdated"
    echo "Review setup before deploying"
fi
```

---

## Final Checklist

### Before Declaring Complete
- [ ] All 15 tests pass
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Data persists correctly
- [ ] Refresh works multiple times
- [ ] Clear works as expected
- [ ] Export produces valid JSON
- [ ] Dashboard responsive
- [ ] Phase 4 features unaffected
- [ ] No browser crashes

---

## Success Criteria

### Phase 4B-1 is PRODUCTION READY when:
```
✅ All 15 tests pass
✅ Performance metrics met
✅ No critical bugs
✅ Data integrity verified
✅ User documentation complete
✅ Error handling graceful
✅ Security review passed
✅ Phase 4 compatibility verified
```

---

## Quick Commands

### Open Chrome extensions page
```bash
open "chrome://extensions"
```

### Check backend running
```bash
curl -I http://localhost:3001/api/sessions/balance/test
```

### Check frontend running
```bash
curl -I http://localhost:3000
```

### View extension logs
```bash
# In Chrome: chrome://extensions/ → PEPETOR Miner → Errors
```

### Export all data
```javascript
// Run in DevTools console on analytics page:
storageService.init().then(() => {
  storageService.exportSessions().then(json => {
    console.log(json);
  });
});
```

---

**Phase 4B-1 Testing Complete** ✅  
**Ready for Phase 4B-2 Planning** 📋