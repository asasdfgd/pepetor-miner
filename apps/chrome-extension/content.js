/**
 * PEPETOR Miner - Content Script
 * Injected into web app pages to enable bi-directional communication
 */

console.log('[CONTENT] Injected into PEPETOR app');

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_APP_STATE') {
    // Request state from the app
    try {
      const message = {
        type: 'EXTENSION_GET_STATE',
        id: Date.now(),
      };

      // Send to window
      window.postMessage(message, window.location.origin);

      // Wait for response
      const timeout = setTimeout(() => {
        sendResponse(null);
      }, 1000);

      const handler = (event) => {
        if (
          event.source !== window ||
          !event.data.type ||
          !event.data.type.startsWith('EXTENSION_STATE_RESPONSE')
        ) {
          return;
        }

        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        sendResponse({ state: event.data.state });
      };

      window.addEventListener('message', handler);
      return true; // Keep channel open
    } catch (error) {
      console.error('[CONTENT] Error:', error);
      sendResponse(null);
    }
  }
});

/**
 * Listener for messages from the window (injected script)
 * This will handle responses from the React app
 */
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  // Just passing through - the response handler in our listener above will catch this
});

console.log('[CONTENT] Ready for communication');