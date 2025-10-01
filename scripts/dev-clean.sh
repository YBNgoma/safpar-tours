#!/bin/bash

# Safpar Tours Development Server Startup Script
# This script ensures port 3000 is free before starting the dev server

echo "🚀 Starting Safpar Tours Development Server..."
echo "================================================"

# Function to kill processes on port 3000
kill_port_3000() {
    echo "🔍 Checking for processes on port 3000..."
    
    # Find processes using port 3000
    PIDS=$(lsof -ti:3000 2>/dev/null)
    
    if [ -z "$PIDS" ]; then
        echo "✅ Port 3000 is free"
    else
        echo "⚠️  Found processes on port 3000: $PIDS"
        echo "🔪 Killing processes..."
        
        # Kill processes gracefully first (SIGTERM)
        for pid in $PIDS; do
            echo "   Terminating PID $pid..."
            kill $pid 2>/dev/null
        done
        
        # Wait a moment for graceful shutdown
        sleep 2
        
        # Check if any processes are still running
        REMAINING_PIDS=$(lsof -ti:3000 2>/dev/null)
        
        if [ ! -z "$REMAINING_PIDS" ]; then
            echo "💀 Force killing remaining processes..."
            for pid in $REMAINING_PIDS; do
                echo "   Force killing PID $pid..."
                kill -9 $pid 2>/dev/null
            done
        fi
        
        # Final check
        sleep 1
        FINAL_CHECK=$(lsof -ti:3000 2>/dev/null)
        if [ -z "$FINAL_CHECK" ]; then
            echo "✅ Port 3000 is now free"
        else
            echo "❌ Failed to free port 3000. Some processes may still be running."
        fi
    fi
}

# Function to check if required tools are available
check_dependencies() {
    if ! command -v lsof &> /dev/null; then
        echo "⚠️  lsof not found. Installing..."
        sudo apt update && sudo apt install -y lsof
    fi
}

# Main execution
main() {
    echo "🔧 Checking dependencies..."
    check_dependencies
    
    echo ""
    kill_port_3000
    
    echo ""
    echo "🌟 Starting Next.js development server..."
    echo "📱 Auth0 will be available at: http://localhost:3000"
    echo "🔐 Admin dashboard: http://localhost:3000/admin/dashboard"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "================================================"
    
    # Start the development server
    npm run dev
}

# Handle Ctrl+C gracefully
cleanup() {
    echo ""
    echo "🛑 Stopping development server..."
    kill_port_3000
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handler
trap cleanup SIGINT SIGTERM

# Run main function
main