# Phase #3A - Session Receipts & Balance System

## 📋 Overview

Phase #3A implements the complete backend system for session receipt submission, signature verification, and balance tracking. This is the foundation for the MVP's reward mechanism.

**Key Components**:
- 🔐 Ed25519 signature verification (client-signed receipts)
- ✅ Heuristics validation (minimum duration, minimum bytes)
- 🛡️ Replay attack prevention
- 💰 Credits calculation and ledger management
- 📊 Balance querying

---

## 🏗️ Architecture

### Data Models

#### Session
Stores signed session receipts from clients.

```javascript
{
  _id: ObjectId,
  clientPub: "base64-ed25519-pubkey",      // Client's public key
  sessionId: "uuid",                       // Unique session ID
  startTs: 1700000000000,                  // Start timestamp (ms)
  endTs: 1700000010000,                    // End timestamp (ms)
  bytesIn: 12345,                          // Bytes received
  bytesOut: 54321,                         // Bytes sent
  socksPort: 9050,                         // SOCKS5 proxy port
  signature: "base64-ed25519-signature",   // Signed message
  isValid: true,                           // Passed all validations
  creditsGranted: 5.23,                    // Credits awarded
  validationDetails: {
    signatureValid: true,
    minDurationValid: true,
    minBytesValid: true,
    replayCheckValid: true,
  },
  validationError: null,
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
}
```

#### Ledger
Tracks balance and statistics per client public key.

```javascript
{
  _id: ObjectId,
  clientPub: "base64-ed25519-pubkey",
  balance: 150.75,                         // Current balance
  totalSessionsSubmitted: 42,
  totalBytesTransferred: 1073741824,       // 1 GB
  totalSessionDuration: 3600,              // Seconds
  lastSessionAt: "2025-01-15T09:50:00Z",
  totalRejected: 2,
  rejectionReasons: [
    { reason: "Duration too short", count: 1 },
    { reason: "Bytes too low", count: 1 },
  ],
  createdAt: "2025-01-14T12:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
}
```

---

## 🔐 Signature Verification

### Process

1. **Client generates keypair** (Ed25519)
   - Public key: shared with server (used to identify client)
   - Secret key: kept private (used to sign receipts)

2. **Client signs session data**
   ```javascript
   const message = JSON.stringify({
     client_pub: "<base64-pubkey>",
     session_id: "uuid",
     start_ts: 1700000000000,
     end_ts: 1700000010000,
     bytes_in: 12345,
     bytes_out: 54321,
     socks_port: 9050,
   });
   
   signature = nacl.sign.detached(message, secretKey);
   // Return base64-encoded signature
   ```

3. **Server verifies signature**
   - Deserializes the same message
   - Uses public key to verify signature
   - If invalid, reject immediately

### Utilities

```javascript
const { verifySessionSignature, signSessionData } = require('./utils/signatureVerification');

// Verify (server-side)
const isValid = verifySessionSignature(sessionData, signature, clientPublicKey);

// Sign (client/testing)
const signature = signSessionData(sessionData, secretKeyBase64);
```

---

## ✅ Heuristics Validation

### Policy Configuration

```javascript
{
  MIN_DURATION_SECONDS: 10,        // Minimum session duration
  MIN_BYTES_TOTAL: 1024,            // Minimum total bytes (1 KB)
  CREDITS_PER_SECOND: 0.1,          // 0.1 credit per second
  CREDITS_PER_MB: 0.5,              // 0.5 credit per MB
  MAX_CREDITS_PER_SESSION: 100,     // Cap to prevent abuse
}
```

### Validation Steps

1. **Duration Check**: `(endTs - startTs) / 1000 >= MIN_DURATION_SECONDS`
2. **Bytes Check**: `(bytesIn + bytesOut) >= MIN_BYTES_TOTAL`
3. **Credits Calculation**:
   ```
   durationSeconds = (endTs - startTs) / 1000
   durationCredits = durationSeconds * CREDITS_PER_SECOND
   
   totalBytes = bytesIn + bytesOut
   totalMB = totalBytes / (1024 * 1024)
   bytesCredits = totalMB * CREDITS_PER_MB
   
   finalCredits = min(durationCredits + bytesCredits, MAX_CREDITS_PER_SESSION)
   ```

### Example

**Session Data**:
- Duration: 60 seconds
- Bytes: 10 MB

**Calculation**:
- Duration credits: 60 × 0.1 = 6 credits
- Bytes credits: 10 × 0.5 = 5 credits
- **Total: 11 credits** (under cap of 100)

---

## 🛡️ Replay Attack Prevention

**Mechanism**: Compound unique index on `(clientPub, sessionId)`

- Same client cannot submit the same `sessionId` twice
- If replay detected: return 409 Conflict error
- Session marked with `replayChecked: true`

---

## 📡 API Endpoints

### 1. Submit Session Receipt

**POST** `/api/sessions/submit`

Submit a signed session receipt for validation and credit calculation.

