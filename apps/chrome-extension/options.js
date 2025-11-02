/**
 * PEPETOR Miner - Options Page
 * Handles settings and configuration
 */

/**
 * Initialize options page
 */
async function init() {
  console.log('[OPTIONS] Initializing');

  // Load saved settings
  const saved = await chrome.storage.sync.get([
    'apiUrl',
    'token',
    'syncInterval',
    'notifyOnSessionSubmit',
    'notifyOnEarnings',
    'notifyOnTorError',
  ]);

  document.getElementById('apiUrl').value = saved.apiUrl || 'http://localhost:3001/api';
  document.getElementById('token').value = saved.token || '';
  document.getElementById('syncInterval').value = saved.syncInterval || 5;
  document.getElementById('notifyOnSessionSubmit').checked = saved.notifyOnSessionSubmit !== false;
  document.getElementById('notifyOnEarnings').checked = saved.notifyOnEarnings !== false;
  document.getElementById('notifyOnTorError').checked = saved.notifyOnTorError || false;

  // Update display
  document.getElementById('backendUrl').textContent = saved.apiUrl || 'http://localhost:3001/api';

  // Setup event listeners
  setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
  document.getElementById('clearStorageBtn').addEventListener('click', clearStorage);
  document.getElementById('copyTokenBtn').addEventListener('click', copyToken);

  // Auto-save on input change (debounced)
  let saveTimeout;
  document.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('change', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveSettings, 500);
    });
  });
}

/**
 * Save settings
 */
async function saveSettings() {
  const apiUrl = document.getElementById('apiUrl').value;
  const token = document.getElementById('token').value;
  const syncInterval = parseInt(document.getElementById('syncInterval').value);
  const notifyOnSessionSubmit = document.getElementById('notifyOnSessionSubmit').checked;
  const notifyOnEarnings = document.getElementById('notifyOnEarnings').checked;
  const notifyOnTorError = document.getElementById('notifyOnTorError').checked;

  // Validate
  if (!apiUrl || !token) {
    showSaveStatus('Please fill in all fields', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({
      apiUrl,
      token,
      syncInterval,
      notifyOnSessionSubmit,
      notifyOnEarnings,
      notifyOnTorError,
    });

    document.getElementById('backendUrl').textContent = apiUrl;

    // Notify background script
    chrome.runtime.sendMessage({
      action: 'SET_API_URL',
      url: apiUrl,
    });

    chrome.runtime.sendMessage({
      action: 'SET_TOKEN',
      token: token,
    });

    showSaveStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('[OPTIONS] Error saving settings:', error);
    showSaveStatus('Error saving settings: ' + error.message, 'error');
  }
}

/**
 * Show save status message
 */
function showSaveStatus(message, type) {
  const status = document.getElementById('saveStatus');
  status.textContent = message;
  status.className = 'save-status ' + type;

  if (type === 'success') {
    setTimeout(() => {
      status.textContent = '';
      status.className = 'save-status';
    }, 3000);
  }
}

/**
 * Test connection to backend
 */
async function testConnection() {
  const btn = document.getElementById('testConnectionBtn');
  const result = document.getElementById('testResult');
  const resultContent = document.getElementById('testResultContent');

  btn.disabled = true;
  btn.textContent = '⏳ Testing...';

  try {
    const apiUrl = document.getElementById('apiUrl').value;
    const token = document.getElementById('token').value;

    if (!apiUrl || !token) {
      throw new Error('Please enter API URL and token');
    }

    // Extract public key from token (first 43 chars is the pubkey in this system)
    const pubkey = token.substring(0, 43);

    // Try to fetch balance
    const response = await fetch(`${apiUrl}/sessions/balance/${pubkey}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    resultContent.innerHTML = `
      <strong>✓ Connection Successful!</strong><br>
      Total Credits: ${data.totalCredits || 0}<br>
      Sessions: ${data.sessionCount || 0}
    `;
    result.className = 'test-result success';

    // Also try Tor endpoint
    try {
      const torRes = await fetch(`${apiUrl}/tor/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (torRes.ok) {
        const torData = await torRes.json();
        resultContent.innerHTML += `<br><strong>Tor Status:</strong> ${torData.running ? 'Running' : 'Stopped'}`;
      }
    } catch (e) {
      // Tor endpoint might not be available
    }
  } catch (error) {
    console.error('[OPTIONS] Connection test error:', error);
    resultContent.textContent = `✗ Error: ${error.message}`;
    result.className = 'test-result error';
  } finally {
    btn.disabled = false;
    btn.textContent = '🧪 Test Backend Connection';
    result.classList.remove('hidden');
  }
}

/**
 * Copy token to clipboard
 */
async function copyToken() {
  const token = document.getElementById('token').value;

  if (!token) {
    alert('No token to copy');
    return;
  }

  try {
    await navigator.clipboard.writeText(token);
    const btn = document.getElementById('copyTokenBtn');
    const originalText = btn.textContent;

    btn.textContent = '✓ Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('[OPTIONS] Copy error:', error);
    alert('Failed to copy token');
  }
}

/**
 * Clear all saved data
 */
async function clearStorage() {
  if (!confirm('Are you sure? This will clear all saved settings and log you out.')) {
    return;
  }

  try {
    await chrome.storage.sync.clear();

    // Clear form
    document.getElementById('apiUrl').value = 'http://localhost:3001/api';
    document.getElementById('token').value = '';
    document.getElementById('syncInterval').value = 5;

    showSaveStatus('All data cleared. Please refresh the extension.', 'success');

    // Notify background to clear state
    chrome.runtime.sendMessage({ action: 'LOGOUT' });

    // Redirect to app
    setTimeout(() => {
      window.location.href = 'http://localhost:3000';
    }, 2000);
  } catch (error) {
    console.error('[OPTIONS] Clear storage error:', error);
    showSaveStatus('Error clearing data: ' + error.message, 'error');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);