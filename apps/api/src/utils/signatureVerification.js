const nacl = require('tweetnacl');

/**
 * Create canonical JSON with guaranteed key ordering
 * Used to ensure client and server sign/verify the same message
 */
function canonicalJSON(obj) {
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
}

/**
 * Verify Ed25519 signature for session receipt
 * 
 * @param {Object} sessionData - Session data that was signed
 * @param {string} signature - Base64-encoded Ed25519 signature
 * @param {string} clientPub - Base64-encoded Ed25519 public key
 * @returns {boolean} - True if signature is valid, false otherwise
 */
function verifySessionSignature(sessionData, signature, clientPub) {
  try {
    // Decode Base64 strings
    const pubKeyBytes = Buffer.from(clientPub, 'base64');
    const signatureBytes = Buffer.from(signature, 'base64');
    
    // Reconstruct the message with canonical JSON (deterministic key ordering)
    const message = canonicalJSON(sessionData);
    const messageBytes = Buffer.from(message);
    
    console.log('🔐 Verifying signature:');
    console.log('   Public Key (base64):', clientPub.substring(0, 20) + '...');
    console.log('   Canonical JSON Message:', message);
    console.log('   Signature (base64):', signature.substring(0, 20) + '...');
    
    // Verify the signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      pubKeyBytes
    );
    
    console.log('   Verification Result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    return isValid;
  } catch (error) {
    console.error('❌ Signature verification error:', error.message);
    console.error('   Session data:', sessionData);
    console.error('   Signature:', signature.substring(0, 20) + '...');
    console.error('   Client pub:', clientPub.substring(0, 20) + '...');
    return false;
  }
}

/**
 * Create a public key from a seed (for testing purposes)
 * In production, clients generate this themselves
 * 
 * @param {Buffer} seed - 32-byte seed
 * @returns {string} - Base64-encoded public key
 */
function generatePublicKeyFromSeed(seed) {
  try {
    const keypair = nacl.sign.keyPair.fromSeed(seed);
    return Buffer.from(keypair.publicKey).toString('base64');
  } catch (error) {
    console.error('❌ Key generation error:', error.message);
    return null;
  }
}

/**
 * Sign session data (for testing/client usage)
 * 
 * @param {Object} sessionData - Session data to sign
 * @param {string} secretKeyBase64 - Base64-encoded secret key
 * @returns {string} - Base64-encoded signature
 */
function signSessionData(sessionData, secretKeyBase64) {
  try {
    const secretKeyBytes = Buffer.from(secretKeyBase64, 'base64');
    const message = canonicalJSON(sessionData);
    const messageBytes = Buffer.from(message);
    
    const signature = nacl.sign.detached(messageBytes, secretKeyBytes);
    return Buffer.from(signature).toString('base64');
  } catch (error) {
    console.error('❌ Signing error:', error.message);
    return null;
  }
}

module.exports = {
  verifySessionSignature,
  generatePublicKeyFromSeed,
  signSessionData,
  canonicalJSON,
};
