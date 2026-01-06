# Norwegian CRM System - Product Requirements Document

A practical, GDPR-compliant CRM system designed for Norwegian SMEs to manage customer relationships from first contact through to closure and follow-up.

**Experience Qualities**:
1. **Efficient** - Minimal clicks to complete tasks, streamlined workflows that respect busy salespeople's time
2. **Trustworthy** - GDPR-compliant data handling, secure storage, transparent data practices that build confidence
3. **Clear** - Norwegian-first interface with intuitive organization that requires minimal training

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-tenant CRM with customer management, pipeline tracking, task management, communication logging, and reporting - requiring multiple interconnected views and sophisticated state management.

## Core Requirements Alignment

This CRM system fulfills all essential CRM requirements including:

### 1. قاعدة بيانات العملاء (Contacts & Accounts Database) ✓
- Comprehensive contact management with companies (B2B support)
- Unified timeline for all events: calls, emails, meetings, notes, files
- Tags + custom fields + powerful search + filtering + smart lists (segments)
- Full relationship mapping between contacts and deals

### 2. إدارة الفرص/المبيعات (Deals / Sales Pipeline Management) ✓
- Customizable pipeline with drag-and-drop stages
- Deal value + currency (NOK) + closing probability + expected date
- Win/loss reasons + notes + attachments
- Deal activity tracking: last contact, next required action, owner assignment

### 3. المهام والمتابعة (Tasks & Follow-up) ✓
- Tasks linked to customers/deals
- Assignment + due dates + reminders + recurring tasks + daily lists per employee
- SLA/alerts for overdue tasks

### 4. الاستحواذ على Leads (Lead Capture) ✓
- Web forms + CSV import + API/Webhooks
- Duplicate prevention + merge/deduplication capabilities
- Automatic lead assignment (configurable)

### 5. التواصل وتسجيله (Communications Logging) ✓
- Email integration (send/receive with full logging)
- Call/meeting/note logging with outcomes
- Email and message templates with variables

### 6. الأتمتة (Automation / Workflows) ✓
- Triggers (new lead / stage changed / date approaching)
- Conditional logic with If/Else + time delays + sequential steps
- Automatic follow-up and reminders
- User-friendly interface (no coding required)

### 7. التقارير (Reporting) ✓
- Leads by source
- Conversion rates per stage
- User activity metrics
- Revenue/Forecast tracking
- CSV export capability

### 8. الصلاحيات والأمان (Security & Permissions) ✓
- Roles & Permissions (Admin / User / Manager via API keys)
- Comprehensive permission system (read/write/delete/admin)
- Audit logging for all API activities
- Secure data storage with backup capabilities
- **Password Reset**: Self-service password reset via email verification token
- **Email Verification**: Email verification system for new team members with resend capability
- **Authentication Security**: Token-based authentication with expiration

### Authentication & User Management
- **Functionality**: Secure login system with password reset, email verification, and multi-factor authentication support; role-based access control with team member management
- **Purpose**: Ensure secure access to CRM data while maintaining user convenience and account recovery options
- **Trigger**: User navigates to login page, clicks "Forgot password?", or new team member receives invitation
- **Progression**: 
  - **Login**: Enter email/password → Validate credentials → Check email verification status → Access CRM
  - **Password Reset**: Click "Forgot password?" → Enter email → Receive reset link (console in demo) → Click link → Enter new password → Confirm password → Reset successful → Return to login
  - **Email Verification**: Receive invitation email → Click verification link → Email verified → Access granted → Verification banner removed
  - **New Member Onboarding**: Admin invites member → System generates verification token → Member receives email → Verifies email → Sets password → Access granted
- **Success criteria**:
  - Password reset tokens expire after 1 hour
  - Email verification tokens expire after 24 hours
  - Unverified users see banner with resend option
  - Admin can view verification status in team management
  - Reset/verification links logged to console in demo mode
  - Token validation prevents expired/invalid links
  - Demo accounts: admin and manager verified, sales unverified (for testing)
  - All authentication flows fully translatable (Norwegian/English)

