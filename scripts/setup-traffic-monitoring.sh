#!/bin/bash

# PEPETOR Traffic Monitoring Setup Script
# This script helps set up real traffic monitoring for the PEPETOR Miner

set -e

echo "🚀 PEPETOR Traffic Monitoring Setup"
echo "===================================="
echo ""

# Check if running macOS or Linux
OS_TYPE=$(uname)
echo "Detected OS: $OS_TYPE"
echo ""

# Step 1: Check for Node.js
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "  Node.js version: $(node --version)"
echo ""

# Step 2: Check for Tor
echo "✓ Checking Tor installation..."
if ! command -v tor &> /dev/null; then
    echo "⚠️  Tor is not installed"
    if [ "$OS_TYPE" == "Darwin" ]; then
        echo "  Installing Tor via Homebrew..."
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew is not installed. Please install it first:"
            echo "   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        brew install tor
        echo "✓ Tor installed via Homebrew"
    elif [ "$OS_TYPE" == "Linux" ]; then
        echo "  Installing Tor via package manager..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y tor
            echo "✓ Tor installed via apt-get"
        elif command -v yum &> /dev/null; then
            sudo yum install -y tor
            echo "✓ Tor installed via yum"
        fi
    fi
else
    echo "  Tor version: $(tor --version)"
fi
echo ""

# Step 3: Install backend dependencies
echo "✓ Installing backend dependencies..."
if [ -d "backend" ]; then
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo "  Dependencies already installed"
    fi
    cd ..
    echo "✓ Backend dependencies ready"
else
    echo "❌ backend directory not found"
    exit 1
fi
echo ""

# Step 4: Install frontend dependencies (optional)
echo "✓ Checking frontend..."
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "  Installing frontend dependencies..."
        npm install
    else
        echo "  Frontend dependencies already installed"
    fi
    cd ..
fi
echo ""

# Step 5: Check .env files
echo "✓ Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    echo "  Creating backend/.env from template..."
    cp backend/.env.example backend/.env
fi

if [ -f "frontend/.env" ]; then
    echo "  Frontend .env already exists"
else
    echo "  Creating frontend/.env from template..."
    cp frontend/.env.example frontend/.env
fi
echo ""

# Step 6: Summary
echo "═══════════════════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Start the backend:"
echo "   cd backend && npm start"
echo ""
echo "2️⃣  In another terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3️⃣  Start Tor and monitoring:"
echo "   - Open http://localhost:3000 in your browser"
echo "   - Login with your account"
echo "   - Click 'Start Tor' button"
echo "   - Wait for Tor to bootstrap (30-60 seconds)"
echo "   - Click 'Start Monitoring'"
echo ""
echo "4️⃣  Set up system proxy (important!):"
echo ""

if [ "$OS_TYPE" == "Darwin" ]; then
    echo "   macOS:"
    echo "   - System Settings → Network → WiFi (or Ethernet)"
    echo "   - Click 'Advanced...'"
    echo "   - Go to 'Proxies' tab"
    echo "   - Check 'SOCKS Proxy'"
    echo "   - Server: 127.0.0.1, Port: 9149"
    echo "   - Click OK"
elif [ "$OS_TYPE" == "Linux" ]; then
    echo "   Linux:"
    echo "   - For GNOME: Settings → Network → Network Proxy"
    echo "   - Set SOCKS Host: 127.0.0.1, Port: 9149"
    echo "   - Or use environment: export all_proxy=socks5://127.0.0.1:9149"
elif [ "$OS_TYPE" == "Windows" ]; then
    echo "   Windows:"
    echo "   - Settings → Network & Internet → Proxy"
    echo "   - Enable 'Use a proxy server'"
    echo "   - SOCKS proxy: 127.0.0.1, Port: 9149"
fi

echo ""
echo "5️⃣  Load Chrome extension:"
echo "   - Open chrome://extensions/"
echo "   - Enable 'Developer mode'"
echo "   - Click 'Load unpacked'"
echo "   - Select chrome-extension/ folder"
echo ""
echo "6️⃣  Start browsing!"
echo "   - Browse normally through the proxy"
echo "   - Traffic will be automatically captured"
echo "   - Sessions will be auto-submitted"
echo "   - Check your balance in the extension"
echo ""
echo "📚 For more info, see: TRAFFIC_MONITORING_GUIDE.md"
echo ""