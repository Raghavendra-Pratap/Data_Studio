# Unified Data Studio v2 - Development Guide

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 18.20.8 or higher
- **npm**: 10.8.2 or higher
- **Rust**: 1.70.0 or higher
- **Git**: Latest version
- **Electron**: 28.3.3 (installed via npm)
- **rustc**: For formula code compilation testing

### System Requirements
- **Operating System**: macOS 10.15+, Windows 10+, Ubuntu 18.04+
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 2GB free space for development
- **Network**: Internet connection for package downloads

## 🛠️ Development Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/unified-data-studio-v2.git
cd unified-data-studio-v2
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Backend Setup
```bash
cd ../backend

# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install dependencies
cargo build

# Verify installation
cargo --version
rustc --version
```

### 4. Environment Configuration
```bash
# Create environment files
cp .env.example .env
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

**Required Environment Variables**:
```bash
# Frontend
REACT_APP_API_URL=http://localhost:5002
REACT_APP_ENVIRONMENT=development

# Backend
RUST_LOG=debug
SERVER_HOST=127.0.0.1
SERVER_PORT=5002
DATABASE_URL=sqlite:///data/uds.db

# Electron
ELECTRON_IS_DEV=true
```

## 🔧 Development Workflow

### Local Development Mode

#### 1. Start Backend Service
```bash
cd backend
cargo run

# Expected output:
# Running `target/debug/uds-backend`
# INFO  uds_backend > Starting server on 127.0.0.1:5002
# INFO  uds_backend > Server started successfully
```

#### 2. Start Frontend Development Server
```bash
cd frontend
npm start

# Expected output:
# Compiled successfully!
# Local:            http://localhost:3000
# On Your Network:  http://192.168.1.100:3000
```

#### 3. Start Electron Development
```bash
# In a new terminal
cd frontend
npm run electron-dev

# This will:
# 1. Wait for React dev server (localhost:3000)
# 2. Launch Electron with hot reload
# 3. Connect to backend on port 5002
```

### Development Commands

#### Frontend Commands
```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

#### Backend Commands
```bash
# Development build
cargo build

# Release build
cargo build --release

# Run tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Check code
cargo check

# Format code
cargo fmt

# Clippy linting
cargo clippy
```

#### Electron Commands
```bash
# Development mode
npm run electron-dev

# Build and package
npm run electron-pack

# Build for specific platform
npm run dist:mac
npm run dist:win
npm run dist:linux

# Build for all platforms
npm run dist
```

## 🧪 Testing Strategy

### Frontend Testing

#### Unit Tests (Jest + React Testing Library)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=App.test.tsx
```

**Test File Structure**:
```
src/
├── components/
│   ├── __tests__/
│   │   ├── App.test.tsx
│   │   ├── Dashboard.test.tsx
│   │   └── Playground.test.tsx
│   ├── App.tsx
│   ├── Dashboard.tsx
│   └── Playground.tsx
```

**Example Test**:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component', () => {
  test('renders main application', () => {
    render(<App />);
    expect(screen.getByText(/Unified Data Studio/i)).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(screen.getByText(/button clicked/i)).toBeInTheDocument();
  });
});
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Backend Testing

#### Unit Tests
```bash
# Run all tests
cargo test

# Run specific test
cargo test test_formula_evaluation

# Run tests with output
cargo test -- --nocapture
```

**Test File Structure**:
```
src/
├── lib.rs
├── main.rs
└── tests/
    ├── common/
    │   └── mod.rs
    ├── integration_tests.rs
    └── unit_tests.rs
```

**Example Test**:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_formula_evaluation() {
        let formula = "2 + 2 * 3";
        let result = evaluate_formula(formula, &HashMap::new());
        assert_eq!(result, Ok(Value::Number(8.0)));
    }

    #[tokio::test]
    async fn test_workflow_execution() {
        let workflow = create_test_workflow();
        let result = execute_workflow(workflow, &test_data).await;
        assert!(result.is_ok());
    }
}
```

#### API Testing
```bash
# Run API tests
cargo test --test api_tests

# Run with specific endpoint
cargo test --test api_tests test_health_endpoint
```

## 🔍 Debugging

### Frontend Debugging

#### React Developer Tools
1. Install React Developer Tools browser extension
2. Open browser DevTools
3. Navigate to React tab
4. Inspect component hierarchy and state