### 9. قابلية التوسع والاعتماد (Scalability & Reliability) ✓
- Fast performance + mobile-friendly responsive design
- REST API + Webhooks for external integrations
- Full Import/Export functionality (CSV)
- Interactive API playground and comprehensive documentation

## Essential Features

### Contact & Lead Management
- **Functionality**: Create, edit, delete, and categorize customer records with full interaction history
- **Purpose**: Central hub for all customer information and relationship tracking
- **Trigger**: User clicks "Ny kontakt" button or imports contacts
- **Progression**: Click add → Fill form (name, email, phone, company, status, tags) → Save → View in list → Click to see details → Log interactions
- **Success criteria**: All contact data persists, status updates reflect in pipeline, interaction history displays chronologically

### Sales Pipeline (Salgstrakt)
- **Functionality**: Visual pipeline with customizable stages, drag-and-drop deal movement, value tracking
- **Purpose**: Visualize sales progress and identify bottlenecks
- **Trigger**: User navigates to pipeline view or drags a deal card
- **Progression**: View pipeline → See deals by stage → Drag deal to new stage → Update probability/value → Set follow-up date → Auto-notify
- **Success criteria**: Real-time updates, accurate deal values per stage, follow-up tasks auto-created

### Task Management (Oppgaver)
- **Functionality**: Create to-dos linked to contacts, set reminders, track completion
- **Purpose**: Never miss a follow-up or important action
- **Trigger**: User adds task from contact page or task view, or system auto-creates from pipeline
- **Progression**: Create task → Link to contact → Set due date → Receive reminder → Mark complete → Logs to history
- **Success criteria**: Overdue tasks highlighted, reminders delivered, completion tracked per user

### Communication Hub & Activity Logging
- **Functionality**: Comprehensive activity logging for calls, emails, meetings, and notes linked to deals and contacts; complete interaction timeline with filtering and search
- **Purpose**: Maintain full context of customer relationships and sales activities with detailed tracking
- **Trigger**: User clicks "Logg aktivitet" from deal detail view or contact page
- **Progression**: Select type (call/email/meeting/note) → Add subject → Set duration → Choose outcome → Add notes → Save → Appears in timeline with visual indicators
- **Success criteria**: 
  - All interactions timestamped and linked to both contact and deal
  - Activities searchable and filterable by type
  - Timeline displays with color-coded activity types (blue=call, purple=email, green=meeting, gray=note)
  - Outcome tracking (successful, follow-up needed, no answer, voicemail, scheduled meeting, not interested)
  - Duration tracking in minutes for time management
  - Weekly activity metrics visible in dashboard
  - Activity counts per deal visible in deal detail view

