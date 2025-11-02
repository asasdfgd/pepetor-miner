/**
 * Hook for bi-directional communication with PEPETOR Chrome extension
 * Allows the extension to query app state without direct API calls
 */

import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

/**
 * Register app state listener for extension communication
 */
export function useExtensionBridge() {
  const { token, user } = useAuth();
  const stateRef = useRef(null);

  useEffect(() => {
    // Update state reference with latest auth data
    stateRef.current = {
      token,
      isLoggedIn: !!token,
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
      } : null,
    };

    // Listen for extension state requests
    const messageHandler = (event) => {
      // Validate message source and structure
      if (
        event.source !== window ||
        !event.data ||
        typeof event.data !== 'object'
      ) {
        return;
      }

      // Handle state request from extension
      if (event.data.type === 'EXTENSION_GET_STATE') {
        console.log('[BRIDGE] Extension requested state');

        const response = {
          type: 'EXTENSION_STATE_RESPONSE',
          id: event.data.id,
          state: {
            token: stateRef.current.token,
            isLoggedIn: stateRef.current.isLoggedIn,
            user: stateRef.current.user,
            timestamp: Date.now(),
          },
        };

        window.postMessage(response, window.location.origin);
      }
    };

    window.addEventListener('message', messageHandler);
    console.log('[BRIDGE] Extension bridge initialized');

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [token, user]);
}

/**
 * Send message to extension
 */
export function sendToExtension(action, data = {}) {
  return new Promise((resolve, reject) => {
    chrome?.runtime?.sendMessage(
      {
        action,
        ...data,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Listen for extension state updates
 */
export function onExtensionStateUpdate(callback) {
  const messageHandler = (message) => {
    if (message.type === 'STATE_UPDATE') {
      callback(message.state);
    }
  };

  chrome?.runtime?.onMessage?.addListener(messageHandler);

  return () => {
    chrome?.runtime?.onMessage?.removeListener(messageHandler);
  };
}