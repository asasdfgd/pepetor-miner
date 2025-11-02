# Phase 4B: Chrome Extension Enhancements

**Status**: Planning  
**Priority**: Medium  
**Estimated Timeline**: 2-3 development sessions

---

## Overview

Phase 4 delivered a fully functional extension with:
- Real-time balance display
- Tor control (start/stop)
- Auto-submission monitoring
- Settings management
- Fallback connection mode

Phase 4B will enhance UX with visual analytics, multi-account support, and advanced features.

---

## Planned Enhancements

### 1. Session History (Medium Priority)
**Goal**: Track and visualize earnings over time

#### Components
- IndexedDB storage for historical data
- Chart component showing earnings trends
- Session statistics (total sessions, avg duration, etc)

#### Implementation
```javascript
// Store in IndexedDB
sessions = [
  { timestamp, credits, torStatus, bytesIn, bytesOut },
  ...
]

// Display in popup
Chart showing:
- Daily earnings trend
- Total credits this session
- Estimated daily earnings
- Best performing hours
```

#### Files to Create
- `extension/services/StorageService.js` - IndexedDB wrapper
- `extension/components/Chart.js` - Chart rendering
- Update `popup.html/js` to include chart tab

#### Backend Integration
- Uses existing `/api/sessions` endpoints
- No new backend work needed

---

### 2. Earnings Dashboard (High Priority)
**Goal**: Detailed breakdown of earnings and performance

#### Features
- Total lifetime earnings
- Current session earnings
- Hourly breakdown
- Tor connectivity uptime %
- Credits per hour metric

#### Implementation
- New popup tab: "Analytics"
- Real-time calculations from historical data
- Visual indicators for performance

#### Files to Create
- `extension/pages/analytics-tab.html`
- `extension/services/AnalyticsService.js`
- Add styling in `popup.css`

---

### 3. Multi-Account Support (High Priority)
**Goal**: Switch between multiple user accounts

#### Features
- Save multiple account tokens
- Quick account switcher in popup
- Per-account settings storage
- Fast switching without re-auth

#### Implementation
```javascript
// Storage structure
accounts = {
  'account1': {
    token: 'xxx',
    user: { id, email, username },
    apiUrl: 'xxx',
    stats: { ... }
  },
  'account2': { ... }
}

// UI Changes
- Dropdown: "Account: [username] ▼"
- Click to see account list
- Click account to switch
- "Add Account" button to login new account
```

#### Files to Modify
- `background.js` - Account switching logic
- `popup.html/js` - Account selector UI
- `options.html/js` - Account management
- Storage schema changes

---

### 4. Notification System (Medium Priority)
**Goal**: Alert user to important events

#### Events to Notify
- Tor connection established/lost
- High earnings milestone reached
- Monitoring stopped (unexpected)
- Low connectivity period
- Session balance updated significantly

#### Implementation
```javascript
// Manifest permission
"permissions": ["notifications"]

// Notification types
chrome.notifications.create({
  type: 'basic',
  title: 'PEPETOR Miner',
  message: 'Tor connection established! Now earning credits.',
  iconUrl: 'images/icon-128.svg'
})
```

#### Configuration
- Toggle notifications per event type
- Quiet hours (no notifications 10pm-8am)
- Sound on/off

---

### 5. Performance Monitoring (Medium Priority)
**Goal**: Track extension and system performance

#### Metrics
- Extension memory usage
- API response times
- Sync success rate
- Token refresh success rate
- Fallback usage stats (% web app vs direct API)

#### Debug Page
- Shows all metrics
- Export data as JSON
- Performance graphs
- Error logs

#### Implementation
- New settings tab: "Debug"
- Charts showing trends
- Export functionality

---

### 6. Advanced Tor Features (Medium Priority)
**Goal**: More control over Tor network

#### Features
- Exit node selection
- Circuit refresh on demand
- Tor version check
- Custom Tor configuration
- Connection test (check IP via API)

#### Backend Integration Required
- New endpoint: `POST /api/tor/refresh-circuit`
- New endpoint: `GET /api/tor/version`
- New endpoint: `POST /api/tor/test-connection`

#### Files to Create
- `extension/pages/tor-advanced.html`
- Update `background.js` for new endpoints

---

### 7. Hardware Wallet Integration (Low Priority)
**Goal**: Direct withdraw to hardware wallet

#### Features
- Connect wallet address
- Withdraw button in popup
- Transaction history
- Fee estimation

#### Backend Integration Required
- New endpoint: `POST /api/wallet/withdraw`
- Address validation
- Transaction tracking

#### Security Considerations
- Never send private keys to extension
- Use wallet address only
- Signature verification on backend