### Email Integration
- **Functionality**: Complete email management system with compose, send, track, and template management capabilities directly within the CRM; file attachment support with drag-and-drop upload, comprehensive file type validation, and size restrictions; email scheduling with recurring patterns (daily, weekly, monthly)
- **Purpose**: Centralize email communication with customers, track engagement, and maintain email history alongside other interactions; enable sending documents, proposals, and files directly from CRM with security controls; automate recurring communications
- **Trigger**: User clicks "Send e-post" button from contact detail, deal detail, or dedicated emails view
- **Progression**: Click send email → Fill recipient/subject/body → Attach files (drag-drop or click) → Preview attachments with file type badges → Enable tracking → Choose send now or schedule → (If scheduling) Select date/time → (Optional) Enable recurrence → Select pattern (daily/weekly/monthly) → Set interval → Choose end condition (never/date/after X occurrences) → Schedule/Send → Email tracked → Opens/clicks recorded → Activities auto-logged
- **Success criteria**:
  - Emails sent with automatic tracking of opens and clicks
  - Email history visible per contact and per deal with filtering
  - Email templates for common scenarios (follow-up, proposal, meeting confirmation)
  - Template management with categories and quick-use functionality
  - Auto-logging of email activities (sent, opened, clicked) to timeline
  - Visual email status indicators (scheduled, sent, delivered, opened, clicked, failed)
  - Email performance metrics on dashboard (sent count, open rate, click rate)
  - Cc/Bcc support with validation
  - Save-as-template option during compose
  - Email search across all communications
  - Email scheduling functionality:
    - Schedule emails for specific date and time in the future
    - Validation prevents scheduling in the past (minimum 5 minutes ahead)
    - Scheduled status badge with scheduled time display
    - Automatic sending when scheduled time arrives (checked every 30 seconds)
    - Cancel scheduled emails before sending
    - View all scheduled emails in history with distinctive visual treatment
    - Scheduled emails convert to sent status at scheduled time
    - Activities logged when scheduled email is sent
  - Recurring email patterns:
    - Support for daily, weekly, and monthly recurrence
    - Configurable interval (e.g., every 2 days, every 3 weeks)
    - Multiple end conditions:
      - Never (continues indefinitely until manually stopped)
      - End date (stop after specific date)
      - After N occurrences (e.g., send 5 times then stop)
    - Visual preview of recurrence pattern in Norwegian
    - Automatic calculation of next scheduled send time
    - Series tracking showing occurrence count
    - Separate visual treatment for recurring vs one-time scheduled emails
    - Stop/cancel recurring series with single action
    - Parent-child relationship tracking for recurring email instances
    - Each sent occurrence logged as separate email with tracking
    - Recurring emails shown in dedicated section with purple badges
    - Display next send time and series progress
  - File attachment support with drag-and-drop interface
  - Multiple file uploads with comprehensive validation:
    - Maximum 10 MB per individual file
    - Maximum 25 MB total attachment size per email
    - Maximum 10 attachments per email
    - File type restrictions enforced (PDF, Word, Excel, PowerPoint, TXT, CSV, images, ZIP/RAR/7Z)
    - Real-time file type detection using MIME types and extensions
    - Clear error messages for rejected files
    - Warning indicator when approaching size limits (80% threshold)
  - Attachment preview in email composer with file type badges
  - Remove individual attachments or clear all functionality
  - File size display in KB/MB/GB format
  - Attachment counter showing used/available slots
  - Info popover explaining all restrictions
  - Attachment display in email history with download functionality
  - Visual file type indicators with categorized icons (Document/Image/Archive)
  - Email template personalization with variables:
    - Insert template variables using `{variableName}` syntax
    - Available variables: firstName, lastName, fullName, email, phone, company, status, value, today
    - Visual variable inserter component with search and descriptions
    - Automatic replacement with contact data when email is sent
    - Preview functionality showing how variables will be replaced
    - Works in both subject and body fields
    - Preview uses actual contact data if available, otherwise shows example data
    - Template manager includes variable support with preview
    - Norwegian variable names and descriptions
    - Fallback placeholders for missing data (e.g., [Fornavn] if firstName is empty)
  - Custom template variable definitions:
    - Create custom variables beyond system defaults (e.g., {prosjektnavn}, {referansenummer})
    - Each custom variable has: unique key, display label, description, and example value
    - Key validation prevents conflicts with system variables and duplicates
    - Full CRUD operations (create, edit, delete) for custom variables
    - Variable key restrictions: alphanumeric + underscore, must start with letter
    - Variables displayed in composer variable inserter alongside system variables
    - Import/Export functionality:
      - Export all custom variables to JSON file for backup or sharing
      - JSON includes metadata (version, export timestamp) and variable definitions
      - Import variables from JSON file with duplicate detection
      - Duplicate variables automatically skipped with clear user feedback
      - Imported variables assigned new IDs and timestamps
      - Import validation checks for required fields and proper JSON format
      - Success messages indicate import count and skipped duplicates
      - Dropdown menu interface for import/export actions
      - Export filename includes timestamp for organization
      - Hidden file input triggered programmatically for clean UX

### Reporting Dashboard
- **Functionality**: Visual reports on leads, deals, revenue, team performance, and email metrics
- **Purpose**: Data-driven decision making and performance tracking
- **Trigger**: User navigates to dashboard or reports section
- **Progression**: View dashboard → See key metrics → Filter by date/user → Export data → Analyze trends
- **Success criteria**: Accurate calculations, real-time data, NOK currency formatting, email engagement metrics

