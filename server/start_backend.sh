#!/bin/bash

# Simple InsightForge Backend Starter
# Kills existing processes and starts fresh backend

echo "🚀 Starting InsightForge Backend..."
echo "=================================="

# Kill any existing processes
echo "🔍 Checking for existing processes..."
pkill -f "insightforge_app.py" 2>/dev/null
pkill -f "python.*insightforge_app" 2>/dev/null

# Wait for cleanup
sleep 2

# Check if port 5001 is available
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5001 still in use. Force killing..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Check dependencies
echo "🔍 Checking Python dependencies..."
python -c "import flask, flask_cors, requests, bs4, pandas, numpy; print('✅ All dependencies available')" 2>/dev/null || {
    echo "❌ Missing dependencies. Installing..."
    pip install -r requirements_competitive_intelligence.txt
}

# Check competitive intelligence modules
echo "🔍 Checking competitive intelligence modules..."
python -c "import competitive_intelligence_api, hybrid_competitive_scraper, competitive_intelligence_db; print('✅ CI modules available')" 2>/dev/null || {
    echo "⚠️  Some CI modules missing - will run in legacy mode"
}

echo "✅ Starting backend on port 5001..."
echo "📱 Press Ctrl+C to stop"
echo "=================================="

# Start the backend
python insightforge_app.py
