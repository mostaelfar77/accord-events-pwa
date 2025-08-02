#!/bin/bash

echo "🎫 Accord Events Registration System"
echo "====================================="
echo ""

# Check if Python 3 is available for simple HTTP server
if command -v python3 &> /dev/null; then
    echo "🚀 Starting Standalone Registration System..."
    echo ""
    
    # Get the current directory
    CURRENT_DIR=$(pwd)
    
    # Find network IP addresses
    echo "💡 Access from this computer: http://localhost:8000"
    echo "💡 Access from other computers on the same network:"
    
    # Get network IP addresses
    if command -v ifconfig &> /dev/null; then
        ifconfig | grep "inet " | grep -v 127.0.0.1 | while read -r line; do
            ip=$(echo $line | awk '{print $2}')
            if [[ $ip =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                echo "   http://$ip:8000"
            fi
        done
    fi
    
    echo ""
    echo "📝 Press Ctrl+C to stop the server"
    echo ""
    
    # Start Python HTTP server in the frontend directory
    cd frontend
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo "🚀 Starting Standalone Registration System..."
    echo ""
    
    # Get the current directory
    CURRENT_DIR=$(pwd)
    
    # Find network IP addresses
    echo "💡 Access from this computer: http://localhost:8000"
    echo "💡 Access from other computers on the same network:"
    
    # Get network IP addresses
    if command -v ifconfig &> /dev/null; then
        ifconfig | grep "inet " | grep -v 127.0.0.1 | while read -r line; do
            ip=$(echo $line | awk '{print $2}')
            if [[ $ip =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                echo "   http://$ip:8000"
            fi
        done
fi

echo ""
echo "📝 Press Ctrl+C to stop the server"
echo ""

    # Start Python HTTP server in the frontend directory
    cd frontend
    python -m http.server 8000
    
else
    echo "❌ Python is not installed. Please install Python first."
    echo "   Visit: https://www.python.org/"
    echo ""
    echo "📝 For local use only, open frontend/index.html in your browser"
    exit 1
fi 