### Language & Localization
- **Functionality**: Full bilingual support (Norwegian/English) with persistent language preference stored across browser sessions
- **Purpose**: Serve both Norwegian users and English-speaking customers; remember user preference for better UX
- **Trigger**: User clicks language switcher in footer or first loads application
- **Progression**: Click language dropdown → Select Norwegian or English → UI updates instantly → Language preference saved → Return later → Language preference remembered
- **Success criteria**:
  - Complete translation coverage for Norwegian (Bokmål) and English
  - Language preference persists using useKV storage (key: 'app-language')
  - Instant UI updates when language changes (no page reload)
  - Language switcher visible in footer with flag indicators (🇳🇴/🇬🇧)
  - Current language indicated with checkmark in dropdown
  - All components use language context for translations
  - Default language is Norwegian ('no')
  - Translation coverage includes: navigation, forms, buttons, status labels, error messages, success notifications, email templates, API documentation
  - Language setting survives browser sessions, tab closures, and page refreshes

### Data Import & Export
- **Functionality**: Import contacts and deals from CSV files with full validation and error reporting; export all data to CSV for backup and portability
- **Purpose**: Enable bulk data entry, migration from other systems, and GDPR-compliant data portability
- **Trigger**: User clicks import/export buttons in contacts or pipeline views
- **Progression**:
  - Import: Click import → Download template (optional) → Drag-drop or browse CSV file → System validates and parses → Preview errors → Confirm import → Records created
  - Export: Click export → CSV file downloads with all data
- **Success criteria**:
  - CSV import supports contacts with required fields (firstName, lastName) and optional fields (email, phone, company, status, tags, value, source, assignedTo, notes)
  - CSV import supports deals with required fields (title, contactId, stage, value) and optional fields (probability, expectedCloseDate, description, assignedTo)
  - Contact import validates email format and prevents duplicates by email
  - Deal import validates contactId existence and can match by email if ID not provided
  - Deal import validates contact relationships
  - Status field validation ensures only valid values (lead, prospect, customer, lost)
  - Clear error messages with row numbers for validation failures
  - Import dialog shows success/error summary with counts
  - Skipped rows displayed with reasons
  - Template download provides example format with all fields
  - Export preserves all data including tags (semicolon-separated) and relationships
  - Deal export includes contact information (name, email, company) for reference
  - Import dialog supports drag-and-drop and file browser
  - File type validation (CSV only)
  - Import progress indication
  - Ability to import another file after completion without closing dialog
  - Norwegian and English translations for all import/export UI

### API & External Integrations
- **Functionality**: Complete API management system with API keys, webhooks, external service integrations, interactive API playground, authentication testing, and comprehensive documentation; supports SMTP, SMS, accounting systems, calendar, and custom integrations
- **Purpose**: Enable seamless integration with external systems, automate workflows, extend CRM functionality through third-party services, provide developers with tools to test and validate API requests, and ensure proper permission enforcement through comprehensive authentication testing
- **Trigger**: User navigates to API section from main navigation
- **Progression**: 
  - API Keys: Create key → Set permissions (read/write/delete/admin) → Set expiry → Copy key → Use in external systems → Revoke when needed
  - Webhooks: Create webhook → Enter URL → Select events to listen to → Get secret key → Test webhook → View logs → Monitor failures
  - Integrations: Choose type (SMTP/SMS/Accounting/Calendar) → Select provider → Configure credentials → Test connection → Activate → Sync data
  - Auth Testing: Select API key → View key permissions summary → Run individual endpoint test → View expected vs actual outcome → Run full test suite → Review pass/fail statistics → Expand results for detailed inspection → Clear results
  - API Playground: Select endpoint → Add API key → Configure parameters/body → Execute request → View response with status/time → Copy cURL command → Test different endpoints
  - Documentation: Browse API docs → View endpoint details → Copy code examples → Understand authentication → Review error codes
