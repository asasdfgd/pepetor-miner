#!/bin/bash

# PEPETOR-MINER Simple Development Launcher
# Ultra-minimal version - just runs both servers

set -e

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

cleanup() {
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "🚀 Starting PEPETOR-MINER..."
echo ""

cd "$ROOT_DIR/backend" && npm run dev &
BACKEND_PID=$!

sleep 2

cd "$ROOT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

echo "✅ Backend running on http://localhost:3001"
echo "✅ Frontend running on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"

wait