---

### 8. Extension Keyboard Shortcuts (Low Priority)
**Goal**: Quick access via keyboard

#### Shortcuts
- `Ctrl+Shift+P` - Open popup
- `Ctrl+Shift+D` - Open dashboard
- `Ctrl+Shift+S` - Toggle Tor

#### Implementation
```javascript
// manifest.json
"commands": {
  "toggle-tor": {
    "suggested_key": { "default": "Ctrl+Shift+T" },
    "description": "Toggle Tor on/off"
  }
}
```

---

### 9. Badge Notifications (Low Priority)
**Goal**: Visual indicator on extension icon

#### Features
- Badge showing earnings delta ("+5 cr")
- Badge showing status:
  - 🟢 Running (green)
  - 🔴 Stopped (red)
  - 🟡 Sync failing (yellow)

#### Implementation
```javascript
// Update badge
chrome.action.setBadgeText({ text: '+5' });
chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
```

---

## Implementation Priority

### Phase 4B-1 (Critical - Do First)
1. Session History with IndexedDB
2. Earnings Dashboard
3. Better error handling

**Effort**: 2-3 sessions
**Impact**: High - Core analytics

### Phase 4B-2 (Important)
1. Multi-Account Support
2. Notification System
3. Performance Monitoring

**Effort**: 2-3 sessions
**Impact**: Medium - UX improvements

### Phase 4B-3 (Nice to Have)
1. Advanced Tor Features
2. Badge Notifications
3. Keyboard Shortcuts
4. Hardware Wallet Integration

**Effort**: 1-2 sessions each
**Impact**: Low-Medium - Polish features

---

## Technical Dependencies

### Frontend
- Chart library: `recharts` or `chart.js`
- IndexedDB wrapper (no external dep)
- Notification API (built-in)

### Backend
New endpoints needed for Phase 4B-3:
```
POST /api/tor/refresh-circuit
GET /api/tor/version
POST /api/tor/test-connection
POST /api/wallet/withdraw
```

### Chrome APIs
- `chrome.storage.sync` (already using)
- `chrome.notifications` (new)
- `chrome.action` (badges)
- `chrome.commands` (shortcuts)

---

## File Structure After 4B-1

```
chrome-extension/
├── background.js (updated)
├── popup.html (updated)
├── popup.js (updated)
├── popup.css (updated)
├── options.html (updated)
├── options.js (updated)
├── content.js
├── manifest.json
├── images/
│   ├── icon-16.svg
│   ├── icon-48.svg
│   └── icon-128.svg
├── services/
│   └── StorageService.js (NEW)
├── pages/
│   └── analytics.html (NEW)
└── styles/
    └── analytics.css (NEW)
```

---

## Testing Strategy

### Unit Tests
- StorageService.js - IndexedDB operations
- AnalyticsService.js - calculations
- Account switching logic

### Integration Tests
- Multi-account switching with state persistence
- Notification delivery on events
- Chart rendering with sample data

### E2E Tests
- Complete earnings flow with history
- Multi-account scenario
- Notification handling

---

## Security Considerations

### Data Privacy
- No personal data in notifications
- Settings not synced to Google account (use local storage)
- IndexedDB data encrypted by Chrome

### Account Security
- Tokens isolated per account
- No token sharing between instances
- Session validation on each sync

### Notifications
- Only show non-sensitive info
- No token/private data in notifications
- User can disable all notifications

---

## Rollout Plan

### Pre-Release (Internal Testing)
1. Test all Phase 4B features in dev
2. Test multi-account switching
3. Test notification events
4. Performance benchmarks

### Staged Rollout
- Week 1: Session history + analytics
- Week 2: Multi-account support
- Week 3: Advanced features

### Monitoring
- Track crash rates
- Monitor extension memory usage
- Collect user feedback

---

## Success Metrics

### Phase 4B-1
- ✅ 90% uptime (no crashes)
- ✅ Average 10MB RAM usage
- ✅ Charts render in <500ms
- ✅ IndexedDB stores 1000+ sessions

### Phase 4B-2
- ✅ Account switching works 100% of time
- ✅ All notifications deliver
- ✅ Multi-account tests pass

### Overall
- ✅ User satisfaction > 4.5/5
- ✅ Crash reports < 1%
- ✅ Daily active users increasing

---

## Conclusion

Phase 4B will transform the extension from a functional tool into a comprehensive earnings dashboard with advanced features. The modular approach allows for incremental rollout and testing.

**Next Steps**:
1. Start with Phase 4B-1 (Session History)
2. Get user feedback
3. Proceed to Phase 4B-2
4. Consider Phase 4B-3 based on usage patterns