#### Console Logging
```typescript
// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { data, state });
  console.trace('Function call stack');
}

// Error logging
console.error('Error occurred:', error);
console.error('Error stack:', error.stack);
```

#### Debug Mode
```bash
# Start with debug logging
DEBUG=* npm start

# Start with specific debug namespace
DEBUG=uds:*,electron:* npm start
```

### Backend Debugging

#### Logging Configuration
```rust
// Set log level
env::set_var("RUST_LOG", "debug");

// Structured logging
info!(
    "Processing request",
    endpoint = %req.uri(),
    method = %req.method(),
    user_agent = %req.headers().get("user-agent").unwrap_or(&HeaderValue::from_static("unknown"))
);
```

#### Debug Mode
```bash
# Run with debug logging
RUST_LOG=debug cargo run

# Run with trace logging
RUST_LOG=trace cargo run

# Run specific module logging
RUST_LOG=uds::api=debug,uds::workflow=trace cargo run
```

### Electron Debugging

#### Main Process Debugging
```javascript
// In electron.js
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
  
  // Enable remote debugging
  require('electron').app.commandLine.appendSwitch('remote-debugging-port', '9222');
}
```

#### Renderer Process Debugging
```javascript
// In preload.js
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode enabled');
  console.log('Electron version:', process.versions.electron);
  console.log('Node version:', process.versions.node);
}
```

## 📦 Building and Packaging

### Frontend Build

#### Development Build
```bash
npm run build

# Build output:
# - build/static/js/main.[hash].js
# - build/static/css/main.[hash].css
# - build/index.html
```

#### Production Build
```bash
# Set production environment
NODE_ENV=production npm run build

# Optimized build with:
# - Code splitting
# - Tree shaking
# - Minification
# - Source maps disabled
```

### Backend Build

#### Development Build
```bash
cargo build

# Output: target/debug/uds-backend
```

#### Release Build
```bash
cargo build --release

# Output: target/release/uds-backend
# Optimized for performance
```

### Electron Packaging

#### macOS
```bash
# Build DMG for macOS
npm run dist:mac

# Output: dist/Unified Data Studio-[version].dmg
# Output: dist/Unified Data Studio-[version]-arm64.dmg
```

#### Windows
```bash
# Build installer for Windows
npm run dist:win

# Output: dist/Unified Data Studio Setup [version].exe
```

#### Linux
```bash
# Build AppImage for Linux
npm run dist:linux

# Output: dist/Unified Data Studio-[version].AppImage
```

#### Cross-Platform
```bash
# Build for all platforms
npm run dist

# Output: Multiple platform-specific packages
```

## 🚀 Deployment

### Development Deployment

#### Local Testing
```bash
# Build and test locally
npm run build
npx electron-builder --dir

# Test the built application
open "dist/mac-arm64/Unified Data Studio.app"
```

#### Staging Environment
```bash
# Deploy to staging
npm run deploy:staging

# This will:
# 1. Build the application
# 2. Package for target platform
# 3. Upload to staging server
# 4. Run automated tests
```

### Production Deployment

#### Release Process
```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Build for production
npm run build:prod

# 3. Package application
npm run dist:prod

# 4. Run tests
npm run test:prod

# 5. Create release
npm run release
```

#### Release Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Version updated
- [ ] Changelog updated
- [ ] Build successful
- [ ] Package created
- [ ] Release notes written
- [ ] Release published

### CI/CD Pipeline

#### GitHub Actions
```yaml
name: Build and Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-rust@v1
        with:
          rust-version: '1.70'
      - run: npm ci
      - run: npm test
      - run: cargo test

  build:
    needs: test
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run dist:${{ matrix.os }}
```

## 🔧 Configuration Management

### Environment Configuration

#### Development
```bash
# .env.development
REACT_APP_API_URL=http://localhost:5002
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

#### Staging
```bash
# .env.staging
REACT_APP_API_URL=https://staging-api.uds.com
REACT_APP_ENVIRONMENT=staging
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=info
```

#### Production
```bash
# .env.production
REACT_APP_API_URL=https://api.uds.com
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=warn
```

### Build Configuration

#### Webpack Configuration
```javascript
// webpack.config.js
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV === 'production' ? false : 'eval-source-map',
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

