#!/bin/bash

# InsightForge Frontend Launcher
# Ensures consistent frontend launch on port 8080

echo "🚀 Launching InsightForge Frontend..."
echo "="========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the client directory."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed or not in PATH"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if port 8080 is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is already in use. Stopping existing process..."
    lsof -ti:8080 | xargs kill -9
    sleep 2
fi

echo "✅ Starting frontend on http://localhost:8080"
echo "🌐 Backend should be running on http://localhost:5001"
echo "📱 Press Ctrl+C to stop the frontend"
echo "="========================================="

# Launch the frontend
npm run dev
