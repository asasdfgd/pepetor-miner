const nacl = require('tweetnacl');

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
    
    // Reconstruct the message that should have been signed
    // The message should be a consistent JSON representation
    const message = JSON.stringify(sessionData);
    const messageBytes = Buffer.from(message);
    
    console.log('🔐 Verifying signature:');
    console.log('   Public Key (base64):', clientPub);
    console.log('   Signed Message:', message);
    console.log('   Signature (base64):', signature);
    
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
    console.error('   Signature:', signature);
    console.error('   Client pub:', clientPub);
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
    const message = JSON.stringify(sessionData);
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
};