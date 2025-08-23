#!/bin/bash

echo "🚀 Unified Data Studio v2 - Quick Start"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the unified-data-studio-v2 directory"
    exit 1
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo "✅ Rust installed"
else
    echo "✅ Rust is installed: $(rustc --version)"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
else
    echo "✅ Node.js is installed: $(node --version)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
else
    echo "✅ npm is installed: $(npm --version)"
fi

echo ""
echo "🐿️ Building Rust backend..."
cd backend

# Build backend
if cargo build --release; then
    echo "✅ Backend built successfully"
    
    # Test backend
    echo "🧪 Testing backend..."
    timeout 10s ./target/release/backend --host 127.0.0.1 --port 5002 &
    BACKEND_PID=$!
    sleep 3
    
    # Check if backend is responding
    if curl -s http://127.0.0.1:5002/health > /dev/null; then
        echo "✅ Backend test successful"
        kill $BACKEND_PID 2>/dev/null
    else
        echo "⚠️ Backend test failed, but continuing..."
        kill $BACKEND_PID 2>/dev/null
    fi
else
    echo "❌ Backend build failed"
    exit 1
fi

cd ..

echo ""
echo "⚛️ Setting up React frontend..."
cd frontend

# Install dependencies
if npm install; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

cd ..

echo ""
echo "🔌 Setting up Electron..."
cd frontend

# Install Electron dependencies
if npm install electron electron-builder --save-dev; then
    echo "✅ Electron dependencies installed"
else
    echo "❌ Electron dependency installation failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start development:"
echo "   1. Terminal 1: cd frontend && npm start"
echo "   2. Terminal 2: cd frontend && npm run electron"
echo ""
echo "🔧 To build complete package:"
echo "   python3 build_complete_package.py"
echo ""
echo "📦 To test standalone package:"
echo "   cd unified-data-studio-v2-package && ./start.sh"
echo ""
echo "✨ Happy coding with Unified Data Studio v2!"