#### Electron Builder Configuration
```json
{
  "build": {
    "appId": "com.unifieddatastudio.app",
    "productName": "Unified Data Studio",
    "directories": {
      "output": "dist",
      "buildResources": "build"
    },
    "files": [
      "build/**/*",
      "node_modules/**/*",
      "public/backend/**/*"
    ],
    "extraResources": [
      {
        "from": "public/backend",
        "to": "app/backend"
      },
      {
        "from": "build",
        "to": "app/build"
      }
    ]
  }
}
```

## 📚 Documentation Standards

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Calculates the total data volume for all imported files
 * @param files - Array of file data objects
 * @returns Total size in bytes
 * @example
 * const totalSize = getTotalDataVolume(importedFiles);
 * console.log(`Total size: ${formatDataVolume(totalSize)}`);
 */
function getTotalDataVolume(files: FileData[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}
```

#### TypeScript Interfaces
```typescript
/**
 * Represents a data processing workflow
 */
interface Workflow {
  /** Unique identifier for the workflow */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Optional description */
  description?: string;
  
  /** Ordered list of processing steps */
  steps: WorkflowStep[];
  
  /** Creation timestamp */
  created: Date;
  
  /** Last modification timestamp */
  lastModified: Date;
}
```

### API Documentation

#### OpenAPI/Swagger
```yaml
openapi: 3.0.0
info:
  title: Unified Data Studio API
  version: 1.0.8
  description: Data processing and workflow management API

paths:
  /api/projects:
    get:
      summary: Retrieve all projects
      responses:
        '200':
          description: List of projects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'
```

## 🧮 Formula Engine Development

### Overview
The Formula Engine is a modular system that allows for dynamic formula registration, execution, and code management. It consists of frontend configuration interfaces and backend Rust executors.

### Architecture
```
Frontend (React)          Backend (Rust)
┌─────────────────┐       ┌─────────────────┐
│ Formula Config  │ ◄────► │ Dynamic Engine  │
│ - Status Display│       │ - Registration  │
│ - Code Editor   │       │ - Execution     │
│ - Template Gen  │       │ - Validation    │
└─────────────────┘       └─────────────────┘
┌─────────────────┐       ┌─────────────────┐
│ Playground      │ ◄────► │ Code Manager    │
│ - Parameter UI  │       │ - Storage       │
│ - Live Preview  │       │ - Compilation   │
│ - Result Display│       │ - Testing       │
└─────────────────┘       └─────────────────┘
```

### Adding a New Formula

#### 1. Backend Implementation
Create a new executor in `backend/src/formula_executor_generator.rs`:

```rust
fn generate_my_formula_executor() -> String {
    r#"use anyhow::{Result, anyhow};
use serde_json::Value;
use std::collections::HashMap;

pub struct MyFormulaExecutor;

impl FormulaExecutor for MyFormulaExecutor {
    fn execute(&self, data: &[HashMap<String, Value>], parameters: &HashMap<String, Value>) -> Result<Vec<HashMap<String, Value>>> {
        // Your implementation here
        Ok(data.to_vec())
    }

    fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
        // Parameter validation
        Ok(())
    }

    fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
        vec!["my_formula_result".to_string()]
    }
}"#.to_string()
}
```

#### 2. Frontend Configuration
Add formula definition in `frontend/src/utils/formulaService.ts`:

```typescript
{
  name: 'MY_FORMULA',
  category: 'Custom',
  description: 'My custom formula',
  syntax: 'MY_FORMULA [param1 -> param2]',
  parameters: [
    { name: 'param1', type: 'column', description: 'First parameter', required: true },
    { name: 'param2', type: 'text', description: 'Second parameter', required: true }
  ],
  examples: ['MY_FORMULA [Column1 -> "value"]']
}
```

#### 3. Register Formula
Add to the generator's `generate_specific_executor` method:

```rust
"MY_FORMULA" => Ok(Self::generate_my_formula_executor()),
```

### Testing Formula Code

#### 1. Using the Code Editor
1. Navigate to Formula Configuration page
2. Select your formula
3. Click "Show Code Editor"
4. Click "Generate Template" to get starter code
5. Edit the code as needed
6. Click "Test Code" to validate compilation
7. Click "Save Code" to make it available

#### 2. Manual Testing
```bash
# Test compilation
cd backend
cargo check