- **Success criteria**:
  - API keys generated with secure random strings (40 chars + prefix)
  - Keys can be revoked or deleted independently
  - Permission system enforces access control (read, write, delete, admin)
  - Optional expiry dates with automatic deactivation
  - Last used timestamp tracking
  - Webhooks support 12+ event types (contact/deal/task/email lifecycle)
  - Webhook delivery logs with status codes and response times
  - Failure count tracking with visual indicators
  - Test webhook functionality sends mock payload
  - Secret keys for webhook signature verification
  - SMTP integration with configurable host, port, TLS, credentials
  - SMS integration with API key and sender ID configuration
  - Integration sync status tracking (success/failed with timestamps)
  - Active/inactive toggle for all integrations
  - Interactive API playground with:
    - 14+ pre-configured endpoints across contacts, deals, tasks, and emails
    - Method selection (GET/POST/PUT/PATCH/DELETE) with color-coded badges
    - API key input with password masking
    - Dynamic path parameter input for :id routes
    - Query parameter builder with inline documentation
    - Request body editor for POST/PUT/PATCH with pre-filled examples
    - Real-time response display with JSON formatting
    - HTTP status code display with success/error indicators
    - Response time tracking in milliseconds
    - Copy-to-clipboard for responses
    - Auto-generated cURL command for each request
    - Two-panel layout: request configuration | response/cURL
    - Category-based endpoint organization in dropdown
    - Mock response simulation for testing without live API
  - Authentication testing system with:
    - 12+ pre-configured test scenarios covering all resources (contacts, deals, tasks, emails, webhooks, reports)
    - Support for testing both global permissions and resource-specific permissions
    - Automatic permission validation against API key configuration
    - Expected outcome prediction (success/forbidden/unauthorized) based on key permissions
    - Actual vs expected outcome comparison for test validation
    - Individual test execution for specific endpoints
    - Bulk test execution for comprehensive validation (all 12 tests)
    - Real-time simulated API requests with realistic delays (300-700ms)
    - Test result tracking with timestamp, status code, and detailed messages
    - Pass/fail statistics with visual indicators (green checkmark, red X)
    - Expandable/collapsible result cards for detailed inspection
    - Color-coded outcome badges (success=green, forbidden=red, unauthorized=red, error=yellow)
    - Active key filtering (only show usable API keys)
    - Key details summary showing permissions, expiry, rate limits
    - Resource permission breakdown for granular keys
    - Test scenarios include: read/write/delete operations across all resources
    - Norwegian language interface for all labels and messages
    - Mobile-responsive layout with scrollable test lists
    - Clear test result messages explaining outcomes
    - Visual distinction between test passes and failures
    - Support for expired keys (401 Unauthorized)
    - Support for insufficient permissions (403 Forbidden)
    - Result persistence during session until manually cleared
  - Comprehensive API documentation in Norwegian
  - Rate limiting documentation (1000 req/hour)
  - Clear error codes and troubleshooting guide
  - All data persists using useKV
  - Visual status indicators (active/inactive, success/failed)
  - Copy-to-clipboard for API keys and secrets
  - Mobile-responsive tabs and cards

### Team Management & Role-Based Access Control
- **Functionality**: Complete team member management with role-based permissions (Admin, Manager, Sales); invite team members, assign roles, manage permissions, activate/deactivate accounts
- **Purpose**: Enable multi-user collaboration with appropriate access controls; ensure data security and proper workflow delegation
- **Trigger**: User navigates to Team section from main navigation
- **Progression**: 
  - View team: See all team members with roles and status → Search/filter members
  - Add member: Click add member → Fill form (name, email, role, phone, title, department) → Select role → Save → Member invited
  - Edit member: Click edit → Modify details → Change role if needed → Save → Member updated
  - Manage permissions: Click view permissions → See role-based permission matrix → Understand what each role can do
  - Activate/Deactivate: Toggle active status → Member access granted/revoked → Status updated
  - Remove member: Click remove → Confirm → Member removed from team
