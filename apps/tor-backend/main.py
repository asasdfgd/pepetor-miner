from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64, json, hashlib, time, uuid
from nacl import signing, exceptions
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pepetor-tor-backend")

app = FastAPI(
    title="PepeTor Tor Backend API",
    description="Privacy-first mining backend for Tor network",
    version="2.0.0"
)

# CORS for Tor Browser and IPFS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:*",  # Local development
        "https://ipfs.io",     # IPFS gateway
        "https://*.ipfs.dweb.link",  # IPFS subdomains
        "http://*.onion",      # Tor hidden services
        "https://*.onion"      # Tor hidden services (if using SSL)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with Redis/DB in production)
balances = {}       # {pubkey_hash: credits}
sessions_seen = set()
active_sessions = {}  # Track currently active sessions

class SessionReceipt(BaseModel):
    client_pub: str
    session_id: str
    start_ts: int
    end_ts: int
    bytes_in: int
    bytes_out: int
    socks_port: int
    signature: str

class StartSessionRequest(BaseModel):
    wallet_address: str

class TorSessionInfo(BaseModel):
    session_id: str
    wallet_address: str
    start_time: int
    status: str

def hash_key(data):
    """Hash public key for storage"""
    return hashlib.sha256(data.encode()).hexdigest()

def verify_signature(receipt: SessionReceipt):
    """Verify Ed25519 signature of session receipt"""
    try:
        vk_bytes = base64.b64decode(receipt.client_pub)
        vk = signing.VerifyKey(vk_bytes)
        
        # Reconstruct signed message (must match client exactly)
        data_dict = {
            "client_pub": receipt.client_pub,
            "session_id": receipt.session_id,
            "start_ts": receipt.start_ts,
            "end_ts": receipt.end_ts,
            "bytes_in": receipt.bytes_in,
            "bytes_out": receipt.bytes_out,
            "socks_port": receipt.socks_port
        }
        data = json.dumps(data_dict, sort_keys=True, separators=(',', ':')).encode()
        
        sig = base64.b64decode(receipt.signature)
        vk.verify(data, sig)
        return True
    except exceptions.BadSignatureError:
        logger.warning(f"Invalid signature for session {receipt.session_id}")
        return False
    except Exception as e:
        logger.error(f"Signature verification error: {e}")
        return False

def credit_policy(receipt: SessionReceipt):
    """Calculate credits based on session metrics"""
    duration = receipt.end_ts - receipt.start_ts
    total_bytes = receipt.bytes_in + receipt.bytes_out
    
    # Minimum requirements: 2 minutes and 500KB traffic
    if duration < 120:
        logger.info(f"Session too short: {duration}s")
        return 0
    if total_bytes < 500000:
        logger.info(f"Session traffic too low: {total_bytes} bytes")
        return 0
    
    # Base credits: 1 credit per minute
    base_credits = duration // 60
    
    # Traffic bonus: extra credit for high bandwidth
    traffic_bonus = total_bytes // 1000000  # 1 credit per MB
    
    total_credits = base_credits + traffic_bonus
    logger.info(f"Session credits: {base_credits} base + {traffic_bonus} bonus = {total_credits} total")
    
    return total_credits

@app.middleware("http")
async def log_tor_requests(request: Request, call_next):
    """Log all incoming requests (useful for Tor network monitoring)"""
    client_host = request.client.host if request.client else "unknown"
    logger.info(f"Tor request: {request.method} {request.url.path} from {client_host}")
    response = await call_next(request)
    return response

@app.get("/")
async def root():
    """Root endpoint with Tor-specific info"""
    return {
        "message": "PepeTor Tor Backend API",
        "status": "operational",
        "network": "tor",
        "version": "2.0.0",
        "endpoints": {
            "start_session": "POST /session/start",
            "submit_session": "POST /submit_session", 
            "get_balance": "GET /balance",
            "tor_status": "GET /tor-status"
        }
    }

@app.get("/tor-status")
async def tor_status():
    """Tor-specific health check"""
    return {
        "status": "onion_service_ready",
        "tor_network": "compatible",
        "pepetor_version": "2.0.0",
        "active_sessions": len(active_sessions),
        "total_users": len(balances)
    }

@app.post("/session/start")
async def start_session(request: StartSessionRequest):
    """Start a new mining session (called from Tor Browser)"""
    try:
        session_id = str(uuid.uuid4())
        start_time = int(time.time())
        
        # Store active session
        active_sessions[session_id] = {
            "wallet_address": request.wallet_address,
            "session_id": session_id,
            "start_time": start_time,
            "status": "active"
        }
        
        logger.info(f"Started session {session_id} for {request.wallet_address[:8]}...")
        
        return {
            "session_id": session_id,
            "start_time": start_time,
            "message": "Mining session started",
            "next_step": "Run miner and submit receipt when done"
        }
        
    except Exception as e:
        logger.error(f"Error starting session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/submit_session")
async def submit_session(receipt: SessionReceipt):
    """Submit a completed mining session receipt"""
    try:
        pub_hash = hash_key(receipt.client_pub)
        
        # Check for duplicate session
        if receipt.session_id in sessions_seen:
            logger.warning(f"Duplicate session submitted: {receipt.session_id}")
            raise HTTPException(status_code=409, detail="Duplicate session")
        
        # Verify cryptographic signature
        if not verify_signature(receipt):
            logger.warning(f"Invalid signature for session: {receipt.session_id}")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Calculate credits based on session metrics
        credits = credit_policy(receipt)
        if credits == 0:
            logger.info(f"Session below threshold: {receipt.session_id}")
            raise HTTPException(status_code=422, detail="Session below minimum thresholds")
        
        # Update balances and mark session as processed
        balances[pub_hash] = balances.get(pub_hash, 0) + credits
        sessions_seen.add(receipt.session_id)
        
        # Clean up active session
        if receipt.session_id in active_sessions:
            del active_sessions[receipt.session_id]
        
        logger.info(f"Session {receipt.session_id} credited with {credits} PEPETOR")
        
        return {
            "credit_awarded": credits,
            "total_balance": balances[pub_hash],
            "session_id": receipt.session_id,
            "message": "Rewards credited successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/balance")
async def get_balance(client_pub: str):
    """Get current balance for a public key"""
    try:
        pub_hash = hash_key(client_pub)
        balance = balances.get(pub_hash, 0)
        
        return {
            "wallet_address": client_pub,
            "total_balance": balance,
            "can_claim": balance >= 2000,  # Minimum claim threshold
            "currency": "PEPETOR"
        }
        
    except Exception as e:
        logger.error(f"Error getting balance: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/active-sessions")
async def get_active_sessions():
    """Get currently active mining sessions (admin endpoint)"""
    return {
        "active_sessions_count": len(active_sessions),
        "sessions": list(active_sessions.values())
    }

@app.get("/network-stats")
async def get_network_stats():
    """Get overall network statistics"""
    total_credits = sum(balances.values())
    unique_miners = len(balances)
    
    return {
        "total_miners": unique_miners,
        "total_credits_issued": total_credits,
        "active_sessions": len(active_sessions),
        "unique_sessions_processed": len(sessions_seen)
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=404,
        content={"detail": "Tor endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    logger.error(f"Internal error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal tor service error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_config=None
    )