#!/usr/bin/env python3
"""
Version Manager for Unified Data Studio v2
Automatically updates version information across all components
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

class VersionManager:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.version_file = self.project_root / "VERSION"
        self.version = self._read_version()
        
    def _read_version(self) -> str:
        """Read current version from VERSION file"""
        if not self.version_file.exists():
            raise FileNotFoundError(f"VERSION file not found at {self.version_file}")
        
        with open(self.version_file, 'r', encoding='utf-8') as f:
            version = f.read().strip()
        
        if not re.match(r'^\d+\.\d+\.\d+$', version):
            raise ValueError(f"Invalid version format: {version}")
        
        return version
    
    def update_backend_version(self) -> bool:
        """Update version in backend/Cargo.toml"""
        cargo_file = self.project_root / "backend" / "Cargo.toml"
        if not cargo_file.exists():
            print(f"⚠️  Backend Cargo.toml not found at {cargo_file}")
            return False
        
        try:
            with open(cargo_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update version line
            old_pattern = r'^version\s*=\s*"[^"]*"'
            new_line = f'version = "{self.version}"'
            
            if re.search(old_pattern, content, re.MULTILINE):
                content = re.sub(old_pattern, new_line, content, flags=re.MULTILINE)
                
                with open(cargo_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✅ Backend version updated to {self.version}")
                return True
            else:
                print(f"⚠️  Version line not found in {cargo_file}")
                return False
                
        except Exception as e:
            print(f"❌ Error updating backend version: {e}")
            return False
    
    def update_frontend_version(self) -> bool:
        """Update version in frontend package.json if it exists"""
        package_file = self.project_root / "frontend" / "package.json"
        if not package_file.exists():
            print(f"⚠️  Frontend package.json not found at {package_file}")
            return False
        
        try:
            with open(package_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update version line
            old_pattern = r'"version":\s*"[^"]*"'
            new_line = f'"version": "{self.version}"'
            
            if re.search(old_pattern, content):
                content = re.sub(old_pattern, new_line, content)
                
                with open(package_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✅ Frontend version updated to {self.version}")
                return True
            else:
                print(f"⚠️  Version line not found in {package_file}")
                return False
                
        except Exception as e:
            print(f"❌ Error updating frontend version: {e}")
            return False
    
    def update_typescript_version(self) -> bool:
        """Update hardcoded version in TypeScript files"""
        ts_files = [
            "frontend/src/services/AutoUpdater.ts",
            "frontend/src/services/BackendService.ts"
        ]
        
        updated = False
        for ts_file in ts_files:
            file_path = self.project_root / ts_file
            if not file_path.exists():
                print(f"⚠️  TypeScript file not found: {ts_file}")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Update hardcoded version strings
                old_pattern = r"return '1\.0\.0'"
                new_line = f"return '{self.version}'"
                
                if re.search(old_pattern, content):
                    content = re.sub(old_pattern, new_line, content)
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    print(f"✅ TypeScript version updated in {ts_file}")
                    updated = True
                else:
                    print(f"⚠️  Version string not found in {ts_file}")
                    
            except Exception as e:
                print(f"❌ Error updating {ts_file}: {e}")
        
        return updated
    
    def create_version_header(self) -> bool:
        """Create a version header file for easy access"""
        header_file = self.project_root / "frontend" / "src" / "version.ts"
        
        try:
            header_content = f"""// Auto-generated version file - DO NOT EDIT MANUALLY
// This file is updated automatically by the version manager

export const APP_VERSION = '{self.version}';
export const APP_NAME = 'Unified Data Studio v2';

// Version information for components
export const VERSION_INFO = {{
  version: '{self.version}',
  name: 'Unified Data Studio v2',
  buildDate: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
}};

export default APP_VERSION;
"""
            
            with open(header_file, 'w', encoding='utf-8') as f:
                f.write(header_content)
            
            print(f"✅ Version header created at {header_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error creating version header: {e}")
            return False
    
    def update_all_components(self) -> Dict[str, bool]:
        """Update version in all components"""
        results = {
            'backend': self.update_backend_version(),
            'frontend_package': self.update_frontend_version(),
            'typescript': self.update_typescript_version(),
            'version_header': self.create_version_header()
        }
        
        return results
    
    def bump_version(self, bump_type: str = 'patch') -> str:
        """Bump version number"""
        major, minor, patch = map(int, self.version.split('.'))
        
        if bump_type == 'major':
            major += 1
            minor = 0
            patch = 0
        elif bump_type == 'minor':
            minor += 1
            patch = 0
        elif bump_type == 'patch':
            patch += 1
        else:
            raise ValueError(f"Invalid bump type: {bump_type}")
        
        new_version = f"{major}.{minor}.{patch}"
        
        # Update VERSION file
        with open(self.version_file, 'w', encoding='utf-8') as f:
            f.write(new_version)
        
        self.version = new_version
        print(f"✅ Version bumped to {new_version}")
        
        return new_version
    
    def get_version_info(self) -> Dict[str, str]:
        """Get comprehensive version information"""
        return {
            'current_version': self.version,
            'version_file': str(self.version_file),
            'project_root': str(self.project_root)
        }

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print("Usage: python version_manager.py <command> [options]")
        print("Commands:")
        print("  update-all     - Update version in all components")
        print("  bump <type>    - Bump version (major|minor|patch)")
        print("  info           - Show version information")
        print("  create-header  - Create version header file")
        return
    
    command = sys.argv[1]
    manager = VersionManager()
    
    try:
        if command == "update-all":
            results = manager.update_all_components()
            print("\n📊 Update Results:")
            for component, success in results.items():
                status = "✅ Success" if success else "❌ Failed"
                print(f"  {component}: {status}")
        
        elif command == "bump":
            if len(sys.argv) < 3:
                print("❌ Please specify bump type: major, minor, or patch")
                return
            
            bump_type = sys.argv[2]
            if bump_type not in ['major', 'minor', 'patch']:
                print("❌ Invalid bump type. Use: major, minor, or patch")
                return
            
            new_version = manager.bump_version(bump_type)
            print(f"🚀 Version bumped to {new_version}")
            
            # Update all components with new version
            print("🔄 Updating all components...")
            manager.update_all_components()
        
        elif command == "info":
            info = manager.get_version_info()
            print("\n📋 Version Information:")
            for key, value in info.items():
                print(f"  {key}: {value}")
        
        elif command == "create-header":
            manager.create_version_header()
        
        else:
            print(f"❌ Unknown command: {command}")
            print("Use: update-all, bump, info, or create-header")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