- **Success criteria**:
  - Three distinct roles with different permission levels:
    - **Admin**: Full access to all features (contacts, deals, tasks, emails, reports, API, team management)
    - **Manager**: View all data, manage team, limited delete permissions, no role changes
    - **Sales**: Manage own contacts/deals/tasks, no access to API or team management
  - Comprehensive permission system covering 7 resource types:
    - Contacts: view, create, edit, delete, viewAll, exportData, importData
    - Deals: view, create, edit, delete, viewAll, reassign
    - Tasks: view, create, edit, delete, viewAll, reassign
    - Emails: view, send, viewAll, manageTemplates
    - Reports: view, viewAll, export
    - API: view, manage
    - Team: view, invite, edit, remove, changeRoles
  - Role permissions displayed in visual matrix with checkmarks/X indicators
  - Team member cards show:
    - Avatar with initials
    - Full name and email
    - Role badge with color coding (Admin=red, Manager=green, Sales=gray)
    - Job title and department
    - Active/inactive status with icon
  - Email uniqueness validation prevents duplicate accounts
  - Search functionality filters by name, email, department, or title
  - Empty state with helpful guidance for first team member
  - All data persists using useKV ('team-members' key)
  - Norwegian and English translations for all UI elements
  - Mobile-responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
  - Inline actions: edit, toggle active, view permissions, remove
  - Role descriptions help users understand permission levels
  - Account activation/deactivation without deletion
  - Timestamps for invited date and last active
  - Toast notifications for all actions (created, updated, removed, activated, deactivated)

## Edge Case Handling
- **Empty States**: Helpful onboarding messages with action buttons when no contacts/deals exist
- **Duplicate Contacts**: Warning when email/phone matches existing contact during manual entry and CSV import
- **Data Export**: Full CSV export capability for GDPR compliance and portability
- **Data Import**: CSV import with comprehensive validation, error reporting, and duplicate detection
- **Invalid CSV Data**: Row-by-row validation with clear error messages indicating field and issue
- **Missing Required Fields**: Import skips invalid rows and reports missing required fields
- **Malformed CSV**: Parser handles quoted fields, commas in values, and various CSV formats
- **Offline State**: Clear messaging when connection lost, queue actions for retry
- **Invalid Data**: Inline validation with Norwegian error messages before submission
- **Deleted Items**: Soft delete with 30-day recovery window before permanent removal

## Design Direction
Professional yet approachable - evoking trust, efficiency, and Nordic simplicity. The design should feel like a well-organized workspace where everything has its place. Clean layouts with purposeful use of color to highlight status and priority. Should feel modern but not trendy, stable but not boring.

## Color Selection
A Norwegian-inspired palette combining professional blues with natural warmth.

- **Primary Color**: Deep fjord blue `oklch(0.45 0.12 250)` - Professional, trustworthy, stable for primary actions
- **Secondary Colors**: 
  - Light ice blue `oklch(0.96 0.02 250)` for backgrounds and subtle containers
  - Slate gray `oklch(0.55 0.02 250)` for secondary text and borders
- **Accent Color**: Aurora green `oklch(0.65 0.15 160)` - Success states, positive actions, closed deals
- **Status Colors**:
  - Lead: Amber `oklch(0.75 0.15 80)` 
  - Prospect: Sky blue `oklch(0.70 0.12 230)`
  - Customer: Aurora green `oklch(0.65 0.15 160)`
  - Lost: Muted red `oklch(0.60 0.15 25)`
- **Foreground/Background Pairings**:
  - Primary (Deep blue): White text `oklch(1 0 0)` - Ratio 7.2:1 ✓
  - Accent (Aurora green): White text `oklch(1 0 0)` - Ratio 4.9:1 ✓
  - Background (White): Foreground `oklch(0.20 0.01 250)` - Ratio 14.1:1 ✓
  - Muted backgrounds: Dark gray `oklch(0.30 0.02 250)` - Ratio 9.5:1 ✓

## Font Selection
Typography should convey professionalism and excellent readability for data-dense interfaces, with clear distinction between headings and content.

