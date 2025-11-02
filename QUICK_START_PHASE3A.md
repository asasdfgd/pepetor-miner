# Phase #3A - Quick Start Guide
## Session Receipts & Balance System

---

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install tweetnacl uuid  # Already done ✅
```

### Step 2: Start Backend
```bash
npm run dev
# Server runs on http://localhost:3001
```

### Step 3: Test the API

#### Get Policy
```bash
curl http://localhost:3001/api/sessions/policy
```

#### Submit a Test Session
```bash
cd backend
node test-sessions.js submit
```

#### Query Balance
```bash
# Copy the public key from previous output
node test-sessions.js balance <YOUR_PUBKEY_HERE>
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `SESSION_RECEIPTS.md` | Complete technical documentation |
| `PHASE_3A_SUMMARY.md` | Implementation overview |
| `QUICK_START_PHASE3A.md` | This file (quick reference) |

---

## 🧪 Testing Commands

### Easy Testing (Recommended)

```bash
cd backend

# Submit a 120-second session (10 MB)
node test-sessions.js submit

# Submit a 60-second session (1 MB)
node test-sessions.js submit --duration=60 --bytes-in=524288 --bytes-out=524288

# Query balance
node test-sessions.js balance <PUBKEY>

# Get policy
node test-sessions.js policy

# Help
node test-sessions.js help
```

### Manual cURL Testing

```bash
# Get all available endpoints
curl http://localhost:3001/api

# Get policy
curl http://localhost:3001/api/sessions/policy

# Generate keypair and submit (Node.js)
node -r dotenv/config << 'EOF'
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
EOF
```

---

## 🔑 API Endpoints Quick Reference

### Submit Session
```
POST /api/sessions/submit
Content-Type: application/json

{
  "client_pub": "base64-pubkey",
  "session_id": "uuid",
  "start_ts": 1700000000000,
  "end_ts": 1700000060000,
  "bytes_in": 5242880,
  "bytes_out": 5242880,
  "socks_port": 9050,
  "signature": "base64-signature"
}

Response: 201 Created
{
  "success": true,
  "session": {
    "creditsGranted": 11.0,
    "creditsBreakDown": {
      "durationCredits": 6.0,
      "bytesCredits": 5.0,
      "total": 11.0
    }
  }
}
```

### Query Balance
```
GET /api/sessions/balance?pubkey=<base64-pubkey>

Response: 200 OK
{
  "success": true,
  "data": {
    "balance": 11.0,
    "totalSessionsSubmitted": 1,
    "totalBytesTransferred": 10485760,
    "totalSessionDuration": 120,
    "lastSessionAt": "2025-01-15T10:00:00Z"
  }
}
```

### Get Policy
```
GET /api/sessions/policy

Response: 200 OK
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

### Get Session Details
```
GET /api/sessions/:sessionId

Response: 200 OK
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "creditsGranted": 11.0,
    "isValid": true,
    "validationDetails": {
      "signatureValid": true,
      "minDurationValid": true,
      "minBytesValid": true,
      "replayCheckValid": true
    }
  }
}
```

### List Client Sessions
```
GET /api/sessions/by-client/list?clientPub=<base64-pubkey>

