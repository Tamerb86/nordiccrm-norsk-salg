# System Architecture - Norwegian CRM

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  React + TypeScript + Tailwind + shadcn/ui + Framer Motion │
│                  (Norwegian Localization)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      State Management                        │
│        React Hooks + useKV (Spark Persistence Layer)       │
│              Optimistic Updates + Local First               │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│         Domain Models + Validation + Business Rules         │
│               (Status transitions, Calculations)            │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      Data Persistence                        │
│                 Spark KV Store (Key-Value)                  │
│         EU-Compliant Storage + GDPR Export Ready            │
└─────────────────────────────────────────────────────────────┘
```

## Data Architecture (KV Store Design)

Since we're using Spark's KV store, we organize data by key patterns:

### Key Patterns

```
contacts:{id}          → Single contact object
contacts:list          → Array of all contact IDs (for listing)
contacts:index:email   → Map of email → contact ID (for duplicates)

deals:{id}             → Single deal object
deals:list             → Array of all deal IDs
deals:by:stage:{stage} → Array of deal IDs per stage

tasks:{id}             → Single task object
tasks:list             → Array of all task IDs
tasks:by:contact:{id}  → Array of task IDs for a contact
tasks:overdue          → Array of overdue task IDs

activities:{id}        → Single activity log entry
activities:by:contact:{id} → Array of activity IDs for contact

pipeline:stages        → Array of stage definitions
pipeline:config        → Pipeline configuration

settings:user          → User preferences
settings:company       → Company settings (currency, language, etc.)

reports:cache:{type}:{date} → Cached report data
```

## Database Schema (Logical Model)

### Contact
```typescript
{
  id: string (ULID)
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  status: 'lead' | 'prospect' | 'customer' | 'lost'
  tags: string[]
  value: number (potential/actual value in NOK)
  source?: string
  assignedTo?: string (user ID)
  notes?: string
  createdAt: Date
  updatedAt: Date
  customFields: Record<string, any>
}
```

### Deal
```typescript
{
  id: string (ULID)
  title: string
  contactId: string
  stage: string
  value: number (NOK)
  probability: number (0-100)
  expectedCloseDate?: Date
  actualCloseDate?: Date
  description?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  lostReason?: string
}
```

### Task
```typescript
{
  id: string (ULID)
  title: string
  description?: string
  contactId?: string
  dealId?: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
  priority: 'low' | 'medium' | 'high'
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'other'
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}
```

### Activity
```typescript
{
  id: string (ULID)
  type: 'call' | 'email' | 'meeting' | 'note' | 'status-change'
  contactId: string
  dealId?: string
  subject: string
  notes?: string
  duration?: number (minutes)
  outcome?: string
  createdBy: string
  createdAt: Date
  metadata: Record<string, any>
}
```

### Pipeline Stage
```typescript
{
  id: string
  name: string (Norwegian)
  order: number
  probability: number (default probability for deals in this stage)
  color: string
}
```

## User Flow: Lead → Sale

```
1. LEAD CAPTURE
   → User clicks "Ny kontakt"
   → Fills form: name, email, phone, company
   → Status auto-set to "Lead"
   → Save → Contact appears in list

2. QUALIFICATION
   → User opens contact detail
   → Reviews/adds information
   → Logs first call activity
   → Changes status to "Prospect" if qualified
   → Creates deal in pipeline

3. DEAL CREATION
   → From contact page → "Opprett avtale"
   → Fill: title, value (NOK), stage, probability
   → Link to contact
   → Set expected close date
   → Save → Deal appears in pipeline

4. PIPELINE MANAGEMENT
   → User views pipeline board
   → Drags deal through stages:
     - Første kontakt (20%)
     - Kvalifisering (40%)
     - Tilbud sendt (60%)
     - Forhandling (80%)
     - Vunnet (100%)
   → Each stage move creates activity log
   → Tasks auto-created for follow-ups

5. CLOSING
   → User drags to "Vunnet"
   → Dialog: confirm close date, final value
   → Contact status → "Customer"
   → Deal marked closed-won
   → Revenue added to reports
   → Success notification

6. POST-SALE
   → Auto-task created for onboarding
   → Contact remains in system
   → Can create new deals
   → Interaction history preserved
