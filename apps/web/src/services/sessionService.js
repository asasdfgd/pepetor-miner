import api from './api';
import nacl from 'tweetnacl';

/**
 * Session Service - Handles cryptographic signing and session API calls
 * Uses Ed25519 signatures for proof-of-ownership without backend session management
 */

// LocalStorage keys for keypair management
const KEYPAIR_STORAGE_KEY = 'pepetor_keypair';
const CLIENT_PUB_STORAGE_KEY = 'pepetor_client_pub';

/**
 * Convert Uint8Array to base64 string (browser-compatible, replaces Buffer)
 */
const toBase64 = (uint8Array) => {
  const binaryString = String.fromCharCode(...uint8Array);
  return btoa(binaryString);
};

/**
 * Convert base64 string to Uint8Array (browser-compatible)
 */
const fromBase64 = (base64String) => {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Create canonical JSON with guaranteed key ordering
 * Must match backend's canonicalJSON for signature verification to work
 */
const canonicalJSON = (obj) => {
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => {
    const value = obj[key];
    let serializedValue;
    if (typeof value === 'string') {
      serializedValue = JSON.stringify(value);
    } else if (typeof value === 'number') {
      serializedValue = value.toString();
    } else if (value === null) {
      serializedValue = 'null';
    } else {
      serializedValue = JSON.stringify(value);
    }
    return `"${key}":${serializedValue}`;
  });
  return '{' + pairs.join(',') + '}';
};

/**
 * Generate or retrieve client keypair
 * Note: In production, this would be managed by native host/extension
 */
export const getOrCreateKeypair = () => {
  let stored = localStorage.getItem(KEYPAIR_STORAGE_KEY);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        publicKey: new Uint8Array(parsed.publicKey),
        secretKey: new Uint8Array(parsed.secretKey),
      };
    } catch (e) {
      console.error('Failed to parse stored keypair:', e);
      localStorage.removeItem(KEYPAIR_STORAGE_KEY);
    }
  }

  // Generate new keypair
  const keypair = nacl.sign.keyPair();
  
  // Store in localStorage (not production-safe, but demo-friendly)
  localStorage.setItem(KEYPAIR_STORAGE_KEY, JSON.stringify({
    publicKey: Array.from(keypair.publicKey),
    secretKey: Array.from(keypair.secretKey),
  }));

  return keypair;
};

/**
 * Get client public key (base64 format)
 */
export const getClientPublicKey = () => {
  const keypair = getOrCreateKeypair();
  return toBase64(keypair.publicKey);
};

/**
 * Sign session data with client's secret key
 */
const signSessionData = (dataToSign, secretKey) => {
  // Backend expects this exact format for signature verification
  // Must match the exact field names
  const backendFormat = {
    client_pub: toBase64(dataToSign.clientPub),
    session_id: dataToSign.sessionId,
    start_ts: dataToSign.start_ts,
    end_ts: dataToSign.end_ts,
    bytes_in: dataToSign.bytes_in,
    bytes_out: dataToSign.bytes_out,
  };
  
  // Use canonical JSON (deterministic key ordering) to match backend verification
  const messageJson = canonicalJSON(backendFormat);
  console.log('🔐 Signing session data with canonical JSON:', messageJson);
  
  const messageBytes = new TextEncoder().encode(messageJson);
  const signedMessage = nacl.sign.detached(messageBytes, secretKey);
  const signatureBase64 = toBase64(signedMessage);
  console.log('   Generated signature:', signatureBase64);
  return signatureBase64;
};

/**
 * Generate mock session data for demonstration
 */
export const generateMockSession = () => {
  const now = new Date();
  return {
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: now.toISOString(),
    duration: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
    bytesTransferred: Math.floor(Math.random() * 50000) + 1000, // 1KB-50KB
    ipHash: `hash_${Math.random().toString(36).substr(2, 12)}`,
  };
};

/**
 * Submit a session with cryptographic signature
 */
export const submitSession = async (sessionData) => {
  try {
    const keypair = getOrCreateKeypair();
    
    // Convert timestamp string to milliseconds if needed
    const startTime = new Date(sessionData.timestamp).getTime();
    const endTime = startTime + (sessionData.duration * 1000);
    
    // Split bytes (for now, use half for in and half for out)
    const totalBytes = sessionData.bytesTransferred;
    const bytesIn = Math.floor(totalBytes / 2);
    const bytesOut = totalBytes - bytesIn;
    
    // Create the data object with backend field names for signing
    const dataToSign = {
      clientPub: keypair.publicKey,
      sessionId: sessionData.sessionId,
      start_ts: startTime,
      end_ts: endTime,
      bytes_in: bytesIn,
      bytes_out: bytesOut,
    };

    // Sign the session data
    const signature = signSessionData(dataToSign, keypair.secretKey);

    // Prepare submission payload with backend field names
    const payload = {
      client_pub: toBase64(keypair.publicKey),
      session_id: sessionData.sessionId,
      start_ts: startTime,
      end_ts: endTime,
      bytes_in: bytesIn,
      bytes_out: bytesOut,
      signature,
    };

    // Submit to backend
    const response = await api.post('/sessions/submit', payload);
    return response;
  } catch (error) {
    console.error('Error submitting session:', error);
    throw error;
  }
};

/**
 * Get current balance for client
 */
export const getBalance = async () => {
  try {
    const clientPub = getClientPublicKey();
    const response = await api.get(`/sessions/balance?pubkey=${clientPub}`);
    return response.data || response;
  } catch (error) {
    // If no ledger entry found (404), return default balance for new client
    // The error could come in different formats depending on interceptor
    const isNotFound = 
      error.response?.status === 404 || 
      error.status === 404 ||
      error.message?.includes('ledger') ||
      error.message?.includes('404');
    
    if (isNotFound) {
      console.log('New client - no ledger entry yet. Starting with 0 balance.');
      return {
        balance: 0,
        totalSessionsSubmitted: 0,
        totalBytesTransferred: 0,
        totalSessionDuration: 0,
      };
    }
    console.error('Error fetching balance:', error);
    throw error;
  }
};

/**
 * Get session submission policy
 */
export const getSessionPolicy = async () => {
  try {
    const response = await api.get('/sessions/policy');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching session policy:', error);
    throw error;
  }
};

/**
 * Get recent sessions for current client
 */
export const getClientSessions = async () => {
  try {
    const clientPub = getClientPublicKey();
    const response = await api.get(`/sessions/by-client/list?clientPub=${clientPub}`);
    const responseData = response.data || response;
    return responseData.data || responseData;
  } catch (error) {
    console.error('Error fetching client sessions:', error);
    throw error;
  }
};

/**
 * Get details for a specific session
 */
export const getSessionDetails = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching session details:', error);
    throw error;
  }
};

/**
 * Export keypair for backup (for demo purposes only)
 */
export const exportKeypair = () => {
  const keypair = getOrCreateKeypair();
  return {
    publicKey: toBase64(keypair.publicKey),
    secretKey: toBase64(keypair.secretKey),
  };
};

/**
 * Reset keypair (generate new one)
 */
export const resetKeypair = () => {
  localStorage.removeItem(KEYPAIR_STORAGE_KEY);
  localStorage.removeItem(CLIENT_PUB_STORAGE_KEY);
  return getOrCreateKeypair();
};

export default {
  getOrCreateKeypair,
  getClientPublicKey,
  generateMockSession,
  submitSession,
  getBalance,
  getSessionPolicy,
  getClientSessions,
  getSessionDetails,
  exportKeypair,
  resetKeypair,
};