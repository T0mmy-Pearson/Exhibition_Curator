#!/bin/bash

# Exhibition Curator - Start Development Servers
echo "🚀 Starting Exhibition Curator Development Environment..."

# Start backend server in background
echo "📡 Starting backend server..."
cd be
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd ../curator-fe
npm run dev &
FRONTEND_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

echo "✅ Both servers are running:"
echo "   - Backend:  http://localhost:9090"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait