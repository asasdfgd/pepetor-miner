/**
 * PEPETOR Miner - Background Service Worker
 * Handles API communication, state sync, and message routing
 */

// Configuration
const CONFIG = {
  defaultApiUrl: 'https://pepetor-miner.fly.dev/api',
  webAppUrl: 'https://pepetor-miner-lexa8yzjp-asasdfgds-projects.vercel.app',
  syncInterval: 5000,
};

// State
let extensionState = {
  isLoggedIn: false,
  userBalance: 0,
  torStatus: 'unknown',
  torStats: null,
  autoSubmissionStats: null,
  lastSyncTime: null,
  apiUrl: CONFIG.defaultApiUrl,
  token: null,
};

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('[PEPETOR] Extension installed');
  chrome.storage.sync.get(['apiUrl', 'token'], (result) => {
    if (result.apiUrl) extensionState.apiUrl = result.apiUrl;
    if (result.token) extensionState.token = result.token;
    startStateSync();
  });
});

/**
 * Start periodic state sync
 */
function startStateSync() {
  setInterval(() => {
    syncState();
  }, CONFIG.syncInterval);

  // Initial sync
  syncState();
}

/**
 * Sync extension state with backend
 * Tries web app first, falls back to direct API
 */
async function syncState() {
  try {
    // Try to get token from storage
    const stored = await new Promise((resolve) => {
      chrome.storage.sync.get(['token', 'apiUrl'], resolve);
    });

    if (stored.token) {
      extensionState.token = stored.token;
    }
    if (stored.apiUrl) {
      extensionState.apiUrl = stored.apiUrl;
    }

    if (!extensionState.token) {
      extensionState.isLoggedIn = false;
      broadcastState();
      return;
    }

    // Try web app connection first
    const webAppData = await tryWebAppConnection();
    if (webAppData) {
      updateState(webAppData);
      extensionState.isLoggedIn = true;
      broadcastState();
      return;
    }

    // Fallback to direct API
    const apiData = await fetchFromBackend();
    if (apiData) {
      updateState(apiData);
      extensionState.isLoggedIn = true;
      broadcastState();
      return;
    }

    extensionState.isLoggedIn = false;
    broadcastState();
  } catch (error) {
    console.error('[PEPETOR] Sync error:', error);
    extensionState.isLoggedIn = false;
    broadcastState();
  }
}

/**
 * Try to get data via content script from web app tab
 */
async function tryWebAppConnection() {
  try {
    const tabs = await chrome.tabs.query({ url: CONFIG.webAppUrl + '/*' });
    if (tabs.length === 0) return null;

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'GET_APP_STATE' },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve(null);
          } else if (response && response.state) {
            resolve(response.state);
          } else {
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    return null;
  }
}

/**
 * Fetch data directly from backend API
 */
async function fetchFromBackend() {
  try {
    if (!extensionState.token) return null;

    // Fetch balance
    const balanceRes = await fetch(
      `${extensionState.apiUrl}/sessions/balance/${extensionState.token.substring(0, 43)}`,
      {
        headers: { Authorization: `Bearer ${extensionState.token}` },
      }
    );

    if (!balanceRes.ok) return null;

    const balanceData = await balanceRes.json();

    // Fetch Tor status
    let torData = null;
    try {
      const torRes = await fetch(`${extensionState.apiUrl}/tor/status`, {
        headers: { Authorization: `Bearer ${extensionState.token}` },
      });
      if (torRes.ok) {
        torData = await torRes.json();
      }
    } catch (e) {
      // Tor API might not be available, that's ok
    }

    return {
      balance: balanceData.totalCredits || 0,
      torStatus: torData?.running ? 'running' : 'stopped',
      torStats: torData?.stats,
      autoSubmissionStats: torData?.autoSubmissionStats,
    };
  } catch (error) {
    console.error('[PEPETOR] Backend fetch error:', error);
    return null;
  }
}

/**
 * Update extension state with new data
 */
function updateState(data) {
  if (data.balance !== undefined) extensionState.userBalance = data.balance;
  if (data.torStatus) extensionState.torStatus = data.torStatus;
  if (data.torStats) extensionState.torStats = data.torStats;
  if (data.autoSubmissionStats) {
    extensionState.autoSubmissionStats = data.autoSubmissionStats;
  }
  extensionState.lastSyncTime = Date.now();
}

/**
 * Broadcast state to all listeners (popup, options, etc)
 */
function broadcastState() {
  chrome.runtime.sendMessage({
    type: 'STATE_UPDATE',
    state: extensionState,
  }).catch(() => {
    // Listeners may not be active, that's ok
  });
}

/**
 * Handle messages from popup and options page
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'GET_STATE':
          sendResponse({ state: extensionState });
          break;

        case 'SET_TOKEN':
          extensionState.token = request.token;
          await chrome.storage.sync.set({ token: request.token });
          await syncState();
          sendResponse({ success: true });
          break;

        case 'SET_API_URL':
          extensionState.apiUrl = request.url;
          await chrome.storage.sync.set({ apiUrl: request.url });
          await syncState();
          sendResponse({ success: true });
          break;

        case 'START_TOR':
          await callTorApi('/start');
          await syncState();
          sendResponse({ success: true });
          break;

        case 'STOP_TOR':
          await callTorApi('/stop');
          await syncState();
          sendResponse({ success: true });
          break;

        case 'START_MONITORING':
          await callTorApi('/monitoring/start');
          await syncState();
          sendResponse({ success: true });
          break;

        case 'STOP_MONITORING':
          await callTorApi('/monitoring/stop');
          await syncState();
          sendResponse({ success: true });
          break;

        case 'FORCE_SYNC':
          await syncState();
          sendResponse({ state: extensionState });
          break;

        case 'LOGOUT':
          extensionState.token = null;
          extensionState.isLoggedIn = false;
          await chrome.storage.sync.set({ token: null });
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[PEPETOR] Message handler error:', error);
      sendResponse({ error: error.message });
    }
  })();

  return true; // Keep channel open for async response
});

/**
 * Call Tor API endpoint
 */
async function callTorApi(endpoint) {
  if (!extensionState.token) throw new Error('Not logged in');

  const response = await fetch(
    `${extensionState.apiUrl}/tor${endpoint}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${extensionState.token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Track sessions to IndexedDB for analytics
 */
let lastRecordedBalance = 0;
let sessionStartTime = Date.now();

async function recordSession() {
  try {
    // Lazy load storage service
    if (typeof storageService === 'undefined') {
      const script = document.createElement('script');
      script.src = 'services/StorageService.js';
      document.head.appendChild(script);
    }

    if (extensionState.isLoggedIn) {
      const creditsEarned = Math.max(0, extensionState.userBalance - lastRecordedBalance);
      
      if (creditsEarned > 0 || sessionStartTime) {
        await storageService.addSession({
          credits: creditsEarned,
          torStatus: extensionState.torStatus,
          balance: extensionState.userBalance,
          bytesIn: extensionState.torStats?.bytesIn || 0,
          bytesOut: extensionState.torStats?.bytesOut || 0,
          isMonitoring: extensionState.autoSubmissionStats?.isMonitoring || false,
        });

        lastRecordedBalance = extensionState.userBalance;
      }
    }
  } catch (error) {
    // Silently fail - storage service not available
    console.debug('[PEPETOR] Session recording skipped:', error.message);
  }
}

// Record sessions every 5 minutes
setInterval(recordSession, 5 * 60 * 1000);

// Initialize
startStateSync();