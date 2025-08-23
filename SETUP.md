# 🚀 Unified Data Studio v2 - Setup Guide

## 📋 Prerequisites

### 1. Install Rust
```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart your terminal or run:
source ~/.cargo/env

# Verify installation
rustc --version
cargo --version
```

### 2. Install Node.js (18+)
```bash
# Using Homebrew (macOS)
brew install node

# Or download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

### 3. Install Python (3.8+)
```bash
# Using Homebrew (macOS)
brew install python

# Verify installation
python3 --version
```

## 🏗️ Project Structure

```
unified-data-studio-v2/
├── backend/                 # Rust backend
│   ├── src/
│   │   ├── main.rs         # Main application
│   │   ├── data_processor.rs # Data processing engine
│   │   ├── workflow_engine.rs # Workflow automation
│   │   ├── database.rs     # Database operations
│   │   └── models.rs       # Data models
│   ├── Cargo.toml          # Rust dependencies
│   └── target/             # Build output
├── frontend/               # React frontend
│   ├── src/
│   ├── public/
│   │   ├── electron.js     # Electron main process
│   │   └── preload.js      # Preload script
│   └── package.json        # Node.js dependencies
├── scripts/                 # Build scripts
├── build_complete_package.py # Complete build script
├── quick_start.sh          # Quick setup script
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Option 1: Automated Setup
```bash
# Make script executable and run
chmod +x quick_start.sh
./quick_start.sh
```

### Option 2: Manual Setup

#### Step 1: Build Rust Backend
```bash
cd backend
cargo build --release
```

#### Step 2: Setup React Frontend
```bash
cd frontend
npm install
npm install electron electron-builder --save-dev
```

#### Step 3: Test Backend
```bash
cd backend
./target/release/backend --host 127.0.0.1 --port 5001
```

#### Step 4: Start Frontend
```bash
cd frontend
# Terminal 1: Start React dev server
npm start

# Terminal 2: Start Electron
npm run electron
```

## 🔧 Development Workflow

### Backend Development
```bash
cd backend

# Run in development mode
cargo run

# Run tests
cargo test

# Check code quality
cargo clippy

# Format code
cargo fmt
```

### Frontend Development
```bash
cd frontend

# Start development server
npm start

# Start Electron in development
npm run electron

# Build for production
npm run build

# Run tests
npm test
```

### Full Stack Development
```bash
# Terminal 1: Backend
cd backend && cargo run

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Electron
cd frontend && npm run electron
```

## 📦 Building Complete Package

### Build Everything
```bash
python3 build_complete_package.py
```

This will:
1. Build Rust backend in release mode
2. Build React frontend
3. Create Electron DMG package
4. Create standalone package

### Output Files
- `dist/` - Electron DMG files
- `unified-data-studio-v2-package/` - Standalone package
- `backend/target/release/backend` - Rust binary

## 🧪 Testing

### Backend Testing
```bash
cd backend
cargo test
cargo test -- --nocapture  # Show output
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Testing
```bash
# Start backend
cd backend && cargo run &

# Test API endpoints
curl http://127.0.0.1:5001/health
curl http://127.0.0.1:5001/test
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Rust Build Errors
```bash
# Update Rust
rustup update

# Clean build
cargo clean
cargo build --release
```

#### 2. Node.js Version Issues
```bash
# Use nvm to manage Node.js versions
nvm install 18
nvm use 18
```

#### 3. Port Conflicts
```bash
# Check what's using port 5001
lsof -i :5001

# Kill conflicting process
kill -9 <PID>
```

#### 4. Electron Build Issues
```bash
# Clear Electron cache
rm -rf ~/.cache/electron
rm -rf node_modules
npm install
```

### Debug Mode
```bash
# Backend with debug logging
RUST_LOG=debug cargo run

# Frontend with debug
DEBUG=* npm start
```

## 📊 Performance Benchmarks

### Expected Performance
- **Backend Startup**: < 100ms
- **Data Processing**: 10x faster than Python
- **Memory Usage**: 70% less than Python
- **Bundle Size**: < 50MB total
- **Concurrent Workflows**: 1000+ simultaneous

### Monitoring
```bash
# Monitor backend performance
cd backend && cargo run --release

# Monitor memory usage
ps aux | grep backend
top -p <BACKEND_PID>
```

## 🔒 Security

### Development
- CORS enabled for local development
- No authentication in development mode
- Debug logging enabled

### Production
- CORS restricted to specific origins
- API key authentication
- Rate limiting
- Input validation
- SQL injection protection

## 📈 Next Steps

1. **Customize Backend**: Add your specific data processing operations
2. **Extend Workflows**: Create custom workflow steps
3. **Add Visualizations**: Implement D3.js charts
4. **Database Integration**: Connect to your data sources
5. **Deployment**: Set up CI/CD pipeline

## 🆘 Support

### Documentation
- [Rust Book](https://doc.rust-lang.org/book/)
- [Actix-web](https://actix.rs/)
- [React Documentation](https://reactjs.org/)
- [Electron Documentation](https://www.electronjs.org/)

### Community
- [Rust Community](https://www.rust-lang.org/community)
- [React Community](https://reactjs.org/community/support.html)
- [Electron Community](https://www.electronjs.org/community)

---

**Happy coding with Unified Data Studio v2! 🚀**