Response: 200 OK
{
  "success": true,
  "count": 3,
  "data": [
    {
      "sessionId": "uuid",
      "duration": 120,
      "totalBytes": 10485760,
      "creditsGranted": 11.0,
      "isValid": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## 💡 Common Scenarios

### Scenario 1: Testing Valid Session
```bash
node test-sessions.js submit
# Output: 200 with creditsGranted
```

### Scenario 2: Testing Rejected Session (Too Short)
```bash
node test-sessions.js submit --duration=5
# Output: 400 "Duration 5s is below minimum 10s"
```

### Scenario 3: Testing Rejected Session (Too Little Data)
```bash
node test-sessions.js submit --bytes-in=512 --bytes-out=512
# Output: 400 "Total bytes 1024 is below minimum 1024"
```

### Scenario 4: Testing Replay Attack Prevention
```bash
# Run the same session ID twice
node test-sessions.js submit
node test-sessions.js submit  # With same session_id
# Second output: 409 "Session replay detected"
```

---

## 🔍 Debugging

### Check MongoDB
```bash
mongosh

# View collections
show collections

# View recent sessions
db.sessions.find().sort({ createdAt: -1 }).limit(5)

# View ledger
db.ledgers.findOne()

# Count valid sessions
db.sessions.countDocuments({ isValid: true })
```

### Check Logs
```bash
# Look at backend logs (if running in dev mode)
# Should see: "POST /api/sessions/submit"
```

### Check API Response
```bash
# All responses follow this format:
{
  "success": true/false,
  "message": "...",
  "data": { ... },
  "error": "..."  # only in dev mode
}
```

---

## 📊 Example Flow

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

### Step 2: Submit Session
```bash
node test-sessions.js submit
```

**Output**:
```
✅ Keypair generated
✅ Session signed
ℹ️ Submitting to http://localhost:3001/api/sessions/submit...
✅ Session submitted successfully!
ℹ️ Querying balance for ABC123...
✅ Balance retrieved:
  Balance: 11
  Sessions: 1
  Total Bytes: 10.00 MB
```

### Step 3: Query Balance Again
```bash
node test-sessions.js balance <PUBKEY_FROM_ABOVE>
```

**Output**:
```
{
  "balance": 11,
  "totalSessionsSubmitted": 1,
  "totalBytesTransferred": 10485760,
  "totalSessionDuration": 120,
  "lastSessionAt": "2025-01-15T10:00:00Z",
  "createdAt": "2025-01-15T09:55:00Z"
}
```

---

## 🎯 Key Concepts

### Session Receipt
A signed proof that a client used Tor for a certain duration and transferred a certain amount of data.

### Signature
Ed25519 cryptographic proof that the client created the receipt (using their secret key).

### Balance
Accumulated credits earned from valid sessions.

### Credits
Reward units calculated based on:
- Duration (0.1 credit/second)
- Data transferred (0.5 credit/MB)
- Capped at 100/session

### Heuristics
Rules that prevent invalid/spam submissions:
- Min 10 seconds duration
- Min 1 KB transferred
- Max 100 credits/session

### Ledger
Database entry tracking a client's total balance and statistics.

---

## ⚠️ Common Issues

### Issue: "Cannot find module 'tweetnacl'"
**Solution**: `npm install tweetnacl uuid` in backend directory

### Issue: "Failed to connect to MongoDB"
**Solution**: Make sure MongoDB is running (`mongosh` should connect)

### Issue: "Signature verification failed"
**Solution**: Ensure you're signing the exact same JSON structure the server expects

### Issue: "Session replay detected"
**Solution**: This is correct! Try with a new `session_id` (use `uuidv4()`)

---

## 📚 File Locations

```
backend/
├── src/
│   ├── models/Session.js
│   ├── models/Ledger.js
│   ├── controllers/sessionController.js
│   ├── routes/sessionRoutes.js
│   ├── utils/signatureVerification.js
│   ├── utils/creditsPolicy.js
│   └── index.js (updated)
├── test-sessions.js (helper script)
└── package.json (tweetnacl added)

docs/
├── SESSION_RECEIPTS.md (detailed docs)
├── PHASE_3A_SUMMARY.md (technical overview)
└── QUICK_START_PHASE3A.md (this file)
```

---

## 🚀 Next Steps

1. **Experiment with the testing script**
   - Try different durations and byte amounts
   - Observe credit calculations
   - Test error conditions

2. **Examine the database**
   - Look at created Session documents
   - Check Ledger entries
   - Understand the data structure

3. **Read the detailed docs**
   - `SESSION_RECEIPTS.md` for full API reference
   - `PHASE_3A_SUMMARY.md` for architecture

4. **Prepare for Phase #3B**
   - Frontend dashboard to display balance
   - Mock session submission UI
   - Real-time balance updates

---

## 🆘 Need Help?

1. **API Questions**: See `SESSION_RECEIPTS.md`
2. **Architecture Questions**: See `PHASE_3A_SUMMARY.md`
3. **Testing Issues**: Run `node test-sessions.js help`
4. **Code Issues**: Check backend logs with `npm run dev`

---

**Phase #3A Status**: ✅ Complete  
**Ready For**: Phase #3B - Frontend Integration  
**Est. Time to Complete Phase #3B**: 2-3 hours

Happy testing! 🎉