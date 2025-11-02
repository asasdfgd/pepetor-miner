# PEPETOR Miner - Chrome Extension

A powerful Chrome extension for managing your Tor-based earnings directly from your browser.

## Features

- 🧅 **Real-time Tor Status** - Monitor Tor connectivity and bandwidth
- 💰 **Balance Display** - See your earnings at a glance
- 📊 **Session Tracking** - View auto-submitted sessions and statistics
- ⚙️ **Quick Controls** - Start/stop Tor and monitoring from popup
- 🔐 **Secure Authentication** - Direct API connection with JWT tokens
- 🔄 **Dual Connection** - Primary: Web app fallback, Secondary: Direct API

## Installation

### Step 1: Prepare Extension Files

All extension files are in this directory:
```
chrome-extension/
├── manifest.json          # Extension metadata
├── background.js          # Service worker
├── popup.html/js/css      # Popup UI
├── options.html/js/css    # Settings page
├── content.js             # Web app bridge
├── README.md              # This file
└── images/                # Icons (see below)
```

### Step 2: Create Icons

Create placeholder icons in `chrome-extension/images/`:

**Option A: Simple SVG Icons (Recommended)**

Create these files:
- `icon-16.png` (16x16 pixels)
- `icon-48.png` (48x48 pixels)  
- `icon-128.png` (128x128 pixels)

You can use online SVG-to-PNG converters or use ImageMagick:
```bash
# Using ImageMagick
convert -size 16x16 xc:none -fill "#667eea" -draw "circle 8,8 2,2" icon-16.png
convert -size 48x48 xc:none -fill "#667eea" -draw "circle 24,24 6,6" icon-48.png
convert -size 128x128 xc:none -fill "#667eea" -draw "circle 64,64 16,16" icon-128.png
```

**Option B: Use Online Icon Generator**
- Go to https://www.favicon-generator.org/
- Upload a simple image of "🧅"
- Download PNG versions for 16x16, 48x48, 128x128

### Step 3: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Navigate to and select the `chrome-extension` directory
5. Extension should appear in your extensions list

### Step 4: Configure Extension

1. Click extension icon in toolbar
2. If not logged in: Click "Settings" button
3. Enter your configuration:
   - **API Base URL**: `http://localhost:3001/api`
   - **Auth Token**: Paste your JWT token from dashboard
4. Click "Save Settings"
5. Test connection with "Test Backend Connection" button

## Getting Your Auth Token

1. Log in to PEPETOR app at `http://localhost:3000`
2. Go to Dashboard (`/dashboard`)
3. In the browser console (F12 → Console), run:
   ```javascript
   console.log(localStorage.getItem('token'))
   ```
4. Copy the entire token
5. Paste into extension settings

## Usage

### Popup UI

**Balance Display**
- Shows your current credit balance
- Updates every 3-5 seconds

**Tor Controls**
- **Start**: Launch Tor process
- **Stop**: Gracefully shutdown Tor

**Session Monitoring**
- **Monitor**: Start automatic session submission
- **Stop**: Stop monitoring
- View submitted session count and earnings

**Footer Actions**
- **Dashboard**: Opens web dashboard in new tab
- **Logout**: Clear extension session

### Settings Page

Access by clicking gear icon in popup:

**API Configuration**
- Set custom backend API URL
- Paste and manage JWT tokens
- Copy token to clipboard

**Sync Settings**
- Adjust how often extension checks for updates (3-60 seconds)
- Default: 5 seconds

**Notifications**
- Toggle alerts for sessions submitted
- Toggle earnings milestones
- Toggle Tor errors

**Debugging**
- Test backend connection
- Clear all saved data and settings

## Architecture

### Communication Flow

```
Extension Popup/Options
    ↓
Background Service Worker (background.js)
    ↓
    ├─→ Try: Content Script (content.js)
    │   ↓
    │   Web App (React) - If tab open
    │   
    └─→ Fallback: Direct API Calls
        ↓
        Backend (Express.js)
```

### Components

**manifest.json**
- Extension metadata and permissions
- Defines popup, options page, icons
- Registers content script

**background.js** (Service Worker)
- Handles all API communication
- Manages extension state
- Periodic sync (5 seconds default)
- Routes messages from popup/options to API

