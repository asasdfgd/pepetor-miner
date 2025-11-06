#!/usr/bin/env node

/**
 * Session Testing Utility
 * 
 * Test the session submission and balance endpoints
 * 
 * Usage:
 *   node test-sessions.js submit  - Submit a test session
 *   node test-sessions.js balance - Check balance
 *   node test-sessions.js policy  - Get policy
 *   node test-sessions.js help    - Show help
 */

require('dotenv').config();
const nacl = require('tweetnacl');
const { v4: uuidv4 } = require('uuid');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

function logSuccess(msg) {
  log(colors.green, '✅', msg);
}

function logError(msg) {
  log(colors.red, '❌', msg);
}

function logInfo(msg) {
  log(colors.blue, 'ℹ️', msg);
}

function logDebug(msg) {
  log(colors.gray, '→', msg);
}

/**
 * Generate a new keypair for testing
 */
function generateKeypair() {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: Buffer.from(keypair.publicKey).toString('base64'),
    secretKey: Buffer.from(keypair.secretKey).toString('base64'),
  };
}

/**
 * Create canonical JSON with guaranteed key ordering
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
 * Sign session data with a secret key
 */
function signSessionData(sessionData, secretKeyBase64) {
  const secretKeyBytes = Buffer.from(secretKeyBase64, 'base64');
  const message = canonicalJSON(sessionData);
  const messageBytes = Buffer.from(message);

  const signatureBytes = nacl.sign.detached(messageBytes, secretKeyBytes);
  return Buffer.from(signatureBytes).toString('base64');
}

/**
 * Create and submit a test session
 */
async function submitTestSession(options = {}) {
  try {
    logInfo('Generating keypair...');
    const keypair = generateKeypair();
    logSuccess('Keypair generated');
    logDebug('Public Key:', keypair.publicKey);

    // Get duration from options or default to 120 seconds
    const durationMs = (options.duration || 120) * 1000;
    const now = Date.now();

    const sessionData = {
      client_pub: keypair.publicKey,
      session_id: uuidv4(),
      start_ts: now - durationMs,
      end_ts: now,
      bytes_in: options.bytesIn || 5242880, // 5 MB
      bytes_out: options.bytesOut || 5242880, // 5 MB
      socks_port: options.socksPort || 9050,
    };

    logInfo('Creating session...');
    logDebug('Session ID:', sessionData.session_id);
    logDebug('Duration:', (durationMs / 1000).toFixed(1), 'seconds');
    logDebug('Bytes In:', (sessionData.bytes_in / 1024 / 1024).toFixed(1), 'MB');
    logDebug('Bytes Out:', (sessionData.bytes_out / 1024 / 1024).toFixed(1), 'MB');

    // Sign the session
    logInfo('Signing session...');
    const signature = signSessionData(sessionData, keypair.secretKey);
    logSuccess('Session signed');

    const payload = {
      ...sessionData,
      signature,
    };

    // Submit to server
    logInfo('Submitting to', `${API_URL}/sessions/submit...`);
    const response = await fetch(`${API_URL}/sessions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      logError('Submission failed:', result.message);
      if (result.reasons) {
        result.reasons.forEach((r) => logError('  -', r));
      }
      return false;
    }

    logSuccess('Session submitted successfully!');
    console.log(JSON.stringify(result, null, 2));

    // Show balance
    logInfo(`\nQuerying balance for ${keypair.publicKey.substring(0, 20)}...`);
    const balanceResponse = await fetch(
      `${API_URL}/sessions/balance?pubkey=${encodeURIComponent(
        keypair.publicKey
      )}`
    );
    const balanceResult = await balanceResponse.json();

    if (balanceResponse.ok) {
      logSuccess('Balance retrieved:');
      console.log(
        '  Balance:',
        colors.green + balanceResult.data.balance + colors.reset
      );
      console.log(
        '  Sessions:',
        balanceResult.data.totalSessionsSubmitted
      );
      console.log(
        '  Total Bytes:',
        (balanceResult.data.totalBytesTransferred / 1024 / 1024).toFixed(2),
        'MB'
      );
    }

    return true;
  } catch (error) {
    logError('Error:', error.message);
    return false;
  }
}

/**
 * Get balance for a public key
 */
async function getBalance(pubkey) {
  try {
    logInfo('Querying balance...');
    const response = await fetch(
      `${API_URL}/sessions/balance?pubkey=${encodeURIComponent(pubkey)}`
    );

    if (!response.ok) {
      logError('Failed to fetch balance:', response.statusText);
      return;
    }

    const result = await response.json();
    logSuccess('Balance data:');
    console.log(JSON.stringify(result.data, null, 2));
  } catch (error) {
    logError('Error:', error.message);
  }
}

/**
 * Get current policy
 */
async function getPolicy() {
  try {
    logInfo('Fetching policy...');
    const response = await fetch(`${API_URL}/sessions/policy`);

    if (!response.ok) {
      logError('Failed to fetch policy:', response.statusText);
      return;
    }

    const result = await response.json();
    logSuccess('Current Policy:');
    console.log(JSON.stringify(result.policy, null, 2));
  } catch (error) {
    logError('Error:', error.message);
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
${colors.blue}Session Testing Utility${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node test-sessions.js <command> [options]

${colors.yellow}Commands:${colors.reset}
  submit [--duration=120] [--bytes-in=5242880] [--bytes-out=5242880]
    Submit a test session with the given parameters
    
    Options:
      --duration=N        Session duration in seconds (default: 120)
      --bytes-in=N        Bytes received (default: 5242880 = 5 MB)
      --bytes-out=N       Bytes sent (default: 5242880 = 5 MB)
      
    Examples:
      node test-sessions.js submit
      node test-sessions.js submit --duration=60 --bytes-in=1048576
      node test-sessions.js submit --bytes-out=10485760

  balance <pubkey>
    Query balance for a public key
    
    Example:
      node test-sessions.js balance ABC123...xyz==

  policy
    Get current credits policy

  help
    Show this help message

${colors.yellow}Environment Variables:${colors.reset}
  API_URL  API base URL (default: http://localhost:3001/api)

${colors.yellow}Examples:${colors.reset}
  # Submit a 120-second session
  node test-sessions.js submit

  # Submit a 60-second session with 10 MB transfer
  node test-sessions.js submit --duration=60 --bytes-in=5242880 --bytes-out=5242880

  # Get current policy
  node test-sessions.js policy

${colors.blue}Tips:${colors.reset}
  • The first time you submit a session, it creates a ledger entry
  • You can submit multiple sessions from the same public key
  • Balance accumulates with each valid submission
  • Minimum duration: 10 seconds
  • Minimum transfer: 1 KB total

  `);
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value ? parseInt(value, 10) : true;
    }
  }
  return options;
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options = parseArgs(args.slice(1));

  switch (command) {
    case 'submit':
      await submitTestSession(options);
      break;
    case 'balance':
      if (!args[1]) {
        logError('Public key is required');
        console.log('\nUsage: node test-sessions.js balance <pubkey>');
        process.exit(1);
      }
      await getBalance(args[1]);
      break;
    case 'policy':
      await getPolicy();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      logError(`Unknown command: ${command}`);
      console.log('Run "node test-sessions.js help" for usage information\n');
      process.exit(1);
  }
}

main().catch(console.error);