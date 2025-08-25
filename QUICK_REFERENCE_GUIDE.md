# Quick Reference Guide
## Essential Commands & Tasks for Data Studio Development

**Version:** 1.0  
**Last Updated:** December 2024  
**Maintainer:** Development Team  
**Status:** Active

---

## Table of Contents

1. [Git Commands](#git-commands)
2. [Development Commands](#development-commands)
3. [Build Commands](#build-commands)
4. [Testing Commands](#testing-commands)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting Commands](#troubleshooting-commands)
7. [Useful Shortcuts](#useful-shortcuts)
8. [Environment Setup](#environment-setup)

---

## Git Commands

### Basic Git Operations

```bash
# Initialize repository
git init

# Clone repository
git clone <repository-url>

# Check status
git status

# Add files
git add .                    # Add all files
git add <filename>           # Add specific file

# Commit changes
git commit -m "message"      # Commit with message
git commit -am "message"     # Add and commit tracked files

# Push changes
git push origin <branch>     # Push to specific branch
git push origin main         # Push to main branch

# Pull changes
git pull origin <branch>     # Pull from specific branch
git pull origin main         # Pull from main branch
```

### Branch Management

```bash
# List branches
git branch                   # Local branches
git branch -r               # Remote branches
git branch -a               # All branches

# Create branch
git checkout -b <branch-name>    # Create and switch to new branch
git branch <branch-name>         # Create branch only

# Switch branches
git checkout <branch-name>       # Switch to branch
git switch <branch-name>         # Modern way to switch

# Delete branch
git branch -d <branch-name>      # Delete local branch
git push origin --delete <branch-name>  # Delete remote branch

# Merge branch
git merge <branch-name>          # Merge branch into current
git merge --no-ff <branch-name> # Merge with no fast-forward
```

### Stashing & Resetting

```bash
# Stash changes
git stash                     # Stash current changes
git stash pop                 # Apply and remove stash
git stash list                # List stashes
git stash apply <stash-id>    # Apply specific stash

# Reset changes
git reset --hard HEAD         # Reset to last commit
git reset --soft HEAD~1       # Reset commit but keep changes
git reset <commit-hash>       # Reset to specific commit

# Revert changes
git revert <commit-hash>      # Create new commit that undoes changes
```

### Tag Management

```bash
# Create tag
git tag v1.0.0               # Create lightweight tag
git tag -a v1.0.0 -m "Release v1.0.0"  # Create annotated tag

# List tags
git tag                       # List all tags
git tag -l "v1.*"            # List tags matching pattern

# Push tags
git push origin v1.0.0       # Push specific tag
git push origin --tags        # Push all tags

# Delete tag
git tag -d v1.0.0            # Delete local tag
git push origin --delete v1.0.0  # Delete remote tag
```

---

## Development Commands

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install                   # Install all dependencies
npm install <package>         # Install specific package
npm install --save-dev <package>  # Install dev dependency

# Development server
npm start                     # Start development server
npm run dev                   # Alternative dev command

# Build application
npm run build                # Build for production
npm run build:dev            # Build for development

# Linting and formatting
npm run lint                 # Run ESLint
npm run lint:fix             # Fix linting issues
npm run format               # Format code with Prettier

# Type checking
npm run type-check           # Run TypeScript compiler
npm run type-check:watch     # Watch mode for type checking
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
cargo build                  # Build project
cargo build --release        # Build optimized release version

# Run application
cargo run                    # Run in debug mode
cargo run --release          # Run optimized version

# Check code
cargo check                  # Check without building
cargo clippy                 # Run Clippy linter
cargo fmt                    # Format code with rustfmt

# Run tests
cargo test                   # Run all tests
cargo test --release         # Run tests in release mode
cargo test <test-name>       # Run specific test

# Clean build artifacts
cargo clean                  # Remove build artifacts
```

### Python Scripts

```bash
# Navigate to project root
cd unified-data-studio-v2

# Install Python dependencies
pip install -r requirements.txt

# Run Python scripts
python build_complete_package.py    # Build complete package
python -m pytest tests/             # Run tests
python -m flake8 .                  # Run linting
python -m black .                   # Format code
```

---

## Build Commands

### Complete Package Build

```bash
# Navigate to project root
cd unified-data-studio-v2

# Build complete package (all platforms)
python build_complete_package.py

# Build specific platform
python build_complete_package.py --platform linux
python build_complete_package.py --platform windows
python build_complete_package.py --platform macos
```

### Electron Build

```bash
# Navigate to frontend directory
cd frontend

# Build Electron app
npm run dist                 # Build for current platform
npm run dist:mac            # Build for macOS
npm run dist:win            # Build for Windows
npm run dist:linux          # Build for Linux

# Build with specific configuration
npx electron-builder --mac --win --linux --publish=never
```

### Backend Build

```bash
# Navigate to backend directory
cd backend

# Build Rust backend
cargo build --release

# Build for specific target
cargo build --release --target x86_64-unknown-linux-gnu
cargo build --release --target x86_64-pc-windows-gnu
cargo build --release --target x86_64-apple-darwin
```

---

## Testing Commands

### Frontend Testing

```bash
# Navigate to frontend directory
cd frontend

# Run tests
npm test                     # Run all tests
npm test --watch            # Run tests in watch mode
npm test --coverage         # Run tests with coverage

# Run specific tests
npm test -- --testNamePattern="UserProfile"
npm test -- --testPathPattern="components"

# Run E2E tests
npm run test:e2e            # Run end-to-end tests
npm run test:e2e:headless   # Run E2E tests headless
```

### Backend Testing

```bash
# Navigate to backend directory
cd backend

# Run tests
cargo test                  # Run all tests
cargo test --release        # Run tests in release mode

# Run specific tests
cargo test test_name        # Run test with specific name
cargo test --test test_name # Alternative way to run specific test

# Run tests with output
cargo test -- --nocapture   # Show output from tests
cargo test -- --test-threads=1  # Run tests sequentially
```

### Integration Testing

```bash
# Navigate to project root
cd unified-data-studio-v2

# Run integration tests
python -m pytest tests/integration/  # Run integration tests
python -m pytest tests/ --verbose    # Run all tests with verbose output
```

---

## Common Tasks

### Starting Development Environment

```bash
# 1. Clone repository
git clone <repository-url>
cd unified-data-studio-v2

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Install backend dependencies
cd ../backend
cargo build

# 4. Start frontend development server
cd ../frontend
npm start

# 5. Start backend server (in new terminal)
cd ../backend
cargo run
```

### Creating New Feature

```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/new-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat: add new feature description"

# 4. Push feature branch
git push origin feature/new-feature-name

# 5. Create pull request on GitHub
# (Go to GitHub and create PR from feature branch to develop)
```

### Fixing Bug

```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create bugfix branch
git checkout -b bugfix/bug-description

# 3. Fix the bug and commit
git add .
git commit -m "fix: resolve bug description"

# 4. Push bugfix branch
git push origin bugfix/bug-description

# 5. Create pull request on GitHub
```

### Creating Release

```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create release branch
git checkout -b release/v1.1.0

# 3. Final testing and bug fixes
# (Make any necessary changes)

# 4. Merge to main
git checkout main
git merge release/v1.1.0

# 5. Create tag
git tag v1.1.0
git push origin main --tags

# 6. Merge back to develop
git checkout develop
git merge release/v1.1.0
git push origin develop

# 7. Delete release branch
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

---

## Troubleshooting Commands

### Common Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cargo cache
cargo clean

# Update dependencies
npm update                   # Update npm packages
cargo update                 # Update Rust dependencies

# Check for outdated packages
npm outdated                 # Check outdated npm packages
cargo outdated               # Check outdated Rust packages
```

### Debug Commands

```bash
# Check Node.js version
node --version
npm --version

# Check Rust version
rustc --version
cargo --version

# Check Python version
python --version
pip --version

# Check Git version
git --version

# Check system information
uname -a                     # Linux/macOS
systeminfo                   # Windows
```

### Log Commands

```bash
# View Git log
git log                      # View commit history
git log --oneline            # Compact view
git log --graph              # Graph view
git log -p                   # With patches

# View recent commits
git log -5                   # Last 5 commits
git log --since="2 days ago" # Commits since date

# Search commits
git log --grep="fix"         # Commits with "fix" in message
git log -S "function_name"   # Commits that add/remove text
```

---

## Useful Shortcuts

### Git Aliases

```bash
# Add these to your ~/.gitconfig

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
```

### Shell Aliases

```bash
# Add these to your ~/.bashrc or ~/.zshrc

# Navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Git shortcuts
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'
alias gco='git checkout'
alias gb='git branch'

# Development shortcuts
alias nr='npm run'
alias nrd='npm run dev'
alias nrb='npm run build'
alias nrt='npm test'
```

### VS Code Shortcuts

```
Ctrl+Shift+P (Cmd+Shift+P on Mac)  # Command palette
Ctrl+P (Cmd+P on Mac)              # Quick open
Ctrl+Shift+F (Cmd+Shift+F on Mac)  # Search in files
Ctrl+F (Cmd+F on Mac)              # Find in file
Ctrl+H (Cmd+H on Mac)              # Replace in file
Ctrl+/ (Cmd+/ on Mac)              # Toggle comment
Ctrl+D (Cmd+D on Mac)              # Select next occurrence
Ctrl+U (Cmd+U on Mac)              # Undo last selection
F12                                # Go to definition
Shift+F12                          # Go to references
Ctrl+Shift+O (Cmd+Shift+O on Mac) # Go to symbol in file
```

---

## Environment Setup

### Required Tools

```bash
# Node.js (v18 or higher)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Python (3.8 or higher)
# Install from python.org or use package manager

# Git
# Install from git-scm.com or use package manager
```

### Environment Variables

```bash
# Frontend (.env file in frontend directory)
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Backend (.env file in backend directory)
DATABASE_URL=postgresql://user:password@localhost/database
RUST_LOG=info
RUST_BACKTRACE=1

# Python (.env file in project root)
PYTHONPATH=.
PYTHONIOENCODING=utf-8
```

### IDE Configuration

```bash
# VS Code Extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension rust-lang.rust-analyzer
code --install-extension ms-python.python
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint

# VS Code Settings
# Add to .vscode/settings.json
{
    "typescript.preferences.importModuleSpecifier": "relative",
    "rust-analyzer.checkOnSave.command": "clippy",
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true
}
```

---

## Quick Reference Tables

### Common File Extensions

| Extension | Purpose | Language |
|-----------|---------|----------|
| `.tsx` | React components | TypeScript |
| `.ts` | TypeScript files | TypeScript |
| `.js` | JavaScript files | JavaScript |
| `.rs` | Rust source files | Rust |
| `.py` | Python files | Python |
| `.md` | Documentation | Markdown |
| `.yml` | Configuration | YAML |
| `.json` | Configuration | JSON |

### Common Commands Summary

| Task | Command |
|------|---------|
| Start development | `npm start` (frontend) + `cargo run` (backend) |
| Build project | `npm run build` (frontend) + `cargo build` (backend) |
| Run tests | `npm test` (frontend) + `cargo test` (backend) |
| Create feature | `git checkout -b feature/name` |
| Fix bug | `git checkout -b bugfix/description` |
| Create release | `git checkout -b release/v1.0.0` |
| Update dependencies | `npm update` + `cargo update` |

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/user-authentication` |
| Bugfix | `bugfix/description` | `bugfix/ui-rendering-issue` |
| Hotfix | `hotfix/description` | `hotfix/security-vulnerability` |
| Release | `release/version` | `release/v1.1.0` |

---

## Conclusion

This quick reference guide provides the essential commands and tasks for daily development work. Keep it handy for quick access to common operations.

For detailed information, refer to the full documentation:
- [GitHub Actions Build Rules](GITHUB_ACTIONS_BUILD_RULES.md)
- [GitHub Best Practices Guide](GITHUB_BEST_PRACTICES_GUIDE.md)
- [Development Rules & Standards](DEVELOPMENT_RULES.md)

---

**Last Updated:** December 2024  
**Next Review:** January 2025  
**Maintainer:** Development Team