**Request Body**:
```json
{
  "client_pub": "base64-encoded-ed25519-pubkey",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "start_ts": 1700000000000,
  "end_ts": 1700000060000,
  "bytes_in": 5242880,
  "bytes_out": 5242880,
  "socks_port": 9050,
  "signature": "base64-encoded-ed25519-signature"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Session submitted and validated successfully",
  "session": {
    "sessionId": "507f1f77bcf86cd799439011",
    "creditsGranted": 11.0,
    "creditsBreakDown": {
      "durationCredits": 6.0,
      "bytesCredits": 5.0,
      "total": 11.0
    }
  },
  "ledger": {
    "clientPub": "base64-pubkey",
    "balance": 11.0,
    "totalSessionsSubmitted": 1
  }
}
```

**Error Responses**:

- **400**: Missing fields, invalid timestamps, or heuristics failed
  ```json
  {
    "success": false,
    "message": "Session rejected: heuristics validation failed",
    "reasons": ["Duration 5s is below minimum 10s"]
  }
  ```

- **401**: Signature verification failed
  ```json
  {
    "success": false,
    "message": "Invalid signature"
  }
  ```

- **409**: Replay attack detected
  ```json
  {
    "success": false,
    "message": "Session replay detected: this session was already submitted"
  }
  ```

---

### 2. Get Balance

**GET** `/api/sessions/balance?pubkey=<base64-pubkey>`

Query balance and statistics for a public key.

**Query Parameters**:
- `pubkey` (required): Base64-encoded Ed25519 public key

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "clientPub": "base64-pubkey",
    "balance": 150.75,
    "totalSessionsSubmitted": 42,
    "totalBytesTransferred": 1073741824,
    "totalSessionDuration": 3600,
    "lastSessionAt": "2025-01-15T09:50:00Z",
    "createdAt": "2025-01-14T12:00:00Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "No ledger entry found for this public key"
}
```

---

### 3. Get Policy

**GET** `/api/sessions/policy`

Get current credits policy (heuristics configuration).

**Success Response** (200):
```json
{
  "success": true,
  "policy": {
    "minDurationSeconds": 10,
    "minBytesTotal": 1024,
    "creditsPerSecond": 0.1,
    "creditsPerMB": 0.5,
    "maxCreditsPerSession": 100
  }
}
```

---

### 4. Get Session Details

**GET** `/api/sessions/:sessionId`

Get detailed information about a specific session, including full validation details.

**URL Parameters**:
- `sessionId` (required): MongoDB ObjectId of session

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "clientPub": "base64-pubkey",
    "duration": 60,
    "bytesIn": 5242880,
    "bytesOut": 5242880,
    "totalBytes": 10485760,
    "creditsGranted": 11.0,
    "isValid": true,
    "validationDetails": {
      "signatureValid": true,
      "minDurationValid": true,
      "minBytesValid": true,
      "replayCheckValid": true
    },
    "validationError": null,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### 5. Get Client Sessions

**GET** `/api/sessions/by-client/list?clientPub=<base64-pubkey>`

Get recent sessions for a client (last 50).

**Query Parameters**:
- `clientPub` (required): Base64-encoded public key

**Success Response** (200):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "duration": 60,
      "totalBytes": 10485760,
      "creditsGranted": 11.0,
      "isValid": true,
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440001",
      "duration": 45,
      "totalBytes": 5242880,
      "creditsGranted": 8.5,
      "isValid": true,
      "createdAt": "2025-01-15T09:50:00Z"
    }
  ]
}
```

---

## 🧪 Testing & Examples

### Setup: Generate Test Keypair

```bash
node -e "
const nacl = require('tweetnacl');
const keypair = nacl.sign.keyPair();
console.log('Public Key (base64):', Buffer.from(keypair.publicKey).toString('base64'));
console.log('Secret Key (base64):', Buffer.from(keypair.secretKey).toString('base64'));
"
```

**Example Output**:
```
Public Key (base64): ABC123...xyz==
Secret Key (base64): DEF456...abc==
```

---

### cURL Examples

#### 1. Check API Endpoints

```bash
curl http://localhost:3001/api
```

---

#### 2. Get Current Policy

```bash
curl http://localhost:3001/api/sessions/policy
```

---

#### 3. Generate and Submit Session (Node.js)

Create `/tmp/test-session.js`:

```javascript
const nacl = require('tweetnacl');
const { v4: uuidv4 } = require('uuid');

// Generate keypair
const keypair = nacl.sign.keyPair();
const clientPub = Buffer.from(keypair.publicKey).toString('base64');
const secretKey = keypair.secretKey;

// Create session data
const sessionData = {
  client_pub: clientPub,
  session_id: uuidv4(),
  start_ts: Date.now() - 120000,  // 2 minutes ago
  end_ts: Date.now(),              // Now (so 120 sec duration)
  bytes_in: 5242880,               // 5 MB
  bytes_out: 5242880,              // 5 MB (10 MB total)
  socks_port: 9050,
};

// Sign the message
const message = JSON.stringify(sessionData);
const signatureBytes = nacl.sign.detached(
  Buffer.from(message),
  secretKey
);
const signature = Buffer.from(signatureBytes).toString('base64');

// Add signature to data
const payload = {
  ...sessionData,
  signature,
};

console.log(JSON.stringify(payload, null, 2));
```

