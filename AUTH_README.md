# Authentication System

This CRM uses a secure JWT-based authentication system with server-side validation.

## Overview

The authentication system consists of:
- **JWT tokens** for session management
- **SHA-256 password hashing** for secure password storage
- **Server-side validation** of all authentication requests
- **Role-based access control** (Admin, Manager, Sales)

## Demo Accounts

For testing purposes, the following demo accounts are available:

| Email | Password | Role | Email Verified |
|-------|----------|------|----------------|
| admin@crm.no | demo123 | admin | ✓ |
| manager@crm.no | demo123 | manager | ✓ |
| sales@crm.no | demo123 | sales | ✗ |

## Architecture

### Components

1. **auth-api.ts** - Core authentication API with server-side logic
2. **auth-context.tsx** - React context for managing authentication state
3. **use-demo-accounts.ts** - Initializes demo accounts with hashed passwords

### Data Storage

Authentication data is stored in two locations:

1. **auth-users** - Secure user data with hashed passwords
   ```typescript
   {
     [userId]: {
       id: string
       email: string
       firstName: string
       lastName: string
       role: UserRole
       passwordHash: string  // SHA-256 hash
       isActive: boolean
       emailVerified: boolean
       createdAt: string
       updatedAt: string
       passwordResetToken?: string
       passwordResetExpires?: number
       emailVerificationToken?: string
       emailVerificationExpires?: number
     }
   }
   ```

2. **auth-session-{userId}** - Active session tokens
   ```typescript
   {
     token: string
     userId: string
     createdAt: string
     lastAccessAt: string
   }
   ```

3. **team-members** - Team member display data (no passwords)

### Authentication Flow

#### Login
1. User submits email and password
2. Password is hashed using SHA-256
3. Server validates credentials against `auth-users` store
4. Server generates JWT token with user ID, email, and role
5. Token is stored in session store and returned to client
6. Client stores token and user data

#### Token Verification
1. On app load, client sends stored token to server
2. Server verifies token signature and expiration
3. Server checks if session exists in session store
4. Server returns user data if valid

#### Logout
1. Client calls logout with user ID
2. Server deletes session from session store
3. Client clears stored token and user data

## API Reference

### authApi.login(email, password)
Authenticates a user and returns a JWT token.

```typescript
const response = await authApi.login('admin@crm.no', 'demo123')
if (response.success) {
  console.log('Token:', response.token)
  console.log('User:', response.user)
}
```

### authApi.register(email, password, firstName, lastName, role?)
Creates a new user account.

```typescript
const response = await authApi.register(
  'newuser@company.no',
  'securePassword123',
  'John',
  'Doe',
  'sales'
)
```

### authApi.verifyToken(token)
Verifies a JWT token and returns user data.

```typescript
const response = await authApi.verifyToken(token)
if (response.success) {
  console.log('User:', response.user)
}
```

### authApi.logout(userId)
Invalidates a user session.

```typescript
await authApi.logout(user.id)
```

### authApi.changePassword(userId, currentPassword, newPassword)
Changes a user's password.

```typescript
const response = await authApi.changePassword(
  user.id,
  'oldPassword',
  'newPassword'
)
```

### authApi.requestPasswordReset(email)
Generates a password reset token.

```typescript
const response = await authApi.requestPasswordReset('user@company.no')
```

### authApi.resetPassword(token, newPassword)
Resets a password using a reset token.

```typescript
const response = await authApi.resetPassword(resetToken, 'newPassword123')
```

### authApi.verifyEmail(token)
Verifies an email address using a verification token.

```typescript
const response = await authApi.verifyEmail(verificationToken)
```

## Security Features

### Password Security
- Passwords are hashed using SHA-256 before storage
- Passwords are never stored in plain text
- Passwords are never returned in API responses

### Token Security
- JWT tokens include user ID, email, role, and expiration
- Tokens expire after 7 days
- Tokens are validated on every request
- Sessions can be invalidated server-side

### Role-Based Access Control
- Three roles: Admin, Manager, Sales
- Permissions are enforced in `rolePermissions`
- Resources include: contacts, deals, tasks, emails, reports, api, team
- Each role has granular permissions (view, create, edit, delete, etc.)

### Session Management
- Active sessions are stored server-side
- Sessions are updated with last access time
- Sessions can be deleted to force logout

## Usage in Components

### Using the Auth Context

```typescript
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, isAuthenticated, login, logout, hasPermission } = useAuth()
  
  const handleLogin = async () => {
    const success = await login('admin@crm.no', 'demo123')
    if (success) {
      console.log('Logged in as', user?.firstName)
    }
  }
  
  const canDelete = hasPermission('contacts', 'delete')
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

## Migration from Client-Side Auth

The previous authentication system stored user data only in `team-members` without passwords or secure sessions. The new system:

1. Creates an `auth-users` store with hashed passwords
2. Migrates existing demo accounts automatically
3. Uses JWT tokens instead of just storing user IDs
4. Validates all authentication server-side

Existing `team-members` data is preserved for backward compatibility and display purposes.

## Best Practices

1. **Always use the authApi** - Never directly access or modify auth-users store
2. **Never log passwords** - Even hashed passwords should be treated as sensitive
3. **Validate permissions** - Check permissions before showing/hiding UI elements
4. **Handle auth errors gracefully** - Show user-friendly error messages
5. **Implement rate limiting** - In production, add rate limiting to prevent brute force attacks

## Future Enhancements

Potential improvements for production deployment:

- [ ] Add HMAC signature validation for JWT tokens
- [ ] Implement refresh tokens for longer sessions
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Implement password strength requirements
- [ ] Add account lockout after failed login attempts
- [ ] Add session timeout and inactivity detection
- [ ] Implement OAuth2 for third-party authentication
- [ ] Add audit logging for all authentication events
- [ ] Implement CSRF protection
- [ ] Add rate limiting per IP/user
