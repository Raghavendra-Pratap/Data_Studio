# GitHub Actions Build Rules
## The "Never Fail Again" Guide for Data Studio

**Version:** 1.0  
**Last Updated:** December 2024  
**Maintainer:** Development Team  
**Status:** Active

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure & Path Rules](#file-structure--path-rules)
3. [Dependencies & Requirements Rules](#dependencies--requirements-rules)
4. [Platform-Specific Build Rules](#platform-specific-build-rules)
5. [Shell & Command Rules](#shell--command-rules)
6. [Electron Build Rules](#electron-build-rules)
7. [File Encoding & Unicode Rules](#file-encoding--unicode-rules)
8. [Artifact & Asset Rules](#artifact--asset-rules)
9. [Permission & Security Rules](#permission--security-rules)
10. [Version & Release Rules](#version--release-rules)
11. [Testing & Validation Rules](#testing--validation-rules)
12. [Pre-Push Checklist](#pre-push-checklist)
13. [Emergency Recovery Procedures](#emergency-recovery-procedures)
14. [Pro Tips & Best Practices](#pro-tips--best-practices)
15. [Troubleshooting Guide](#troubleshooting-guide)
16. [References & Resources](#references--resources)

---

## Overview

This document outlines the essential rules and best practices for maintaining successful GitHub Actions builds in the Data Studio project. These rules are derived from real-world failures and their solutions, ensuring that future builds are robust and reliable.

### Key Principles

- **Local Testing First**: Always test locally before pushing
- **Platform Isolation**: Build each platform on its native runner
- **File Verification**: Ensure all referenced files exist
- **Incremental Fixes**: One change at a time, test thoroughly
- **Documentation**: Document every fix for future reference

---

## File Structure & Path Rules

### ✅ DO

- Keep all project files in the repository root
- Use relative paths in workflows: `frontend/`, `backend/`, `requirements.txt`
- Ensure `requirements.txt` exists in the repository root
- Verify all referenced files exist before pushing
- Use consistent path structure across all workflows

### ❌ DON'T

- Reference files outside the repository scope
- Use absolute paths in workflows
- Assume files exist without checking
- Push incomplete project structures
- Mix path conventions

### Examples

```yaml
# ✅ Correct
- name: Build Frontend
  run: npm run build
  working-directory: frontend/

# ❌ Incorrect
- name: Build Frontend
  run: npm run build
  working-directory: /home/user/project/frontend/
```

---

## Dependencies & Requirements Rules

### ✅ DO

- Include `requirements.txt` with exact versions: `requests>=2.28.0`
- Lock dependency versions: `package-lock.json`, `Cargo.lock`
- Test `npm install` and `cargo build` locally before pushing
- Use `--frozen-lockfile` for npm in CI
- Pin dependency versions for consistency

### ❌ DON'T

- Use `requirements.txt` from parent directories
- Leave dependency files unlocked
- Push without testing local builds
- Use `latest` versions in production
- Ignore lock file conflicts

### Examples

```txt
# ✅ Correct - requirements.txt
requests>=2.28.0
pathlib2>=2.3.7
numpy>=1.21.0

# ❌ Incorrect
requests
pathlib2
numpy
```

---

## Platform-Specific Build Rules

### ✅ DO

- Use matrix strategy for cross-platform builds
- Build each platform on its native runner
- Use `if` conditions for platform-specific commands
- Handle platform differences in build scripts
- Test platform-specific logic locally

### ❌ DON'T

- Build Windows packages on Linux runners
- Use cross-platform build commands
- Assume all platforms behave the same
- Mix platform-specific and universal commands
- Skip platform-specific testing

### Examples

```yaml
# ✅ Correct - Matrix Strategy
jobs:
  build-packages:
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - name: Build for ${{ matrix.platform }}
        if: matrix.platform == 'ubuntu-latest'
        run: npx electron-builder --linux

# ❌ Incorrect - Single Platform Build
jobs:
  build-all:
    runs-on: ubuntu-latest
    steps:
      - name: Build All Platforms
        run: npx electron-builder --mac --win --linux
```

---

## Shell & Command Rules

### ✅ DO

- Use `shell: bash` for complex commands
- Use universal Bash commands: `find`, `ls`, `echo`
- Test commands on all platforms locally
- Use `|| echo "fallback"` for error handling
- Keep commands simple and portable

### ❌ DON'T

- Use PowerShell-specific commands on Windows
- Mix `dir` and `ls` commands
- Use platform-specific syntax without fallbacks
- Assume shell compatibility across platforms
- Use complex shell scripting without testing

### Examples

```yaml
# ✅ Correct
- name: List Files
  shell: bash
  run: |
    find . -name "*.txt" -type f
    ls -la frontend/
    echo "Files listed successfully"

# ❌ Incorrect
- name: List Files
  run: |
    if [ "$RUNNER_OS" == "Windows" ]; then
      dir frontend\
    else
      ls -la frontend/
    fi
```

---

## Electron Build Rules

### ✅ DO

- Build platforms separately: `--win`, `--linux`, `--mac`
- Use `--publish=never` for local builds
- Ensure icon files exist before building
- Test `npm run dist` locally first
- Use platform-specific build commands

### ❌ DON'T

- Build all platforms simultaneously
- Reference missing icon files
- Use unpublished electron-builder actions
- Skip local testing
- Mix build strategies

### Examples

```yaml
# ✅ Correct
- name: Build Electron App
  shell: bash
  run: |
    if [ "$RUNNER_OS" == "Windows" ]; then
      npx electron-builder --win --publish=never
    elif [ "$RUNNER_OS" == "macOS" ]; then
      npx electron-builder --mac --publish=never
    else
      npx electron-builder --linux --publish=never
    fi

# ❌ Incorrect
- name: Build Electron App
  run: npx electron-builder --mac --win --linux --publish=never
```

---

## File Encoding & Unicode Rules

### ✅ DO

- Use `encoding='utf-8'` for all file operations
- Handle Windows encoding with `chcp 65001`
- Use `safe_print` functions for emoji fallbacks
- Set `PYTHONIOENCODING=utf-8`
- Test file operations on all platforms

### ❌ DON'T

- Assume default encoding works on all platforms
- Ignore Unicode errors
- Use emojis without fallbacks
- Skip encoding specifications
- Mix encoding strategies

### Examples

```python
# ✅ Correct - Python File Operations
import codecs
import os
import sys

# Windows encoding fix
if os.name == 'nt':
    os.system('chcp 65001 > nul 2>&1')
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    os.environ['PYTHONIOENCODING'] = 'utf-8'

# Safe print function
def safe_print(text):
    try:
        print(text)
    except UnicodeEncodeError:
        # Fallback for problematic characters
        print(text.encode('ascii', 'replace').decode())

# File operations with encoding
with open('README.md', 'w', encoding='utf-8') as f:
    f.write(content)
```

---

## Artifact & Asset Rules

### ✅ DO

- Use `actions/upload-artifact` for job-to-job transfer
- Use `actions/download-artifact` to receive artifacts
- Upload individual platform packages separately
- Verify artifact paths before upload
- Use descriptive artifact names

### ❌ DON'T

- Try to upload directories directly
- Use incorrect artifact names
- Skip artifact verification
- Mix artifact and release asset uploads
- Assume artifact paths are correct

### Examples

```yaml
# ✅ Correct - Artifact Upload
- name: Upload Ubuntu Packages
  uses: actions/upload-artifact@v4
  with:
    path: frontend/dist/
    name: ubuntu-packages

# ✅ Correct - Artifact Download
- name: Download All Artifacts
  uses: actions/download-artifact@v4
  with:
    path: artifacts/

# ❌ Incorrect - Direct Directory Upload
- name: Upload Release Assets
  uses: actions/upload-release-asset@v1
  with:
    asset_path: artifacts/  # This will fail
```

---

## Permission & Security Rules

### ✅ DO

- Explicitly set `permissions: contents: write packages: write`
- Use `secrets.GITHUB_TOKEN` for authentication
- Limit permissions to minimum required
- Test permissions locally when possible
- Document permission requirements

### ❌ DON'T

- Assume default permissions are sufficient
- Use personal access tokens unnecessarily
- Grant excessive permissions
- Skip permission verification
- Ignore permission errors

### Examples

```yaml
# ✅ Correct
jobs:
  create-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
    steps:
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

# ❌ Incorrect
jobs:
  create-release:
    runs-on: ubuntu-latest
    # Missing permissions will cause failures
    steps:
      - name: Create Release
        uses: actions/create-release@v1
```

---

## Version & Release Rules

### ✅ DO

- Use semantic versioning: `v1.0.0`, `v1.1.0`
- Tag releases before pushing to main
- Test version increments locally
- Document version changes
- Use consistent versioning strategy

### ❌ DON'T

- Increment versions on main branch for testing
- Use non-semantic versioning
- Skip version testing
- Mix development and release versions
- Ignore version conflicts

### Examples

```bash
# ✅ Correct - Version Management
git checkout main
git pull origin main
npm version patch  # Increments 1.0.0 to 1.0.1
git tag v1.0.1
git push origin main --tags

# ❌ Incorrect - Version on Main
git checkout main
npm version patch  # Don't do this on main branch
git push origin main
```

---

## Testing & Validation Rules

### ✅ DO

- Test workflows locally with `act` tool
- Validate YAML syntax before pushing
- Test all matrix combinations locally
- Use `--dry-run` for destructive operations
- Test platform-specific logic

### ❌ DON'T

- Push untested workflows
- Skip YAML validation
- Assume matrix combinations work
- Test production workflows on main branch
- Ignore validation errors

### Examples

```bash
# ✅ Correct - Local Testing
# Install act tool
brew install act

# Test workflow locally
act push -W .github/workflows/release.yml

# Validate YAML
yamllint .github/workflows/release.yml
```

---

## Pre-Push Checklist

### Before Every Push

- [ ] Local build test: `npm run dist`
- [ ] Local dependency test: `npm install`
- [ ] Workflow syntax validation
- [ ] File existence verification
- [ ] Path reference checking
- [ ] Platform-specific testing
- [ ] Artifact path verification
- [ ] Permission verification

### Before Every Release

- [ ] Tag creation and verification
- [ ] Local release workflow test
- [ ] Asset path verification
- [ ] Cross-platform build test
- [ ] Artifact transfer test
- [ ] Release creation test

---

## Emergency Recovery Procedures

### When Builds Fail

1. **Check logs immediately** - Don't guess the issue
2. **Verify file paths** - Most common failure point
3. **Test locally first** - Don't push fixes without testing
4. **Use incremental fixes** - One change at a time
5. **Document the fix** - For future reference

### When Credits Run Low

1. **Disable workflows** - Rename `.yml` to `.yml.disabled`
2. **Use local builds** - `npm run dist` on your machine
3. **Manual releases** - Create GitHub releases manually
4. **Plan releases** - Batch multiple changes together

### Recovery Commands

```bash
# Disable workflow
mv .github/workflows/release.yml .github/workflows/release.yml.disabled

# Re-enable workflow
mv .github/workflows/release.yml.disabled .github/workflows/release.yml

# Force push (use with caution)
git push --force origin main

# Delete problematic tag
git tag -d v1.0.18
git push origin :refs/tags/v1.0.18
```

---

## Pro Tips & Best Practices

### Development Workflow

1. **Use GitHub CLI** to test workflows locally
2. **Set up branch protection** to prevent broken pushes
3. **Use status checks** to validate before merge
4. **Monitor credit usage** in GitHub settings
5. **Keep workflow files simple** - Complex workflows fail more often

### Performance Optimization

1. **Cache dependencies** to speed up builds
2. **Use matrix builds** for parallel execution
3. **Optimize artifact sizes** to reduce transfer time
4. **Use conditional steps** to skip unnecessary work
5. **Monitor build times** and optimize slow steps

### Security Best Practices

1. **Use minimal permissions** for each job
2. **Scan for vulnerabilities** in dependencies
3. **Use secrets management** for sensitive data
4. **Regular security updates** for actions and tools
5. **Audit workflow permissions** regularly

---

## Troubleshooting Guide

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `No such file or directory` | Missing file or wrong path | Verify file exists and path is correct |
| `Resource not accessible by integration` | Insufficient permissions | Add required permissions to workflow |
| `Cannot find module` | Missing dependency | Check package.json and lock files |
| `UnicodeEncodeError` | Encoding issues on Windows | Use UTF-8 encoding and safe_print |
| `EISDIR: illegal operation on a directory` | Trying to upload directory | Upload individual files or create archive |

### Debug Steps

1. **Enable debug logging** in workflow
2. **Add echo statements** to verify paths
3. **Check file structure** in artifacts
4. **Verify permissions** and tokens
5. **Test commands locally** first

### Debug Workflow Example

```yaml
- name: Debug Information
  run: |
    echo "Current directory: $(pwd)"
    echo "Repository contents:"
    ls -la
    echo "Frontend contents:"
    ls -la frontend/ || echo "Frontend not found"
    echo "Backend contents:"
    ls -la backend/ || echo "Backend not found"
```

---

## References & Resources

### Official Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Electron Builder Documentation](https://www.electron.build/)
- [GitHub CLI Documentation](https://cli.github.com/)

### Tools & Utilities

- [Act - Local GitHub Actions Testing](https://github.com/nektos/act)
- [YAML Lint](https://yamllint.readthedocs.io/)
- [GitHub Actions VS Code Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions)

### Community Resources

- [GitHub Actions Community](https://github.com/actions/community)
- [Electron Community](https://www.electronjs.org/community)
- [GitHub Discussions](https://github.com/github/feedback/discussions)

---

## Document Maintenance

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|---------|
| 1.0 | Dec 2024 | Initial version | Development Team |

### Review Schedule

- **Monthly**: Review and update rules
- **Quarterly**: Major revision and validation
- **As needed**: Update based on new failures

### Feedback & Contributions

This document should be treated as a living document. Please:

1. **Report new failures** and their solutions
2. **Suggest improvements** to existing rules
3. **Update examples** based on new patterns
4. **Share lessons learned** from debugging sessions

---

## Conclusion

Following these rules will significantly reduce build failures and improve the reliability of your GitHub Actions workflows. Remember:

> **"An ounce of prevention is worth a pound of cure."**

Take the time to test locally, verify paths, and follow these guidelines. Your future self (and your team) will thank you!

---

**Last Updated:** December 2024  
**Next Review:** January 2025  
**Maintainer:** Development Team