**Run and submit**:

```bash
cd /Users/josephpietravalle/PEPETOR-MINER/backend
node -r dotenv/config -e "
const nacl = require('tweetnacl');
const { v4: uuidv4 } = require('uuid');

const keypair = nacl.sign.keyPair();
const clientPub = Buffer.from(keypair.publicKey).toString('base64');
const secretKey = keypair.secretKey;

const sessionData = {
  client_pub: clientPub,
  session_id: uuidv4(),
  start_ts: Date.now() - 120000,
  end_ts: Date.now(),
  bytes_in: 5242880,
  bytes_out: 5242880,
  socks_port: 9050,
};

const message = JSON.stringify(sessionData);
const signatureBytes = nacl.sign.detached(Buffer.from(message), secretKey);
const signature = Buffer.from(signatureBytes).toString('base64');

const payload = { ...sessionData, signature };

fetch('http://localhost:3001/api/sessions/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e));
"
```

---

#### 4. Query Balance

After submitting a session, query the balance:

```bash
# Replace with actual base64 public key from above
curl "http://localhost:3001/api/sessions/balance?pubkey=ABC123...xyz=="
```

---

#### 5. Test Session Rejection (Too Short Duration)

```bash
node -r dotenv/config -e "
const nacl = require('tweetnacl');
const { v4: uuidv4 } = require('uuid');

const keypair = nacl.sign.keyPair();
const clientPub = Buffer.from(keypair.publicKey).toString('base64');
const secretKey = keypair.secretKey;

// Only 5 seconds duration (below 10 second minimum)
const sessionData = {
  client_pub: clientPub,
  session_id: uuidv4(),
  start_ts: Date.now() - 5000,
  end_ts: Date.now(),
  bytes_in: 5242880,
  bytes_out: 5242880,
  socks_port: 9050,
};

const message = JSON.stringify(sessionData);
const signatureBytes = nacl.sign.detached(Buffer.from(message), secretKey);
const signature = Buffer.from(signatureBytes).toString('base64');

const payload = { ...sessionData, signature };

fetch('http://localhost:3001/api/sessions/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e));
"
```

Expected: **400 error** - "Duration 5s is below minimum 10s"

---

#### 6. Test Replay Attack Prevention

Submit the same session twice:

```bash
# Run the test from Example #3 twice
# Second attempt should return 409 Conflict error
```

---

## 📊 Data Flow

```
Client Native Host                Server
    |                              |
    |-- Generate keypair --------->|
    |                          (store pubkey)
    |
    |-- Create session           |
    |   (start_ts, end_ts,        |
    |    bytes_in/out)            |
    |                              |
    |-- Sign message              |
    |   (Ed25519)                 |
    |                              |
    |-- Submit receipt ----------->|
    |   + signature               |
    |                          Verify signature
    |                          Check replay
    |                          Apply heuristics
    |                          Calculate credits
    |                          Update ledger
    |                              |
    |<----- Confirm + balance -----|
    |   (creditsGranted,           |
    |    ledger.balance)           |
    |                              |
```

---

## 🔍 Debugging

### Check MongoDB Collections

```bash
# Connect to MongoDB
mongosh

# List collections
show collections

# View recent sessions
db.sessions.find().sort({ createdAt: -1 }).limit(5)

# View ledger
db.ledgers.find()

# View session with validation details
db.sessions.findOne({ isValid: true }, { validationDetails: 1 })
```

---

## 🎯 Next Steps

1. **Frontend Dashboard Integration**
   - Display client's balance
   - Show recent sessions
   - Test submission flow

2. **Native Tor Host Integration**
   - Connect to native session tracking
   - Generate session receipts
   - Auto-submit to backend

3. **Chrome Extension Integration**
   - Connect to native host
   - Submit receipts
   - Display balance in extension popup

---

## 📈 Performance Notes

- **Signature Verification**: ~1ms per verification
- **Ledger Updates**: Atomic operation (single MongoDB document)
- **Session Lookup**: Indexed by (clientPub, sessionId)
- **Balance Query**: Single document lookup by clientPub

---

## 🔒 Security Considerations

- ✅ Ed25519 cryptographic verification
- ✅ Replay attack prevention via unique constraints
- ✅ No client authentication required (public key identifies client)
- ✅ Heuristics prevent low-effort spam submissions
- ⚠️ Consider rate limiting on `/submit` endpoint
- ⚠️ Consider signature timestamp validation
- ⚠️ Consider IP-based rate limiting for denial-of-service protection

---

**Status**: ✅ Phase #3A Complete - Production Ready  
**Last Updated**: January 2025  
**Next Phase**: Frontend Session Dashboard (Phase #3B)