# Test specific formula
curl -X POST "http://localhost:5002/api/formulas/MY_FORMULA/test" \
  -H "Content-Type: application/json" \
  -d '{"code": "your_rust_code_here"}'
```

### Formula Development Best Practices

#### 1. Parameter Validation
Always validate required parameters:
```rust
fn validate_parameters(&self, parameters: &HashMap<String, Value>) -> Result<()> {
    if !parameters.contains_key("required_param") {
        return Err(anyhow!("Missing required parameter: required_param"));
    }
    Ok(())
}
```

#### 2. Error Handling
Provide clear error messages:
```rust
let value = parameters.get("param")
    .and_then(|v| v.as_str())
    .ok_or_else(|| anyhow!("Missing or invalid parameter: param"))?;
```

#### 3. Output Column Naming
Use consistent naming conventions:
```rust
fn get_output_columns(&self, _parameters: &HashMap<String, Value>) -> Vec<String> {
    vec!["formula_name_result".to_string()]
}
```

#### 4. Data Processing
Handle different data types gracefully:
```rust
let result = value.as_str()
    .map(|s| s.to_uppercase())
    .unwrap_or_else(|| value.to_string().to_uppercase());
```

### Debugging Formula Issues

#### 1. Compilation Errors
- Check syntax in the code editor
- Use "Test Code" button for detailed error messages
- Ensure all required imports are present

#### 2. Runtime Errors
- Check parameter validation logic
- Verify data type handling
- Review error messages in backend logs

#### 3. Output Issues
- Verify `get_output_columns` implementation
- Check output column naming consistency
- Ensure data is properly added to result

### Formula Engine API Testing

#### 1. List Formulas
```bash
curl -X GET "http://localhost:5002/api/formulas/config"
```

#### 2. Execute Formula
```bash
curl -X POST "http://localhost:5002/api/formulas/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "formula_name": "TEXT_JOIN",
    "data": [{"col1": "value1", "col2": "value2"}],
    "parameters": {"delimiter": ", ", "text_values": ["col1", "col2"]}
  }'
```

#### 3. Generate Template
```bash
curl -X GET "http://localhost:5002/api/formulas/MY_FORMULA/generate"
```

### Performance Considerations

#### 1. Memory Usage
- Minimize data copying in executors
- Use efficient data structures
- Handle large datasets appropriately

#### 2. Processing Speed
- Optimize hot paths in formula logic
- Use appropriate algorithms for data processing
- Consider parallel processing for large datasets

#### 3. Error Recovery
- Implement graceful error handling
- Provide meaningful error messages
- Log errors for debugging

## 🐛 Troubleshooting

### Common Issues

#### Frontend Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check Node.js version
node --version  # Should be 18.20.8+

# Check npm version
npm --version   # Should be 10.8.2+
```

#### Backend Build Failures
```bash
# Update Rust toolchain
rustup update

# Clean and rebuild
cargo clean
cargo build

# Check Rust version
rustc --version  # Should be 1.70.0+
```

#### Electron Issues
```bash
# Rebuild native modules
npm run electron-rebuild

# Clear Electron cache
rm -rf ~/Library/Application\ Support/Unified\ Data\ Studio
rm -rf ~/.config/Unified\ Data\ Studio
```

### Performance Issues

#### Frontend Performance
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
npm run test:memory

# Performance profiling
npm run profile
```

#### Backend Performance
```bash
# Profile with flamegraph
cargo install flamegraph
cargo flamegraph

# Memory profiling
cargo install heim
cargo run --bin memory-profiler
```

## 🔮 Future Development

### Planned Features
- **Real-time Collaboration**: Multi-user editing and sharing
- **Cloud Integration**: AWS, Azure, and GCP connectors
- **Machine Learning**: TensorFlow.js integration
- **Advanced Analytics**: Statistical analysis and visualization
- **Plugin System**: Extensible architecture

### Development Roadmap
- **Q1 2024**: UI rendering fixes and stability improvements
- **Q2 2024**: Advanced data visualization and ML integration
- **Q3 2024**: Cloud integration and collaborative features
- **Q4 2024**: Enterprise features and performance optimization

---

*This development guide is maintained by the Unified Data Studio development team and should be updated with each major release.*
