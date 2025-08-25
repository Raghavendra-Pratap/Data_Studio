# Development Rules & Standards
## Complete Development Guidelines for Data Studio

**Version:** 1.0  
**Last Updated:** December 2024  
**Maintainer:** Development Team  
**Status:** Active

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Coding Standards](#coding-standards)
3. [Development Workflow](#development-workflow)
4. [Testing Standards](#testing-standards)
5. [Performance Guidelines](#performance-guidelines)
6. [Security Standards](#security-standards)
7. [Documentation Requirements](#documentation-requirements)
8. [Code Review Process](#code-review-process)
9. [Quality Assurance](#quality-assurance)
10. [Deployment Standards](#deployment-standards)
11. [Maintenance & Updates](#maintenance--updates)
12. [Troubleshooting](#troubleshooting)

---

## Project Structure

### Directory Organization

```
unified-data-studio-v2/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and business logic
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # CSS and styling
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── backend/                 # Rust backend
│   ├── src/
│   │   ├── main.rs         # Application entry point
│   │   ├── handlers/       # Request handlers
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── Cargo.toml          # Rust dependencies
│   └── Cargo.lock          # Locked dependency versions
├── docs/                    # Project documentation
├── scripts/                 # Build and utility scripts
├── tests/                   # Integration tests
├── .github/                 # GitHub configuration
├── .gitignore              # Git ignore rules
└── README.md               # Project overview
```

### File Naming Conventions

#### **Frontend Files:**
- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Pages**: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- **Services**: `camelCase.ts` (e.g., `authService.ts`)
- **Hooks**: `useCamelCase.ts` (e.g., `useAuth.ts`)
- **Types**: `camelCase.ts` (e.g., `userTypes.ts`)
- **Utils**: `camelCase.ts` (e.g., `stringUtils.ts`)

#### **Backend Files:**
- **Modules**: `snake_case.rs` (e.g., `user_handler.rs`)
- **Structs**: `snake_case.rs` (e.g., `data_models.rs`)
- **Services**: `snake_case.rs` (e.g., `workflow_service.rs`)

#### **General Files:**
- **Configuration**: `kebab-case.yml` (e.g., `docker-compose.yml`)
- **Scripts**: `snake_case.sh` or `snake_case.py`
- **Documentation**: `PascalCase.md` (e.g., `DevelopmentRules.md`)

---

## Coding Standards

### TypeScript/JavaScript Standards

#### **General Rules:**
- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Implement proper error handling
- Use async/await over callbacks
- Follow ESLint rules strictly

#### **Component Standards:**
```typescript
// ✅ Good Component Structure
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/userTypes';
import { useAuth } from '../hooks/useAuth';
import './UserProfile.css';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: UserProfile) => void;
}

export const UserProfileComponent: React.FC<UserProfileProps> = ({
  userId,
  onUpdate
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (userId && isAuthenticated) {
      loadUserProfile(userId);
    }
  }, [userId, isAuthenticated]);

  const loadUserProfile = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const userData = await fetchUserProfile(id);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
```

#### **Service Standards:**
```typescript
// ✅ Good Service Structure
import { UserProfile, ApiResponse } from '../types/userTypes';

class UserService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<UserProfile> = await response.json();
      return data.data;
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<UserProfile> = await response.json();
      return data.data;
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }
}

export const userService = new UserService(process.env.REACT_APP_API_URL || '');
```

### Python Standards

#### **General Rules:**
- Follow PEP 8 style guidelines
- Use type hints where possible
- Implement proper exception handling
- Use virtual environments
- Follow flake8 or black formatting

#### **Code Examples:**
```python
# ✅ Good Python Structure
from typing import List, Optional, Dict, Any
import logging
from pathlib import Path
import json

logger = logging.getLogger(__name__)

class DataProcessor:
    """Process data through various workflows."""
    
    def __init__(self, config_path: Optional[Path] = None):
        """Initialize the data processor.
        
        Args:
            config_path: Path to configuration file
        """
        self.config_path = config_path or Path("config.json")
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file.
        
        Returns:
            Configuration dictionary
            
        Raises:
            FileNotFoundError: If config file doesn't exist
            json.JSONDecodeError: If config file is invalid JSON
        """
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Configuration file not found: {self.config_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in config file: {e}")
            raise
    
    def process_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process the input data.
        
        Args:
            data: List of data dictionaries to process
            
        Returns:
            Processed data list
            
        Raises:
            ValueError: If data format is invalid
        """
        if not data:
            logger.warning("No data provided for processing")
            return []
        
        try:
            processed_data = []
            for item in data:
                if not isinstance(item, dict):
                    raise ValueError(f"Invalid data item: {item}")
                
                processed_item = self._process_item(item)
                processed_data.append(processed_item)
            
            logger.info(f"Successfully processed {len(processed_data)} items")
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing data: {e}")
            raise
    
    def _process_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single data item.
        
        Args:
            item: Single data item to process
            
        Returns:
            Processed item
        """
        # Implementation details here
        return item
```

### Rust Standards

#### **General Rules:**
- Follow Rust style guidelines
- Use proper error handling with Result
- Implement comprehensive tests
- Use clippy for linting
- Follow cargo conventions

#### **Code Examples:**
```rust
// ✅ Good Rust Structure
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use std::error::Error;
use std::fmt;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: String,
    pub name: String,
    pub email: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug)]
pub enum UserError {
    NotFound(String),
    ValidationError(String),
    DatabaseError(String),
}

impl fmt::Display for UserError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            UserError::NotFound(id) => write!(f, "User not found: {}", id),
            UserError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            UserError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
        }
    }
}

impl Error for UserError {}

pub struct UserService {
    db_pool: sqlx::PgPool,
}

impl UserService {
    pub fn new(db_pool: sqlx::PgPool) -> Self {
        Self { db_pool }
    }

    pub async fn get_user_profile(&self, user_id: &str) -> Result<UserProfile, UserError> {
        let user = sqlx::query_as!(
            UserProfile,
            "SELECT id, name, email, created_at FROM users WHERE id = $1",
            user_id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| UserError::DatabaseError(e.to_string()))?
        .ok_or_else(|| UserError::NotFound(user_id.to_string()))?;

        Ok(user)
    }

    pub async fn update_user_profile(
        &self,
        user_id: &str,
        updates: &UserProfile,
    ) -> Result<UserProfile, UserError> {
        // Validate updates
        if updates.name.trim().is_empty() {
            return Err(UserError::ValidationError("Name cannot be empty".to_string()));
        }

        if !updates.email.contains('@') {
            return Err(UserError::ValidationError("Invalid email format".to_string()));
        }

        let updated_user = sqlx::query_as!(
            UserProfile,
            "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at",
            updates.name,
            updates.email,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| UserError::DatabaseError(e.to_string()))?;

        Ok(updated_user)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::PgPool;

    #[tokio::test]
    async fn test_get_user_profile() {
        // Test implementation
    }

    #[tokio::test]
    async fn test_update_user_profile() {
        // Test implementation
    }
}
```

---

## Development Workflow

### Feature Development Process

#### **1. Planning Phase:**
- [ ] Create feature issue with detailed description
- [ ] Define acceptance criteria
- [ ] Estimate development time
- [ ] Identify dependencies and blockers
- [ ] Assign to developer

#### **2. Development Phase:**
- [ ] Create feature branch from `develop`
- [ ] Implement feature following coding standards
- [ ] Write tests for new functionality
- [ ] Update documentation
- [ ] Self-review code before committing

#### **3. Review Phase:**
- [ ] Create pull request to `develop`
- [ ] Request code review from team members
- [ ] Address review feedback
- [ ] Ensure all CI checks pass
- [ ] Get approval from reviewers

#### **4. Integration Phase:**
- [ ] Merge feature branch to `develop`
- [ ] Delete feature branch
- [ ] Verify integration in `develop`
- [ ] Update issue status
- [ ] Document any breaking changes

### Bug Fix Process

#### **1. Issue Identification:**
- [ ] Reproduce the bug consistently
- [ ] Document steps to reproduce
- [ ] Identify affected components
- [ ] Assess severity and priority
- [ ] Create detailed bug report

#### **2. Fix Development:**
- [ ] Create bugfix branch from `develop`
- [ ] Implement fix following coding standards
- [ ] Add tests to prevent regression
- [ ] Test fix thoroughly
- [ ] Update documentation if needed

#### **3. Fix Review:**
- [ ] Create pull request with fix
- [ ] Request review from team
- [ ] Address review feedback
- [ ] Ensure tests pass
- [ ] Get approval for merge

#### **4. Fix Deployment:**
- [ ] Merge fix to `develop`
- [ ] Test fix in integration environment
- [ ] Deploy to staging for validation
- [ ] Deploy to production
- [ ] Monitor for any issues

---

## Testing Standards

### Test Requirements

#### **Frontend Testing:**
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Coverage**: Maintain >80% test coverage
- **Framework**: Jest + React Testing Library

#### **Backend Testing:**
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database operations
- **Performance Tests**: Test under load and stress
- **Coverage**: Maintain >90% test coverage
- **Framework**: Built-in testing frameworks

### Test Examples

#### **Frontend Test:**
```typescript
// ✅ Good Frontend Test
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfileComponent } from './UserProfileComponent';
import { userService } from '../services/userService';

// Mock the user service
jest.mock('../services/userService');
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('UserProfileComponent', () => {
  const mockUser = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user profile when data is loaded', async () => {
    mockUserService.getUserProfile.mockResolvedValue(mockUser);

    render(<UserProfileComponent userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', () => {
    mockUserService.getUserProfile.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<UserProfileComponent userId="123" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    mockUserService.getUserProfile.mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(<UserProfileComponent userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});
```

#### **Backend Test:**
```rust
// ✅ Good Backend Test
#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::PgPool;
    use sqlx::postgres::PgPoolOptions;

    async fn setup_test_db() -> PgPool {
        let database_url = std::env::var("TEST_DATABASE_URL")
            .expect("TEST_DATABASE_URL must be set");
        
        PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .expect("Failed to connect to test database")
    }

    #[tokio::test]
    async fn test_get_user_profile_success() {
        let pool = setup_test_db().await;
        let service = UserService::new(pool);

        // Insert test user
        sqlx::query!(
            "INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, $4)",
            "test-user-123",
            "Test User",
            "test@example.com",
            chrono::Utc::now()
        )
        .execute(&pool)
        .await
        .unwrap();

        // Test getting user profile
        let result = service.get_user_profile("test-user-123").await;
        assert!(result.is_ok());

        let user = result.unwrap();
        assert_eq!(user.id, "test-user-123");
        assert_eq!(user.name, "Test User");
        assert_eq!(user.email, "test@example.com");

        // Cleanup
        sqlx::query!("DELETE FROM users WHERE id = $1", "test-user-123")
            .execute(&pool)
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn test_get_user_profile_not_found() {
        let pool = setup_test_db().await;
        let service = UserService::new(pool);

        let result = service.get_user_profile("non-existent-user").await;
        assert!(result.is_err());

        match result.unwrap_err() {
            UserError::NotFound(_) => (), // Expected error
            _ => panic!("Expected NotFound error"),
        }
    }
}
```

---

## Performance Guidelines

### Frontend Performance

#### **Bundle Optimization:**
- Use code splitting for route-based components
- Implement lazy loading for heavy components
- Optimize images and assets
- Use tree shaking to remove unused code
- Minimize bundle size with compression

#### **Runtime Performance:**
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Use useMemo and useCallback for expensive calculations
- Avoid unnecessary re-renders
- Optimize list rendering with virtualization

### Backend Performance

#### **Database Optimization:**
- Use proper indexes for queries
- Implement connection pooling
- Use prepared statements
- Optimize query patterns
- Implement caching strategies

#### **API Optimization:**
- Use pagination for large datasets
- Implement response compression
- Use async processing for heavy operations
- Implement rate limiting
- Use CDN for static assets

---

## Security Standards

### General Security Principles

#### **Input Validation:**
- Validate all user inputs
- Sanitize data before processing
- Use parameterized queries
- Implement proper error handling
- Log security events

#### **Authentication & Authorization:**
- Use secure authentication methods
- Implement proper session management
- Use role-based access control
- Implement multi-factor authentication
- Regular security audits

### Security Examples

#### **Frontend Security:**
```typescript
// ✅ Secure Input Validation
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
```

#### **Backend Security:**
```rust
// ✅ Secure Backend Implementation
use argon2::{self, Config};
use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserCredentials {
    pub email: String,
    pub password: String,
}

pub struct AuthService {
    db_pool: sqlx::PgPool,
}

impl AuthService {
    pub fn new(db_pool: sqlx::PgPool) -> Self {
        Self { db_pool }
    }

    pub async fn register_user(
        &self,
        credentials: &UserCredentials,
    ) -> Result<String, Box<dyn std::error::Error>> {
        // Validate email format
        if !self.is_valid_email(&credentials.email) {
            return Err("Invalid email format".into());
        }

        // Validate password strength
        if !self.is_strong_password(&credentials.password) {
            return Err("Password does not meet requirements".into());
        }

        // Hash password
        let salt: [u8; 32] = rand::thread_rng().gen();
        let config = Config::default();
        let hash = argon2::hash_encoded(
            credentials.password.as_bytes(),
            &salt,
            &config,
        )?;

        // Store user in database
        let user_id = uuid::Uuid::new_v4().to_string();
        sqlx::query!(
            "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
            user_id,
            credentials.email,
            hash
        )
        .execute(&self.db_pool)
        .await?;

        Ok(user_id)
    }

    fn is_valid_email(&self, email: &str) -> bool {
        use regex::Regex;
        let email_regex = Regex::new(r"^[^\s@]+@[^\s@]+\.[^\s@]+$").unwrap();
        email_regex.is_match(email)
    }

    fn is_strong_password(&self, password: &str) -> bool {
        password.len() >= 8
            && password.chars().any(|c| c.is_ascii_uppercase())
            && password.chars().any(|c| c.is_ascii_lowercase())
            && password.chars().any(|c| c.is_ascii_digit())
    }
}
```

---

## Documentation Requirements

### Code Documentation

#### **Function Documentation:**
- Purpose and functionality
- Parameter descriptions
- Return value descriptions
- Error conditions
- Usage examples

#### **Class Documentation:**
- Purpose and responsibilities
- Public interface
- Dependencies
- Usage patterns

### API Documentation

#### **Endpoint Documentation:**
- HTTP method and path
- Request parameters
- Request body schema
- Response schema
- Error codes
- Authentication requirements

---

## Code Review Process

### Review Checklist

#### **Functionality:**
- [ ] Does the code work as intended?
- [ ] Are edge cases handled?
- [ ] Is error handling appropriate?
- [ ] Are there any obvious bugs?

#### **Code Quality:**
- [ ] Is the code readable and maintainable?
- [ ] Are naming conventions followed?
- [ ] Is the code efficient?
- [ ] Are there any code smells?

#### **Security:**
- [ ] Are there security vulnerabilities?
- [ ] Is input validation proper?
- [ ] Are sensitive operations protected?
- [ ] Is error information sanitized?

#### **Testing:**
- [ ] Are there adequate tests?
- [ ] Do tests cover edge cases?
- [ ] Are tests maintainable?
- [ ] Is test coverage sufficient?

---

## Quality Assurance

### Code Quality Metrics

#### **Static Analysis:**
- ESLint/TSLint for TypeScript/JavaScript
- Clippy for Rust
- Flake8/Black for Python
- SonarQube for comprehensive analysis

#### **Test Coverage:**
- Frontend: >80% coverage
- Backend: >90% coverage
- Integration tests for critical paths
- Performance benchmarks

### Quality Gates

#### **Pre-commit Checks:**
- Linting passes
- Tests pass
- Code formatting correct
- No security vulnerabilities

#### **Pre-merge Checks:**
- All CI checks pass
- Code review approved
- Test coverage maintained
- Performance benchmarks met

---

## Deployment Standards

### Deployment Process

#### **Environment Management:**
- Development environment
- Staging environment
- Production environment
- Environment-specific configurations

#### **Deployment Pipeline:**
- Automated testing
- Security scanning
- Performance testing
- Gradual rollout
- Rollback procedures

### Deployment Checklist

#### **Pre-deployment:**
- [ ] All tests pass
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Rollback plan prepared

#### **Post-deployment:**
- [ ] Health checks pass
- [ ] Monitoring alerts configured
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User feedback positive

---

## Maintenance & Updates

### Regular Maintenance

#### **Weekly Tasks:**
- Review and close stale issues
- Update dependencies
- Monitor performance metrics
- Review error logs

#### **Monthly Tasks:**
- Security updates
- Performance optimization
- Code refactoring
- Documentation review

#### **Quarterly Tasks:**
- Major dependency updates
- Architecture review
- Security audit
- Performance audit

### Update Process

#### **Dependency Updates:**
- Regular security updates
- Major version updates
- Breaking change assessment
- Compatibility testing

---

## Troubleshooting

### Common Issues

#### **Build Failures:**
- Check dependency versions
- Verify environment setup
- Review error logs
- Test locally first

#### **Runtime Errors:**
- Check application logs
- Verify configuration
- Test in isolation
- Use debugging tools

#### **Performance Issues:**
- Profile application
- Check resource usage
- Optimize bottlenecks
- Monitor metrics

---

## Conclusion

Following these development rules and standards will ensure:

- **Code Quality**: Maintainable and readable code
- **Team Collaboration**: Consistent development practices
- **Project Success**: Reliable and scalable applications
- **Security**: Protected applications and data
- **Performance**: Optimized user experience

Remember: **"Quality is not an act, it is a habit."**

---

**Last Updated:** December 2024  
**Next Review:** January 2025  
**Maintainer:** Development Team
