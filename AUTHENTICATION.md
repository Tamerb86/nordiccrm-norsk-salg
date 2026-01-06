# Authentication & Role-Based Permissions System

## Overview
The CRM now includes a comprehensive authentication system with role-based access control (RBAC). Users must log in to access the system, and their permissions are determined by their assigned role.

## User Roles

### 1. Administrator (Admin)
- **Full system access** with no restrictions
- Can manage all data across the organization
- Can invite, edit, and remove team members
- Can change user roles
- Can manage API keys and integrations
- Can export and import data

### 2. Manager
- **Oversight and team management** capabilities
- Can view all contacts, deals, and tasks
- Can create and edit most data
- Can invite new team members (but cannot change roles)
- Can manage email templates
- Cannot delete records or remove team members
- Cannot manage API keys

### 3. Sales Representative (Sales)
- **Individual contributor** with limited access
- Can only view and manage their own assigned contacts, deals, and tasks
- Cannot view other team members' data
- Cannot export/import data
- Cannot manage team members
- Cannot access API settings
- Can send emails and manage their own email templates

## Permission Matrix

| Resource | Action | Admin | Manager | Sales |
|----------|--------|-------|---------|-------|
| **Contacts** | View Own | ✓ | ✓ | ✓ |
| | View All | ✓ | ✓ | ✗ |
| | Create | ✓ | ✓ | ✓ |
| | Edit | ✓ | ✓ | ✓ |
| | Delete | ✓ | ✗ | ✗ |
| | Export | ✓ | ✓ | ✗ |
| | Import | ✓ | ✓ | ✗ |
| **Deals** | View Own | ✓ | ✓ | ✓ |
| | View All | ✓ | ✓ | ✗ |
| | Create | ✓ | ✓ | ✓ |
| | Edit | ✓ | ✓ | ✓ |
| | Delete | ✓ | ✗ | ✗ |
| | Reassign | ✓ | ✓ | ✗ |
| **Tasks** | View Own | ✓ | ✓ | ✓ |
| | View All | ✓ | ✓ | ✗ |
| | Create | ✓ | ✓ | ✓ |
| | Edit | ✓ | ✓ | ✓ |
| | Delete | ✓ | ✗ | ✗ |
| | Reassign | ✓ | ✓ | ✗ |
| **Emails** | Send | ✓ | ✓ | ✓ |
| | View Own | ✓ | ✓ | ✓ |
| | View All | ✓ | ✓ | ✗ |
| | Manage Templates | ✓ | ✓ | ✗ |
| **Reports** | View Own | ✓ | ✓ | ✓ |
| | View All | ✓ | ✓ | ✗ |
| | Export | ✓ | ✓ | ✗ |
| **API** | View | ✓ | ✓ | ✗ |
| | Manage Keys | ✓ | ✗ | ✗ |
| **Team** | View Members | ✓ | ✓ | ✓ |
| | Invite | ✓ | ✓ | ✗ |
| | Edit | ✓ | ✗ | ✗ |
| | Remove | ✓ | ✗ | ✗ |
| | Change Roles | ✓ | ✗ | ✗ |

## Demo Accounts

For demonstration purposes, three accounts are pre-configured:

### Admin Account
- **Email:** `admin@crm.no`
- **Password:** Any value (for demo purposes)
- **Role:** Administrator
- **Access:** Full system access

### Manager Account
- **Email:** `manager@crm.no`
- **Password:** Any value (for demo purposes)
- **Role:** Manager
- **Access:** View all data, manage team, limited destructive actions

### Sales Account
- **Email:** `sales@crm.no`
- **Password:** Any value (for demo purposes)
- **Role:** Sales Representative
- **Access:** Own data only, no team management

## Key Features

### 1. Login Screen
- Clean, user-friendly login interface
- Password visibility toggle
- Demo account reference for easy testing
- Translated to Norwegian and English

### 2. Session Persistence
- User sessions persist across page refreshes
- Automatic re-authentication on app load
- Secure logout functionality

### 3. User Menu
- Displays current user information
- Shows user avatar with initials
- Role badge with color coding:
  - **Admin:** Red (destructive color)
  - **Manager:** Accent color
  - **Sales:** Primary color
- Quick logout access

### 4. Permission Guards
- UI elements automatically hide based on permissions
- Actions are blocked at the component level
- Graceful degradation for unauthorized access

### 5. Data Filtering
- Sales users automatically see only their assigned data
- Managers and admins see all data by default
- Filter logic applied to contacts, deals, and tasks

## Technical Implementation

### Context Provider
```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

### Using Authentication in Components
```typescript
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, hasPermission, logout } = useAuth()
  
  // Check permission
  if (hasPermission('contacts', 'create')) {
    // Show create button
  }
}
```

### Permission Guard Component
```typescript
<PermissionGuard resource="contacts" action="delete">
  <DeleteButton />
</PermissionGuard>
```

### Conditional Rendering
```typescript
{hasPermission('team', 'invite') && (
  <Button onClick={inviteTeamMember}>
    Invite Member
  </Button>
)}
```

## Security Considerations

### Current Implementation (Demo)
- Simple email-based authentication
- No actual password validation (accepts any password)
- Sessions stored in browser localStorage via useKV
- Suitable for demonstration and prototyping

### Production Recommendations
For a production deployment, implement:
1. **Proper authentication:**
   - Password hashing (bcrypt, argon2)
   - JWT tokens or session cookies
   - Password complexity requirements
   - Account lockout after failed attempts

2. **Enhanced security:**
   - Two-factor authentication (2FA)
   - Password reset functionality
   - Email verification
   - Audit logs for sensitive actions

3. **Backend integration:**
   - Server-side session validation
   - API authentication
   - Role verification on backend
   - GDPR-compliant data handling

4. **Additional features:**
   - Password change functionality
   - Session timeout
   - Remember me option
   - Security questions

## Navigation Filtering

The navigation menu automatically adjusts based on user permissions:
- Sales users don't see the API or Team management tabs
- All users can access the Dashboard
- Access is controlled at the component level

## Future Enhancements

Potential improvements for the authentication system:
1. Social login (Google, Microsoft, etc.)
2. Single Sign-On (SSO) integration
3. Custom role creation
4. Granular permission customization
5. IP-based access restrictions
6. Device management
7. Login history and security alerts

## Testing Different Roles

To test the system with different roles:

1. **Test as Admin:**
   - Login with `admin@crm.no`
   - Verify full access to all features
   - Test team management, API settings

2. **Test as Manager:**
   - Login with `manager@crm.no`
   - Verify you can see all data
   - Verify you cannot delete records or manage API

3. **Test as Sales:**
   - Login with `sales@crm.no`
   - Create some contacts/deals assigned to yourself
   - Verify you only see your own data
   - Verify team and API tabs are hidden