```

## MVP Scope (Build First)

### Phase 1: Core CRUD (Week 1-2)
- ✅ Contact management (add, edit, delete, list)
- ✅ Status management (lead → prospect → customer)
- ✅ Basic tagging
- ✅ Contact detail view

### Phase 2: Pipeline (Week 3-4)
- ✅ Deal creation and editing
- ✅ Pipeline board with 5 default stages
- ✅ Drag-and-drop between stages
- ✅ Value and probability tracking

### Phase 3: Tasks & Activities (Week 5-6)
- ✅ Task creation and management
- ✅ Activity logging (calls, emails, notes)
- ✅ Due date tracking
- ✅ Overdue notifications

### Phase 4: Dashboard & Reports (Week 7-8)
- ✅ Key metrics dashboard
- ✅ Revenue tracking (NOK)
- ✅ Conversion funnel
- ✅ Activity reports

### NOT in MVP:
- ❌ Multi-user (single user for MVP)
- ❌ Email integration (manual logging only)
- ❌ SMS integration
- ❌ External API
- ❌ Advanced automation
- ❌ Custom fields UI (hardcoded for now)
- ❌ File attachments

## 90-Day Roadmap

### Month 1: MVP Foundation
**Week 1-2**: Core CRM
- Contact CRUD
- Norwegian UI
- Basic search/filter

**Week 3-4**: Sales Pipeline
- Pipeline board
- Deal management
- Drag-and-drop

### Month 2: Productivity & Insights
**Week 5-6**: Tasks & Communication
- Task management
- Activity logging
- Timeline view

**Week 7-8**: Reporting
- Dashboard
- Revenue reports
- Export functionality (GDPR)

### Month 3: Polish & Scale Prep
**Week 9-10**: UX Refinement
- Mobile optimization
- Performance tuning
- User testing feedback

**Week 11-12**: Scale Foundation
- Multi-user architecture prep
- API design (no implementation)
- Security hardening
- GDPR compliance audit

## Security & GDPR Notes

### Data Protection
- ✅ All data stored in EU-compliant Spark KV store
- ✅ No third-party data transmission in MVP
- ✅ Client-side encryption ready
- ✅ Export all data as JSON/CSV
- ✅ Soft delete with 30-day retention
- ✅ Right to be forgotten: hard delete function

### GDPR Compliance Checklist
- [ ] Privacy policy page (content needed)
- [x] Data export functionality
- [x] Data deletion functionality
- [ ] Consent tracking for marketing contacts
- [x] Activity logging (audit trail)
- [ ] Data processing agreement template
- [ ] Cookie consent (if analytics added)

### Security Best Practices
- Input validation on all forms
- XSS prevention (React default)
- No sensitive data in localStorage (using Spark KV)
- Rate limiting (future API)
- Secure authentication (Spark handles)
- HTTPS only (deployment requirement)

## API Design (Future Implementation)

### REST Endpoints (Planned)
```
POST   /api/v1/contacts
GET    /api/v1/contacts
GET    /api/v1/contacts/:id
PUT    /api/v1/contacts/:id
DELETE /api/v1/contacts/:id

POST   /api/v1/deals
GET    /api/v1/deals
PUT    /api/v1/deals/:id/stage
PUT    /api/v1/deals/:id/close

POST   /api/v1/activities
GET    /api/v1/activities?contactId=:id

POST   /api/v1/tasks
GET    /api/v1/tasks?status=pending
PATCH  /api/v1/tasks/:id/complete

GET    /api/v1/reports/dashboard
GET    /api/v1/reports/pipeline
GET    /api/v1/reports/revenue

POST   /api/v1/export (GDPR export)
```

### Webhooks (Planned)
```
deal.created
deal.stage_changed
deal.won
deal.lost
contact.created
contact.status_changed
task.due
task.overdue
```

## Technology Stack

**Frontend Framework**: React 19 + TypeScript
**Styling**: Tailwind CSS 4 + shadcn/ui v4
**Icons**: Phosphor Icons
**Animation**: Framer Motion
**Charts**: Recharts
**Forms**: React Hook Form + Zod
**Date Handling**: date-fns (with nb-NO locale)
**State Management**: React Hooks + useKV
**Build Tool**: Vite
**Type Safety**: TypeScript strict mode
**Linting**: ESLint + TypeScript ESLint

## Localization

Primary language: Norwegian (Bokmål)
- All UI text in Norwegian
- Date formats: dd.MM.yyyy
- Currency: NOK (kr)
- Number format: 1 234,56
- First day of week: Monday
