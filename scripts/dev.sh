#!/bin/bash

# PEPETOR-MINER Development Server Launcher
# Runs backend and frontend simultaneously

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( dirname "$SCRIPT_DIR" )"

echo ""
echo "🚀 PEPETOR-MINER Development Environment"
echo "=========================================="
echo ""

# Colors
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servers stopped"
}

trap cleanup EXIT INT TERM

# Start backend
echo "📦 Starting Backend Server..."
cd "$ROOT_DIR/backend"
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "  • Backend PID: $BACKEND_PID"
echo "  • Logs: /tmp/backend.log"
echo "  • URL: http://localhost:3001"
echo ""

# Wait a bit for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting Frontend Server..."
cd "$ROOT_DIR/frontend"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  • Frontend PID: $FRONTEND_PID"
echo "  • Logs: /tmp/frontend.log"
echo "  • URL: http://localhost:3000"
echo ""

echo "=========================================="
echo "✨ Both servers are running!"
echo ""
echo "📋 Useful commands:"
echo "  • Backend logs:  tail -f /tmp/backend.log"
echo "  • Frontend logs: tail -f /tmp/frontend.log"
echo "  • Press Ctrl+C to stop both servers"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Configure system proxy to 127.0.0.1:9149"
echo "  3. Load the Chrome extension"
echo "  4. Click 'Start Tor' and begin monitoring"
echo "=========================================="
echo ""

# Wait for both processes
wait