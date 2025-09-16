#!/bin/bash

# Quick script to kill any process using port 3000
echo "🔍 Checking for processes on port 3000..."

PIDS=$(lsof -ti:3000 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ Port 3000 is already free"
    exit 0
fi

echo "⚠️  Found processes on port 3000: $PIDS"
echo "🔪 Killing processes..."

# Kill processes
for pid in $PIDS; do
    echo "   Killing PID $pid..."
    kill -9 $pid 2>/dev/null
done

echo "✅ Port 3000 is now free"