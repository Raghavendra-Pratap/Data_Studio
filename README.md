# Unified Data Studio v2 🚀

**Next-generation data management, visualization, and workflow automation platform built with Rust and React. Cross-platform support for macOS, Linux, and Windows.**

## 🏗️ Architecture

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   React Frontend │ ◄────────────► │   Rust Backend   │
│   (Electron)    │                │   (Single Exec)  │
└─────────────────┘                └─────────────────┘
```

## ✨ Features

- **🚀 High Performance**: Rust backend for maximum speed and efficiency
- **📊 Advanced Data Processing**: Handle millions of rows with ease
- **🔄 Workflow Automation**: Complex workflow execution with dependencies
- **📈 Real-time Visualization**: Interactive charts and dashboards
- **💾 Multi-database Support**: SQLite, PostgreSQL, MongoDB
- **🔒 Memory Safe**: Rust's memory safety guarantees
- **📦 Single Executable**: No dependency issues, easy deployment

## 🛠️ Tech Stack

### Backend (Rust)
- **Web Framework**: Actix-web
- **Data Processing**: Polars, ndarray, datafusion
- **Database**: SQLx, diesel
- **Serialization**: Serde
- **Async Runtime**: Tokio

### Frontend (React + Electron)
- **UI Framework**: React 18
- **Desktop**: Electron
- **Charts**: D3.js, Chart.js
- **State Management**: React hooks
- **Styling**: Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Rust 1.70+
- Node.js 18+
- npm/yarn

### Backend Setup
```bash
cd backend
cargo build --release
./target/release/backend
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Build Complete Package
```bash
npm run build:complete
```

## 📁 Project Structure

```
unified-data-studio-v2/
├── backend/                 # Rust backend
│   ├── src/
│   ├── Cargo.toml
│   └── target/
├── frontend/               # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── scripts/                # Build scripts
├── dist/                   # Cross-platform distribution files
│   ├── macOS/              # .dmg, .zip files
│   ├── Linux/              # .AppImage, .deb, .rpm, .snap
│   └── Windows/            # .exe, .msi, .portable
└── README.md
```

## 🎯 Performance Targets

- **Startup Time**: < 100ms
- **Data Processing**: 10x faster than Python
- **Memory Usage**: 70% less than Python
- **Bundle Size**: < 50MB total
- **Concurrent Workflows**: 1000+ simultaneous

## 🔧 Development

### Backend Development
```bash
cd backend
cargo run
cargo test
cargo clippy
```

### Frontend Development
```bash
cd frontend
npm run dev
npm run build
npm run test
```

## 📦 Distribution

### Single Executable
```bash
cargo build --release
# Result: single backend executable
```

### Cross-Platform Electron App
```bash
# Build for all platforms
npm run build:electron:all

# Build for specific platform
npm run build:electron:mac      # macOS (.dmg, .zip)
npm run build:electron:linux    # Linux (.AppImage, .deb, .rpm, .snap)
npm run build:electron:win      # Windows (.exe, .msi, .portable)

# Result: Platform-specific installers
```

## 🚀 Why Rust?

- **Performance**: 5-10x faster than Python
- **Memory Safety**: Zero runtime errors
- **Concurrency**: True parallel processing
- **Reliability**: No garbage collection pauses
- **Deployment**: Single executable, no dependencies
- **Cross-Platform**: Native builds for all major OS

## 🌍 Cross-Platform Support

- **🍎 macOS**: Intel + Apple Silicon (DMG, ZIP)
- **🐧 Linux**: x64 + ARM64 (AppImage, DEB, RPM, Snap)
- **🪟 Windows**: x64 + x86 (EXE, MSI, Portable)
- **📦 Universal**: Build once, run everywhere

## 📈 Roadmap

- [x] Project setup
- [ ] Rust backend core
- [ ] React frontend
- [ ] Electron integration
- [ ] Data processing engine
- [ ] Workflow automation
- [ ] Advanced visualizations
- [ ] Performance optimization
- [ ] Distribution packaging

---

**Built with ❤️ using Rust and React**