- **Typographic Hierarchy**:
  - H1 (Page titles): Inter Bold / 32px / -0.02em / leading-tight - Main section headers
  - H2 (Section headers): Inter Semibold / 24px / -0.01em / leading-snug - Card headers, modal titles
  - H3 (Subsections): Inter Semibold / 18px / 0 / leading-normal - List headers, form sections
  - Body (Content): Inter Regular / 15px / 0 / leading-relaxed - Main content, descriptions
  - Small (Meta): Inter Medium / 13px / 0 / leading-normal - Timestamps, labels, status badges
  - Mono (Data): JetBrains Mono Regular / 14px / 0 / leading-normal - Currency, IDs, technical data

## Animations
Animations should feel purposeful and efficient - reinforcing actions without slowing workflow. Use subtle motion to guide attention during state changes (deal moving in pipeline, task completion, status updates). Card interactions should have gentle hover lifts. Transitions between views should be quick fades (200-250ms) to maintain context. Success actions deserve a brief celebratory micro-interaction (checkmark animation, gentle scale). Error states should have a subtle shake. Overall: smooth, quick, and professional.

## Component Selection
- **Components**:
  - Card: Contact cards, deal cards, metric cards with subtle shadows and hover states
  - Dialog: Full-featured forms for adding/editing contacts and deals
  - Sheet: Side panel for quick contact details and activity logging
  - Table: Contact lists with sorting, filtering, responsive column hiding on mobile
  - Tabs: Switch between contact info, activities, deals, tasks
  - Badge: Status indicators with color coding, tags with remove option
  - Select: Status dropdowns, stage selectors, user assignment
  - Input: Form fields with floating labels, Norwegian placeholders
  - Textarea: Notes and descriptions with auto-grow
  - Calendar: Date pickers for follow-ups with date-fns Norwegian locale
  - Button: Primary actions (deep blue), secondary (light), destructive (red tint)
  - Avatar: User identifiers in task assignments and activity logs
  - Progress: Deal probability indicators, pipeline stage fill
  - Separator: Visual section breaks in forms and panels
  - Popover: Quick actions menu, status change dropdowns
  - Command: Quick search for contacts (Cmd+K)
  
- **Customizations**:
  - Pipeline board: Custom drag-drop columns using framer-motion, deal cards with value/probability
  - Activity timeline: Custom component with vertical line, icons per type, chronological layout
  - Metric cards: Custom with trend indicators (up/down arrows), sparkline charts using recharts
  - Contact quick-add: Floating action button with morphing form sheet

- **States**:
  - Buttons: Rest (solid), hover (lift shadow + brightness), active (pressed down), loading (spinner), disabled (muted)
  - Inputs: Empty, filled, focused (blue ring), error (red border + message), success (green check)
  - Cards: Default, hover (lift), selected (blue border), dragging (elevated shadow, 50% opacity)
  - Badges: Static (status color background), interactive (hover darken, remove X on hover)

- **Icon Selection**: Phosphor Icons throughout
  - Plus: Add actions
  - MagnifyingGlass: Search
  - Funnel: Filters
  - Phone, Envelope, ChatCircle: Communication types
  - Check, X: Actions and status
  - Calendar: Dates and scheduling
  - ChartBar: Reports
  - Users: Contacts
  - Target: Pipeline/deals
  - ListChecks: Tasks

- **Spacing**: 
  - Component gaps: gap-3 (12px), gap-4 (16px), gap-6 (24px)
  - Section padding: p-6 (24px) desktop, p-4 (16px) mobile
  - Card padding: p-5 (20px)
  - Form fields: space-y-4 (16px between fields)
  - Page margins: max-w-7xl mx-auto with px-4 guards

- **Mobile**:
  - Top navigation collapses to hamburger menu below 768px
  - Pipeline switches from horizontal columns to vertical swimlanes
  - Tables hide secondary columns, show expand button for full details
  - Forms stack to single column
  - FAB (floating action button) for quick add on mobile
  - Bottom sheet instead of dialog for forms on mobile
  - Swipe gestures: swipe left on contact card reveals quick actions
