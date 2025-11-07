const nacl = require('tweetnacl');
const { canonicalize } = require('@pepetor-miner/shared');

function verifySessionSignature(sessionData, signature, clientPub) {
  try {
    const pubKeyBytes = Buffer.from(clientPub, 'base64');
    const signatureBytes = Buffer.from(signature, 'base64');
    
    const message = canonicalize(sessionData);
    const messageBytes = Buffer.from(message);
    
    console.log('🔐 Verifying signature:');
    console.log('   Session Data:', JSON.stringify(sessionData));
    console.log('   Public Key (base64):', clientPub.substring(0, 20) + '...');
    console.log('   Canonical Message:', message);
    console.log('   Message Bytes Length:', messageBytes.length);
    console.log('   Signature (base64):', signature.substring(0, 20) + '...');
    
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      pubKeyBytes
    );
    
    console.log('   Verification Result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    return isValid;
  } catch (error) {
    console.error('❌ Signature verification error:', error.message);
    console.error('   Session data:', JSON.stringify(sessionData));
    console.error('   Signature:', signature.substring(0, 20) + '...');
    console.error('   Client pub:', clientPub.substring(0, 20) + '...');
    return false;
  }
}

function generatePublicKeyFromSeed(seed) {
  try {
    const keypair = nacl.sign.keyPair.fromSeed(seed);
    return Buffer.from(keypair.publicKey).toString('base64');
  } catch (error) {
    console.error('❌ Key generation error:', error.message);
    return null;
  }
}

function signSessionData(sessionData, secretKeyBase64) {
  try {
    const secretKeyBytes = Buffer.from(secretKeyBase64, 'base64');
    const message = canonicalize(sessionData);
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
