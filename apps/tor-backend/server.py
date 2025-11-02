from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64, json, hashlib
from nacl import signing, exceptions

app = FastAPI(title="PepeTor Miner Backend MVP")

balances = {}       # {pubkey_hash: credits}
sessions_seen = set()

class SessionReceipt(BaseModel):
    client_pub: str
    session_id: str
    start_ts: int
    end_ts: int
    bytes_in: int
    bytes_out: int
    socks_port: int
    signature: str

def hash_key(data):
    return hashlib.sha256(data.encode()).hexdigest()

def verify_signature(receipt: SessionReceipt):
    """Verify the miner's signed receipt using Ed25519."""
    vk_bytes = base64.b64decode(receipt.client_pub)
    vk = signing.VerifyKey(vk_bytes)

    # Match miner's JSON encoding EXACTLY
    msg_dict = {
        "client_pub": receipt.client_pub,
        "session_id": receipt.session_id,
        "start_ts": receipt.start_ts,
        "end_ts": receipt.end_ts,
        "bytes_in": receipt.bytes_in,
        "bytes_out": receipt.bytes_out,
        "socks_port": receipt.socks_port
    }

    # 👇 Important: same separators + sorted keys = exact byte-for-byte match
    msg = json.dumps(msg_dict, separators=(",", ":"), sort_keys=True).encode("utf-8")

    sig = base64.b64decode(receipt.signature)
    try:
        vk.verify(msg, sig)
        return True
    except exceptions.BadSignatureError:
        return False


def credit_policy(receipt: SessionReceipt):
    duration = receipt.end_ts - receipt.start_ts
    total_bytes = receipt.bytes_in + receipt.bytes_out
    if duration < 120 or total_bytes < 500_000:
        return 0
    return duration // 60  # 1 credit per minute

@app.post("/submit_session")
def submit_session(receipt: SessionReceipt):
    pub_hash = hash_key(receipt.client_pub)
    if receipt.session_id in sessions_seen:
        raise HTTPException(status_code=409, detail="DuplicateSession")
    if not verify_signature(receipt):
        raise HTTPException(status_code=400, detail="InvalidSignature")
    credits = credit_policy(receipt)
    if credits == 0:
        raise HTTPException(status_code=422, detail="BelowThreshold")
    balances[pub_hash] = balances.get(pub_hash, 0) + credits
    sessions_seen.add(receipt.session_id)
    return {"credit_awarded": credits, "total_balance": balances[pub_hash]}

@app.get("/balance")
def get_balance(client_pub: str):
    pub_hash = hash_key(client_pub)
    return {"total_balance": balances.get(pub_hash, 0)}
