#!/bin/bash

# Test Backend API Endpoints
# Helps diagnose what's wrong with the backend

echo ""
echo "🧪 PEPETOR Backend API Test"
echo "============================"
echo ""

BACKEND_URL="http://localhost:3001"
TIMEOUT=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "Testing backend at: $BACKEND_URL"
echo ""

# Test 1: Backend is running
echo -e "${BLUE}Test 1: Backend Connectivity${NC}"
if curl -s --max-time $TIMEOUT "$BACKEND_URL/api/health" > /dev/null 2>&1 || \
   curl -s --max-time $TIMEOUT "$BACKEND_URL/" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is responding"
else
    echo -e "${RED}✗${NC} Backend is not responding"
    echo "  Make sure to run: npm run dev"
    echo ""
    exit 1
fi
echo ""

# Test 2: Debug info
echo -e "${BLUE}Test 2: System & Tor Debug Info${NC}"
DEBUG_RESPONSE=$(curl -s --max-time $TIMEOUT "$BACKEND_URL/api/tor/debug")

if echo "$DEBUG_RESPONSE" | grep -q "platform"; then
    echo -e "${GREEN}✓${NC} Got debug information"
    echo ""
    echo "  Platform: $(echo $DEBUG_RESPONSE | grep -o '"platform":"[^"]*"' | cut -d'"' -f4)"
    echo "  Node version: $(echo $DEBUG_RESPONSE | grep -o '"node_version":"[^"]*"' | cut -d'"' -f4)"
    
    # Check Tor binary
    if echo "$DEBUG_RESPONSE" | grep -q '"found":true'; then
        echo -e "  Tor binary: ${GREEN}✓ Found${NC}"
        TOR_VER=$(echo $DEBUG_RESPONSE | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "  Tor version: $TOR_VER"
    else
        echo -e "  Tor binary: ${RED}✗ NOT FOUND${NC}"
        echo "  Error: $(echo $DEBUG_RESPONSE | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
        echo ""
        echo "  ⚠️  Tor is not installed!"
        echo "  Fix: bash scripts/install-tor-mac12.sh"
    fi
else
    echo -e "${RED}✗${NC} Could not get debug info"
    echo "  Response: $DEBUG_RESPONSE"
fi
echo ""

# Test 3: Tor status
echo -e "${BLUE}Test 3: Tor Status${NC}"
STATUS_RESPONSE=$(curl -s --max-time $TIMEOUT "$BACKEND_URL/api/tor/status")

if echo "$STATUS_RESPONSE" | grep -q '"status"'; then
    TOR_STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo -e "  Tor status: ${GREEN}$TOR_STATUS${NC}"
else
    echo "  Tor not started yet (this is normal)"
fi
echo ""

# Test 4: Traffic config
echo -e "${BLUE}Test 4: Traffic Monitor Config${NC}"
CONFIG_RESPONSE=$(curl -s --max-time $TIMEOUT "$BACKEND_URL/api/tor/traffic-config")

if echo "$CONFIG_RESPONSE" | grep -q '"proxy_port"'; then
    PROXY_PORT=$(echo "$CONFIG_RESPONSE" | grep -o '"proxy_port":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓${NC} Traffic monitor configured"
    echo "  Proxy port: $PROXY_PORT"
else
    echo -e "${YELLOW}⚠${NC} Traffic monitor config not available"
fi
echo ""

# Test 5: Try to start Tor
echo -e "${BLUE}Test 5: Attempting to Start Tor${NC}"
START_RESPONSE=$(curl -s --max-time 40 -X POST "$BACKEND_URL/api/tor/start")

if echo "$START_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓${NC} Tor started successfully!"
else
    echo -e "${RED}✗${NC} Failed to start Tor"
    echo ""
    echo "  Response: $START_RESPONSE"
    echo ""
    
    if echo "$START_RESPONSE" | grep -q "not found"; then
        echo "  ERROR: Tor binary not found"
        echo "  Fix: bash scripts/install-tor-mac12.sh"
    elif echo "$START_RESPONSE" | grep -q "spawn"; then
        echo "  ERROR: Failed to spawn Tor process"
        echo "  Make sure Tor is in your PATH:"
        echo "    tor --version"
    elif echo "$START_RESPONSE" | grep -q "timeout"; then
        echo "  ERROR: Tor bootstrap timeout"
        echo "  Tor might be slow to start, try again"
    fi
fi
echo ""

# Final summary
echo -e "${BLUE}📊 Summary${NC}"
echo ""
echo "If you see all ✓ green checks above:"
echo "  → Backend is working! Run: npm run dev"
echo ""
echo "If you see ✗ red issues:"
echo "  → Check the specific error message and fix suggestion"
echo "  → Most common: run bash scripts/install-tor-mac12.sh"
echo ""