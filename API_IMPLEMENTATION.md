# Real API Implementation for Norwegian CRM

This document describes the implementation of the real backend API that replaces the previous mocked API calls.

## Architecture

The API backend has been implemented using the following components:

### 1. **API Server** (`src/api/server.ts`)
The API server is a TypeScript class that handles all API requests and connects directly to the Spark KV store for data persistence. It includes:

- **Authentication & Authorization**: API key validation and permission checking
- **CRUD Operations**: Full Create, Read, Update, Delete operations for:
  - Contacts
  - Deals
  - Tasks
  - Emails
- **Webhook Support**: Automatic webhook triggers for relevant events
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes

### 2. **API Client** (`src/lib/api-client.ts`)
A type-safe client library for making API requests:

- Provides methods for all supported endpoints
- Handles request/response serialization
- Returns typed responses with proper error handling
- Integrates seamlessly with the API server

### 3. **Replaced Components**

#### ApiPlayground.tsx
- Now makes real API calls instead of mock responses
- Tests actual CRUD operations on live data
- Validates API keys and permissions
- Shows real response times and actual data

#### ApiDocumentation.tsx
- Updated to reflect real API behavior
- All example code works with the actual implementation

## API Endpoints

### Contacts
- `GET /api/v1/contacts` - List all contacts
- `POST /api/v1/contacts` - Create a new contact
- `GET /api/v1/contacts/:id` - Get a specific contact
- `PUT /api/v1/contacts/:id` - Update a contact
- `DELETE /api/v1/contacts/:id` - Delete a contact

### Deals
- `GET /api/v1/deals` - List all deals
- `POST /api/v1/deals` - Create a new deal
- `PATCH /api/v1/deals/:id/stage` - Update deal stage

### Tasks
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create a new task
- `PATCH /api/v1/tasks/:id/complete` - Mark task as complete

### Emails
- `GET /api/v1/emails` - List email history
- `POST /api/v1/emails/send` - Send an email
- `GET /api/v1/emails/:id/stats` - Get email statistics

## Data Persistence

All data is stored in the Spark KV store with the following keys:

- `contacts` - Array of contact objects
- `deals` - Array of deal objects
- `tasks` - Array of task objects
- `emails` - Array of email objects
- `api-keys` - Array of API key configurations
- `webhooks` - Array of webhook configurations

## Authentication

API requests must include an `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

For development/testing, you can use the mock API key:
```
sk_test_mock_development_key
```

## Permissions

The API enforces role-based permissions:

- **read**: View resources
- **write**: Create and update resources
- **delete**: Delete resources
- **admin**: Full access to all operations

Resource permissions can be configured per API key for fine-grained access control.

## Webhooks

Webhooks are automatically triggered for the following events:

- `contact.created`
- `contact.updated`
- `contact.deleted`
- `deal.created`
- `deal.stage_changed`
- `task.created`
- `task.completed`
- `email.sent`

Webhook payloads include:
- Event type
- Timestamp
- Event data
- HMAC signature for verification

## Usage Example

```typescript
import { createApiClient } from '@/lib/api-client'

const client = createApiClient('your-api-key')

// Create a contact
const result = await client.createContact({
  firstName: 'Kari',
  lastName: 'Hansen',
  email: 'kari@example.no',
  status: 'lead',
  tags: ['web'],
  value: 25000
})

if (result.error) {
  console.error('Error:', result.error.message)
} else {
  console.log('Created contact:', result.data)
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a detailed error object:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "field": "fieldName" // (optional) for validation errors
  }
}
```

## Testing

Use the API Playground in the application to:

1. Test all endpoints with real data
2. Validate API key authentication
3. Try different request payloads
4. View actual response times and data
5. Generate cURL commands for external testing

## Future Enhancements

Potential improvements for future iterations:

1. Rate limiting implementation
2. Request caching
3. Bulk operations support
4. Advanced filtering and search
5. Pagination for large datasets
6. Export/import functionality via API
7. Real-time updates via WebSockets
8. API versioning support
