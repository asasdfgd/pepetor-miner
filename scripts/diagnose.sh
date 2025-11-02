#!/bin/bash

# PEPETOR-MINER Diagnostic Script
# Helps identify what's wrong with your setup

echo ""
echo "🔍 PEPETOR-MINER Diagnostic Report"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ISSUES_FOUND=0

# Helper functions
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

# 1. System Info
echo -e "${BLUE}📋 System Information:${NC}"
echo "  OS: $(uname -s) $(uname -r)"
echo "  Architecture: $(uname -m)"
echo ""

# 2. Node.js Check
echo -e "${BLUE}📦 Node.js:${NC}"
if command -v node &> /dev/null; then
    NODE_V=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_V"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if command -v npm &> /dev/null; then
    NPM_V=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_V"
else
    echo -e "${RED}✗${NC} npm not found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# 3. Tor Check
echo -e "${BLUE}🔒 Tor Status:${NC}"
if command -v tor &> /dev/null; then
    TOR_V=$(tor --version | head -1)
    echo -e "${GREEN}✓${NC} Tor installed: $TOR_V"
    
    # Try to start Tor briefly
    echo "  Testing Tor startup..."
    timeout 5 tor --version > /dev/null 2>&1
    check_status $? "  Tor binary works"
else
    echo -e "${RED}✗${NC} Tor not found in PATH"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    
    # Check if tor exists in common locations
    if [ -f "/usr/local/bin/tor" ]; then
        echo -e "${YELLOW}⚠${NC}  Found Tor at /usr/local/bin/tor (not in PATH)"
    elif [ -f "/opt/homebrew/bin/tor" ]; then
        echo -e "${YELLOW}⚠${NC}  Found Tor at /opt/homebrew/bin/tor (not in PATH)"
    fi
fi
echo ""

# 4. MongoDB Check
echo -e "${BLUE}💾 MongoDB:${NC}"
if command -v mongod &> /dev/null; then
    MONGO_V=$(mongod --version | head -1)
    echo -e "${GREEN}✓${NC} MongoDB installed: $MONGO_V"
else
    echo -e "${YELLOW}⚠${NC} MongoDB not found (optional for development)"
fi
echo ""

# 5. Directory Structure
echo -e "${BLUE}📁 Project Structure:${NC}"
[ -d "backend" ] && echo -e "${GREEN}✓${NC} backend/" || echo -e "${RED}✗${NC} backend/ not found"
[ -d "frontend" ] && echo -e "${GREEN}✓${NC} frontend/" || echo -e "${RED}✗${NC} frontend/ not found"
[ -d "chrome-extension" ] && echo -e "${GREEN}✓${NC} chrome-extension/" || echo -e "${RED}✗${NC} chrome-extension/ not found"
[ -d "backend/node_modules" ] && echo -e "${GREEN}✓${NC} backend/node_modules/" || echo -e "${YELLOW}⚠${NC} backend/node_modules/ (need: npm run dev:setup)"
[ -d "frontend/node_modules" ] && echo -e "${GREEN}✓${NC} frontend/node_modules/" || echo -e "${YELLOW}⚠${NC} frontend/node_modules/ (need: npm run dev:setup)"
echo ""

# 6. Environment Files
echo -e "${BLUE}⚙️  Configuration:${NC}"
[ -f "backend/.env" ] && echo -e "${GREEN}✓${NC} backend/.env" || echo -e "${YELLOW}⚠${NC} backend/.env missing"
[ -f "frontend/.env" ] && echo -e "${GREEN}✓${NC} frontend/.env" || echo -e "${YELLOW}⚠${NC} frontend/.env missing"
echo ""

# 7. Port Availability
echo -e "${BLUE}🔌 Port Availability:${NC}"
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 3000 is in use"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✓${NC} Port 3000 is free"
fi

if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 3001 is in use"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✓${NC} Port 3001 is free"
fi

if lsof -i :9149 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 9149 (traffic proxy) is in use"
else
    echo -e "${GREEN}✓${NC} Port 9149 is free"
fi

if lsof -i :9050 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 9050 (Tor SOCKS) is in use"
else
    echo -e "${GREEN}✓${NC} Port 9050 is free"
fi
echo ""

# 8. Summary
echo -e "${BLUE}📊 Summary:${NC}"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! You're ready to go.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. npm run dev:setup"
    echo "  2. npm run dev"
else
    echo -e "${RED}✗ Found $ISSUES_FOUND issue(s)${NC}"
    echo ""
    echo -e "${YELLOW}Recommendations:${NC}"
    
    if ! command -v tor &> /dev/null; then
        echo ""
        echo "  Fix Tor installation:"
        echo "  $ brew install tor"
        echo ""
        echo "  OR use the Mac 12 Tor installer:"
        echo "  $ bash scripts/install-tor-mac12.sh"
    fi
    
    if ! command -v npm &> /dev/null; then
        echo ""
        echo "  Install Node.js from: https://nodejs.org/"
    fi
    
    if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
        echo ""
        echo "  Install dependencies:"
        echo "  $ npm run dev:setup"
    fi
    
    if lsof -i :3000 > /dev/null 2>&1; then
        echo ""
        echo "  Port 3000 is in use. Kill it:"
        echo "  $ lsof -i :3000 | grep LISTEN | awk '{print \$2}' | xargs kill -9"
    fi
fi

echo ""
echo "===================================="
echo ""