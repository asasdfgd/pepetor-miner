/**
 * PEPETOR Miner - Popup UI
 * Handles popup display and interactions
 */

const STATES = {
  LOADING: 'loading',
  NOT_LOGGED_IN: 'notLoggedIn',
  LOGGED_IN: 'loggedIn',
};

let currentState = STATES.LOADING;
let extensionState = null;
let autoSyncInterval = null;

/**
 * Initialize popup
 */
async function init() {
  console.log('[POPUP] Initializing');
  
  setupEventListeners();
  showState(STATES.LOADING);
  
  // Get initial state
  const response = await sendMessage({ action: 'GET_STATE' });
  extensionState = response.state;
  
  updateUI();
  
  // Set up auto-sync
  autoSyncInterval = setInterval(updateUI, 3000);
  
  // Listen for state updates from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'STATE_UPDATE') {
      extensionState = request.state;
      updateUI();
    }
  });
}

/**
 * Setup event listeners for buttons
 */
function setupEventListeners() {
  // Not logged in
  document.getElementById('openAppBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://pepetor-miner-lexa8yzjp-asasdfgds-projects.vercel.app' });
  });

  document.getElementById('openOptionsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Logged in - Tor controls
  document.getElementById('torStartBtn').addEventListener('click', () => {
    handleTorStart();
  });

  document.getElementById('torStopBtn').addEventListener('click', () => {
    handleTorStop();
  });

  // Logged in - Monitoring controls
  document.getElementById('monitoringStartBtn').addEventListener('click', () => {
    handleMonitoringStart();
  });

  document.getElementById('monitoringStopBtn').addEventListener('click', () => {
    handleMonitoringStop();
  });

  // Footer actions
  document.getElementById('openDashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://pepetor-miner-lexa8yzjp-asasdfgds-projects.vercel.app/dashboard' });
  });

  document.getElementById('openAnalyticsBtn').addEventListener('click', () => {
    const analyticsUrl = chrome.runtime.getURL('pages/analytics.html');
    chrome.windows.create({
      url: analyticsUrl,
      type: 'popup',
      width: 1200,
      height: 800,
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    handleLogout();
  });

  // Sync button
  document.getElementById('syncBtn').addEventListener('click', () => {
    handleSync();
  });
}

/**
 * Update UI based on current state
 */
function updateUI() {
  if (!extensionState) return;

  if (extensionState.isLoggedIn) {
    showState(STATES.LOGGED_IN);
    updateLoggedInUI();
  } else {
    showState(STATES.NOT_LOGGED_IN);
  }
}

/**
 * Update UI elements for logged in state
 */
function updateLoggedInUI() {
  // Update balance
  const balanceAmount = document.getElementById('balanceAmount');
  balanceAmount.textContent = Math.round(extensionState.userBalance * 100) / 100;

  // Update Tor status
  const torStatusBadge = document.getElementById('torStatusBadge');
  torStatusBadge.textContent = extensionState.torStatus || '—';
  torStatusBadge.className = 'status-badge';
  if (extensionState.torStatus === 'running') {
    torStatusBadge.classList.add('running');
  } else if (extensionState.torStatus === 'stopped') {
    torStatusBadge.classList.add('stopped');
  }

  // Update Tor stats if available
  if (extensionState.torStats) {
    const torStats = document.getElementById('torStats');
    torStats.classList.remove('hidden');

    document.getElementById('statDataIn').textContent = 
      formatBytes(extensionState.torStats.bytesIn);
    document.getElementById('statDataOut').textContent = 
      formatBytes(extensionState.torStats.bytesOut);
    document.getElementById('statConnections').textContent = 
      extensionState.torStats.connections || 0;
    document.getElementById('statCircuits').textContent = 
      extensionState.torStats.circuits || 0;
  } else {
    document.getElementById('torStats').classList.add('hidden');
  }

  // Update submission stats
  if (extensionState.autoSubmissionStats) {
    const submissionStats = document.getElementById('submissionStats');
    submissionStats.classList.remove('hidden');

    const stats = extensionState.autoSubmissionStats;
    document.getElementById('submittedCount').textContent = 
      stats.submittedCount || 0;
    document.getElementById('totalEarned').textContent = 
      `${Math.round(stats.totalCreditsEarned * 100) / 100} cr`;

    // Update badge
    const badge = document.getElementById('submissionBadge');
    badge.textContent = stats.isMonitoring ? 'monitoring' : 'idle';
    badge.className = 'submission-badge';
    if (stats.isMonitoring) {
      badge.classList.add('monitoring');
    }
  } else {
    document.getElementById('submissionStats').classList.add('hidden');
  }

  // Update button states
  updateButtonStates();
}

/**
 * Update button disabled states based on Tor status
 */
function updateButtonStates() {
  const isRunning = extensionState.torStatus === 'running';
  const isMonitoring = extensionState.autoSubmissionStats?.isMonitoring || false;

  document.getElementById('torStartBtn').disabled = isRunning;
  document.getElementById('torStopBtn').disabled = !isRunning;
  document.getElementById('monitoringStartBtn').disabled = isMonitoring;
  document.getElementById('monitoringStopBtn').disabled = !isMonitoring;
}

/**
 * Show specific state container
 */
function showState(state) {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('notLoggedIn').classList.add('hidden');
  document.getElementById('loggedIn').classList.add('hidden');

  const selector = '#' + state;
  document.querySelector(selector).classList.remove('hidden');

  currentState = state;
}

/**
 * Handle Tor start
 */
async function handleTorStart() {
  try {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.classList.add('syncing');

    const response = await sendMessage({ action: 'START_TOR' });
    if (response.success) {
      console.log('[POPUP] Tor started');
      setTimeout(() => {
        sendMessage({ action: 'FORCE_SYNC' });
      }, 1000);
    }
  } catch (error) {
    console.error('[POPUP] Error starting Tor:', error);
    alert('Failed to start Tor. Make sure it\'s installed.');
  } finally {
    document.getElementById('syncBtn').classList.remove('syncing');
  }
}

/**
 * Handle Tor stop
 */
async function handleTorStop() {
  try {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.classList.add('syncing');

    const response = await sendMessage({ action: 'STOP_TOR' });
    if (response.success) {
      console.log('[POPUP] Tor stopped');
      setTimeout(() => {
        sendMessage({ action: 'FORCE_SYNC' });
      }, 500);
    }
  } catch (error) {
    console.error('[POPUP] Error stopping Tor:', error);
  } finally {
    document.getElementById('syncBtn').classList.remove('syncing');
  }
}

/**
 * Handle monitoring start
 */
async function handleMonitoringStart() {
  try {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.classList.add('syncing');

    const response = await sendMessage({ action: 'START_MONITORING' });
    if (response.success) {
      console.log('[POPUP] Monitoring started');
      setTimeout(() => {
        sendMessage({ action: 'FORCE_SYNC' });
      }, 500);
    }
  } catch (error) {
    console.error('[POPUP] Error starting monitoring:', error);
  } finally {
    document.getElementById('syncBtn').classList.remove('syncing');
  }
}

/**
 * Handle monitoring stop
 */
async function handleMonitoringStop() {
  try {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.classList.add('syncing');

    const response = await sendMessage({ action: 'STOP_MONITORING' });
    if (response.success) {
      console.log('[POPUP] Monitoring stopped');
      setTimeout(() => {
        sendMessage({ action: 'FORCE_SYNC' });
      }, 500);
    }
  } catch (error) {
    console.error('[POPUP] Error stopping monitoring:', error);
  } finally {
    document.getElementById('syncBtn').classList.remove('syncing');
  }
}

/**
 * Handle manual sync
 */
async function handleSync() {
  const syncBtn = document.getElementById('syncBtn');
  syncBtn.classList.add('syncing');

  try {
    const response = await sendMessage({ action: 'FORCE_SYNC' });
    extensionState = response.state;
    updateUI();
  } catch (error) {
    console.error('[POPUP] Error syncing:', error);
  } finally {
    syncBtn.classList.remove('syncing');
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await sendMessage({ action: 'LOGOUT' });
      extensionState.isLoggedIn = false;
      updateUI();
    } catch (error) {
      console.error('[POPUP] Error logging out:', error);
    }
  }
}

/**
 * Send message to background script
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (response && response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response || {});
      }
    });
  });
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);