**popup.html/js/css**
- User-facing extension popup
- Shows balance, Tor status, sessions
- Provides quick controls
- Updates every 3 seconds

**options.html/js/css**
- Settings and configuration UI
- API endpoint management
- Token storage and validation
- Test connection utility

**content.js**
- Injected into `http://localhost:3000/*`
- Enables bidirectional communication with React app
- Passes auth token to extension

**useExtensionBridge.js** (Frontend Hook)
- React hook for extension integration
- Listens for state requests from extension
- Passes token to content script

## Security Considerations

### Token Storage

**Current Implementation** (Development)
- JWT token stored in `chrome.storage.sync`
- Accessible to extension only

**Production Recommendations**
- Use `chrome.storage.local` + OS credential storage
- Implement session keys instead of full tokens
- Use Chrome's declarativeNetRequest for auth headers

### API Communication

- All requests use HTTPS in production
- Bearer token in Authorization header
- CORS enabled for extension origin
- No credentials stored in code

### Content Security Policy

The extension declares necessary permissions:
- `storage` - For settings
- `tabs` - To query open pages
- `scripting` - To inject content script
- `activeTab` - For popup

## Troubleshooting

### Extension Not Appearing

1. Check `chrome://extensions/` - verify it's loaded
2. Disable developer mode extensions: Turn off other dev extensions
3. Reload extension: Click reload icon
4. Check console: Open DevTools for extension (right-click extension icon → Inspect)

### "Not Logged In" State

1. Click Settings button in popup
2. Verify JWT token is valid:
   ```bash
   # Test token on backend
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3001/api/sessions/balance/PUBKEY
   ```
3. Click "Test Backend Connection" button
4. If test fails, check backend is running on port 3001

### Connection Timeout

1. Verify backend is running: `npm run dev` in backend folder
2. Verify API URL in settings: Should be `http://localhost:3001/api`
3. Check firewall isn't blocking port 3001
4. Try direct request:
   ```bash
   curl http://localhost:3001/api/tor/status \
        -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Tor Commands Not Working

1. Verify Tor is installed:
   ```bash
   which tor
   tor --version
   ```
2. Check Tor isn't already running:
   ```bash
   lsof -i :9050  # SOCKS port
   ```
3. Check backend logs for errors:
   ```bash
   cd backend && npm run dev  # Watch logs
   ```

## Development

### Local Testing

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Keep extension loaded
# Open chrome://extensions and reload extension after code changes
```

### Debug Logs

**Background Script**
- Open DevTools for extension: Right-click icon → Inspect
- Watch for `[PEPETOR]` prefixed logs

**Popup**
- Open popup (click icon)
- Right-click → Inspect
- Console tab shows `[POPUP]` logs

**Content Script**
- Open web app page
- F12 → Console
- Watch for `[CONTENT]` logs

### Modifying Code

After editing any extension file:
1. Go to `chrome://extensions`
2. Find PEPETOR Miner
3. Click reload button (circular arrow)
4. Reopen popup to see changes

## File Structure

```
chrome-extension/
├── manifest.json              # Extension config
├── background.js              # 400+ lines
├── popup.html                 # 100+ lines
├── popup.js                   # 250+ lines  
├── popup.css                  # 350+ lines
├── options.html               # 150+ lines
├── options.js                 # 200+ lines
├── options.css                # 300+ lines
├── content.js                 # 50+ lines
├── images/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md                  # This file
```

**Total New Files**: 9 files  
**Total Lines of Code**: 1800+ (excluding images)

## Future Enhancements

**Phase 4B: Advanced Features**
- [ ] Tor network statistics dashboard
- [ ] Earnings history chart
- [ ] Session replay/verification
- [ ] Bandwidth limits configuration
- [ ] Multiple account support
- [ ] Hardware wallet integration

**Phase 5: Production**
- [ ] Chrome Web Store publishing
- [ ] Automatic updates
- [ ] Crash reporting
- [ ] Performance monitoring
- [ ] A/B testing

## Support

For issues:
1. Check troubleshooting section above
2. Enable debug logs (right-click extension → Inspect)
3. Test backend directly: `curl http://localhost:3001/api/...`
4. Check GitHub issues: See main README

## License

Same as PEPETOR-MINER project (See root LICENSE file)