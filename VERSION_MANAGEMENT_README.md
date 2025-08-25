# Version Management System
## Unified Data Studio v2

**Version:** 2.0.0  
**Last Updated:** December 2024  
**Maintainer:** Development Team

---

## Overview

The Version Management System provides centralized control over version information across all components of Unified Data Studio v2. It ensures consistency between backend, frontend, and release artifacts.

---

## How It Works

### **1. Centralized Version File**
```
VERSION (root directory)
├── Contains: 2.0.0
├── Single source of truth
└── Updated automatically by CI/CD
```

### **2. Automated Component Updates**
When a new version is released:
1. **Git tag created**: `v2.0.1`
2. **GitHub Actions runs**: Automatically updates all components
3. **All files synced**: Backend, frontend, and version headers
4. **Build artifacts created**: With correct version information

### **3. Version Sources**
```
VERSION file → All components read from here
├── Backend: Cargo.toml
├── Frontend: version.ts (auto-generated)
├── AutoUpdater: version.ts
└── UI Display: version.ts
```

---

## File Structure

```
unified-data-studio-v2/
├── VERSION                    # Central version file
├── scripts/
│   └── version_manager.py    # Version management script
├── frontend/src/
│   └── version.ts            # Auto-generated version header
├── backend/
│   └── Cargo.toml            # Backend version
└── .github/workflows/
    └── release.yml           # Automated version updates
```

---

## Usage

### **Command Line Interface**

#### **Check Current Version:**
```bash
python3 scripts/version_manager.py info
```

#### **Update All Components:**
```bash
python3 scripts/version_manager.py update-all
```

#### **Bump Version:**
```bash
# Patch version (bug fixes)
python3 scripts/version_manager.py bump patch

# Minor version (new features)
python3 scripts/version_manager.py bump minor

# Major version (breaking changes)
python3 scripts/version_manager.py bump major
```

#### **Create Version Header:**
```bash
python3 scripts/version_manager.py create-header
```

### **Example Workflow**

```bash
# 1. Check current version
python3 scripts/version_manager.py info

# 2. Bump to new version
python3 scripts/version_manager.py bump patch

# 3. Update all components
python3 scripts/version_manager.py update-all

# 4. Verify updates
git diff

# 5. Commit and tag
git add .
git commit -m "chore: bump version to 2.0.1"
git tag v2.0.1
git push origin v2.0.1
```

---

## Automated Version Updates

### **GitHub Actions Integration**

The release workflow automatically:
1. **Extracts version** from Git tag
2. **Updates VERSION file** with new version
3. **Updates all components** using version manager
4. **Builds artifacts** with correct version
5. **Creates release** with version information

### **Workflow Steps**

```yaml
- name: Extract version from tag
  run: |
    VERSION=${GITHUB_REF#refs/tags/v}
    echo "version=$VERSION" >> $GITHUB_OUTPUT

- name: Update version in all components
  run: |
    python scripts/version_manager.py update-all
```

---

## Version Display in UI

### **1. Main Dashboard**
- Version shown at bottom of features section
- Simple text display: "Version 2.0.0"

### **2. Settings Page (VersionInfo Component)**
- Comprehensive version information
- Build date and environment
- Update checking functionality
- Direct links to GitHub releases

### **3. AutoUpdater Service**
- Reads version from centralized source
- Compares with GitHub releases
- Notifies users of updates

---

## Version Format

### **Semantic Versioning**
```
MAJOR.MINOR.PATCH
   2  .  0  .  0
```

- **MAJOR**: Breaking changes, major rewrites
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### **Examples**
```
2.0.0  → Initial release
2.0.1  → Bug fix release
2.1.0  → New feature release
3.0.0  → Major version with breaking changes
```

---

## Best Practices

### **1. Version Bumping**
- **Patch**: For bug fixes and minor improvements
- **Minor**: For new features (backward compatible)
- **Major**: For breaking changes or major rewrites

### **2. Release Process**
- Always bump version before creating tag
- Use semantic versioning consistently
- Test version updates locally before pushing

### **3. Component Updates**
- Run `update-all` after version changes
- Verify all components are updated
- Check that UI displays correct version

---

## Troubleshooting

### **Common Issues**

#### **Version Mismatch:**
```bash
# Check all component versions
python3 scripts/version_manager.py info

# Update all components
python3 scripts/version_manager.py update-all
```

#### **Missing Version Files:**
```bash
# Recreate version header
python3 scripts/version_manager.py create-header

# Check file permissions
ls -la VERSION
```

#### **Build Failures:**
```bash
# Verify version format
cat VERSION

# Check component files exist
ls -la frontend/src/version.ts
ls -la backend/Cargo.toml
```

### **Debug Commands**

```bash
# Check version file content
cat VERSION

# Verify backend version
grep "version = " backend/Cargo.toml

# Check frontend version
cat frontend/src/version.ts

# List all version-related files
find . -name "*version*" -type f
```

---

## Integration with Development

### **1. Feature Development**
- Version remains unchanged during development
- Only bump version when ready for release

### **2. Bug Fixes**
- Use patch version bump for fixes
- Update version before creating release

### **3. New Features**
- Use minor version bump for features
- Ensure backward compatibility

---

## Future Enhancements

### **Planned Features**
- **Version history tracking**
- **Automatic changelog generation**
- **Version comparison tools**
- **Rollback capabilities**

### **Integration Ideas**
- **Docker image tagging**
- **Package versioning**
- **API versioning**
- **Database schema versioning**

---

## Support

### **Getting Help**
- Check this README first
- Review version manager script
- Check GitHub Actions logs
- Contact development team

### **Contributing**
- Follow semantic versioning
- Test version updates locally
- Update documentation
- Maintain backward compatibility

---

## Conclusion

The Version Management System ensures:
- **Consistency** across all components
- **Automation** of version updates
- **Professional** release process
- **User confidence** in version information

By following these guidelines, you'll maintain a robust and reliable versioning system for Unified Data Studio v2.

---

**Last Updated:** December 2024  
**Next Review:** January 2025  
**Maintainer:** Development Team
