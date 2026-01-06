# 🇳🇴 Norwegian CRM System

> **Et komplett, GDPR-kompatibelt CRM-system designet for norske SMB-bedrifter**

A production-ready Customer Relationship Management system built with React, TypeScript, and modern web technologies. Fully bilingual (Norwegian/English) with comprehensive features for contact management, sales pipeline, task tracking, email automation, and external integrations.

---

## ✨ Key Features

### 📇 Contact & Lead Management
- **Comprehensive Contact Database**: Store contacts with full details (name, email, phone, company, status, tags)
- **B2B Support**: Company tracking and relationship management
- **Custom Fields & Tags**: Flexible categorization system
- **Activity Timeline**: Unified view of all interactions (calls, emails, meetings, notes)
- **Smart Search & Filtering**: Real-time search across all contact fields
- **CSV Import/Export**: Bulk data operations with validation and duplicate prevention

### 💼 Sales Pipeline Management
- **Visual Pipeline**: Drag-and-drop kanban board with smooth animations
- **Customizable Stages**: Default Norwegian stages (Kontakt → Kvalifisering → Tilbud → Forhandling → Won/Lost)
- **Deal Tracking**: Value (NOK), probability, expected close date, owner assignment
- **Win/Loss Analysis**: Track reasons for won/lost deals
- **Advanced Filtering**: Filter by value range, date range, contact, or search text
- **Deal Activity Logging**: Complete interaction history per deal

### ✅ Task Management
- **Task Types**: Call, Email, Meeting, Follow-up, Other
- **Priority Levels**: Low, Medium, High with visual indicators
- **Due Date Tracking**: Automatic overdue detection with alerts
- **Linked Tasks**: Connect tasks to contacts and deals
- **Assignment & Ownership**: Assign tasks to team members
- **Completion Tracking**: Track completed tasks with timestamps

### 📧 Advanced Email System
- **Email Composer**: Full-featured composer with rich text editing
- **Email Templates**: Library of reusable templates with categories
- **Template Variables**: System variables (firstName, company, etc.) + custom user-defined variables
- **Variable Preview**: See how emails will look before sending
- **File Attachments**: Drag-and-drop upload with validation (10 files max, 25 MB total)
- **Email Scheduling**: Schedule emails for future sending (date + time picker)
- **Recurring Emails**: Daily, weekly, monthly patterns with flexible end conditions
- **Email Tracking**: Track opens, clicks, and engagement metrics
- **CC/BCC Support**: Full recipient management
- **Email History**: Complete email log per contact and deal

### 🔌 API & Integrations
- **REST API**: 14+ endpoints for full CRM control
- **API Key Management**: Granular permissions (read/write/delete/admin) per resource
- **Resource-Level Permissions**: Control access to contacts, deals, tasks, emails, webhooks, reports
- **API Playground**: Interactive testing tool with request/response viewer
- **Authentication Testing**: Comprehensive permission validation tool
- **Webhooks**: 12+ event types for real-time integrations
- **External Integrations**: SMTP, SMS, Accounting (Unimicro/Fiken ready), Calendar
- **Webhook Logs**: Delivery tracking with success/failure monitoring
- **Rate Limiting**: 1000 requests/hour per key

### 📊 Reporting & Analytics
- **Dashboard**: Real-time metrics (contacts, deals, revenue, conversion rate)
- **Activity Metrics**: Track calls, emails, meetings per week
- **Email Performance**: Open rates, click rates, engagement tracking
- **Deal Analytics**: Average deal value, pipeline value, win/loss ratios
- **Task Overview**: Pending tasks, overdue alerts
- **Integration Status**: Monitor external service sync status

### 🌐 Internationalization
- **Bilingual Support**: Norwegian (Bokmål) and English
- **Language Persistence**: User preference saved across sessions
- **Instant Switching**: Change language without page reload
- **Complete Coverage**: All UI strings, error messages, notifications translated
- **Norwegian-First Design**: Built for the Norwegian market with NOK currency

### 🔒 Security & Compliance
- **GDPR Compliant**: EU data storage, full data export capability
- **API Security**: Secure key generation, expiry dates, IP whitelisting
- **Audit Logging**: Track all API activities and webhook deliveries
- **Permission System**: Granular access control per resource
- **Data Backup**: CSV export for regular backups
- **Data Portability**: Full import/export functionality

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 18+ (for development)

### Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

---

## 📖 Documentation

### User Guides
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Comprehensive user guide in Norwegian and English
- **[FEATURES_COMPARISON.md](./FEATURES_COMPARISON.md)** - Detailed feature mapping and implementation status
- **[PRD.md](./PRD.md)** - Product Requirements Document with design principles

### Technical Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and data models
- **[SECURITY.md](./SECURITY.md)** - Security practices and guidelines

### API Documentation
Access the interactive API documentation in the app:
1. Navigate to the **API** section
2. Click on the **Documentation** tab
3. Browse endpoints, code examples, and authentication details

---

## 🎯 Core Workflows

### Adding a Contact
1. Click **Kontakter** (Contacts) in the navigation
2. Click **Ny kontakt** (New contact)
3. Fill in first name, last name, and optional details
4. Add tags for categorization
5. Save contact

### Creating a Deal
1. Click **Pipeline** in the navigation
2. Click **Ny deal** (New deal)
3. Select contact, enter title and value
4. Set stage, probability, and expected close date
5. Create deal
6. Drag-and-drop between stages as deal progresses

### Sending an Email
1. Click **E-post** (Emails) in the navigation
2. Click **Send e-post** (Send email)
3. Select recipient (contact)
4. Write subject and message
5. Optional: Add attachments, use template, insert variables
6. Send immediately or schedule for later

### Setting Up Webhooks
1. Click **API** in the navigation
2. Go to **Webhooks** tab
3. Click **Opprett webhook** (Create webhook)
4. Enter name, URL, and select events
5. Copy secret key for signature verification
6. Test webhook with mock payload
7. Activate webhook

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with custom theme
- **Components**: shadcn/ui v4 (40+ components)
- **Icons**: Phosphor Icons (2000+ icons)
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **State**: React Hooks + Spark useKV

### Data & Storage
- **Persistence**: Spark KV Store (key-value storage)
- **Storage Location**: EU-compliant (GDPR ready)
- **Export Format**: CSV (Excel/Google Sheets compatible)

### Build Tools
- **Build**: Vite 7
- **Type Checking**: TypeScript 5.7
- **Linting**: ESLint with React plugins

---

## 📦 Data Import/Export

### CSV Import Format

**Contacts:**
```csv
firstName,lastName,email,phone,company,status,tags,value,source,notes
Ole,Nordmann,ole@example.no,91234567,Acme AS,lead,"kunde;b2b",50000,Nettside,Første kontakt
```

**Deals:**
```csv
title,contactId,stage,value,probability,expectedCloseDate,description,assignedTo
Konsulentavtale,abc123,tilbud,150000,75,2024-12-31,Årlig konsulentavtale,user1
```

### CSV Export
- All contacts with full data including tags and relationships
- All deals with contact information and activity counts
- All data preserved for backup and analysis

---

## 🔐 Security Features

### API Key Management
- **Permission Levels**: Read, Write, Delete, Admin
- **Resource Permissions**: Contacts, Deals, Tasks, Emails, Webhooks, Reports
- **Rate Limiting**: 1000 requests/hour per key
- **Expiry Dates**: Optional automatic key expiration
- **IP Whitelisting**: Restrict key usage by IP address
- **Usage Tracking**: Last used timestamp per key

### Webhooks Security
- **Secret Keys**: HMAC signature verification
- **Delivery Logs**: Full audit trail with status codes
- **Failure Tracking**: Automatic retry and error monitoring
- **Event Filtering**: Subscribe to specific events only

---

## 🌍 Internationalization

### Supported Languages
- **Norwegian (Bokmål)**: Primary language, complete coverage
- **English**: Full translation coverage

### Language Features
- Persistent language preference (saved in Spark KV)
- Instant language switching (no reload required)
- Language indicator in footer
- All UI elements, error messages, and notifications translated
- Norwegian date formats and NOK currency formatting

---

## 📊 Metrics & Analytics

### Dashboard Metrics
- Total contacts, deals, revenue
- Open deals count and value
- Won/lost deal counts
- Average deal value
- Conversion rate (won deals / total deals)
- Pending tasks count
- Activity counts (calls, emails, meetings)
- Email performance (open rate, click rate)

### Email Tracking
- **Status Tracking**: Draft, Scheduled, Sent, Delivered, Opened, Clicked, Failed
- **Engagement Metrics**: Open count, click count per email
- **Performance Metrics**: Open rate %, click rate %
- **Activity Logging**: Automatic logging of email events to timeline

---

## 🚦 Getting Started Guide

### For Business Users
1. **Start with Contacts**: Import or manually add your customer contacts
2. **Create Deals**: Convert leads into sales opportunities in the pipeline
3. **Track Activities**: Log calls, meetings, and interactions
4. **Send Emails**: Use templates and variables for efficient communication
5. **Monitor Dashboard**: Check metrics daily for performance insights

### For Developers/Integrators
1. **Create API Key**: Set up API key with appropriate permissions
2. **Test Endpoints**: Use API Playground to test requests
3. **Set Up Webhooks**: Configure webhook URLs for event notifications
4. **Test Authentication**: Validate permissions with Auth Testing tool
5. **Read Documentation**: Review API docs for endpoint details

### For Administrators
1. **Configure Integrations**: Set up SMTP, SMS, accounting integrations
2. **Manage API Keys**: Create and manage keys for team and external services
3. **Monitor Webhooks**: Track webhook delivery and troubleshoot failures
4. **Export Data**: Regular CSV exports for backup and compliance
5. **Review Security**: Check API key usage and webhook logs

---

## 🎨 Design Principles

### Norwegian-Inspired Palette
- **Primary**: Deep fjord blue (#3B5998 equivalent in OKLCH)
- **Accent**: Aurora green for success states
- **Status Colors**: Amber (lead), Sky blue (prospect), Green (customer), Red (lost)
- **Typography**: Inter for UI, JetBrains Mono for data

### UX Principles
- **Efficient**: Minimal clicks, streamlined workflows
- **Trustworthy**: GDPR compliance, secure storage, transparent practices
- **Clear**: Intuitive organization, minimal training required
- **Professional**: Modern design without being trendy

---

## 📝 Requirements Fulfilled

This CRM system fulfills all core requirements:

1. ✅ **قاعدة بيانات العملاء** - Contact & account database with timeline, tags, search, filtering
2. ✅ **إدارة الفرص/المبيعات** - Sales pipeline with customizable stages, drag-drop, value tracking
3. ✅ **المهام والمتابعة** - Task management with assignments, due dates, reminders, SLA alerts
4. ✅ **الاستحواذ على Leads** - Lead capture via CSV import, API/webhooks, duplicate prevention
5. ✅ **التواصل وتسجيله** - Communications logging with email integration, templates, variables
6. ✅ **الأتمتة** - Automation with email scheduling, recurring patterns, webhooks, triggers
7. ✅ **التقارير** - Comprehensive reporting with dashboard, metrics, CSV export
8. ✅ **الصلاحيات والأمان** - Security with API keys, permissions, audit logs, backup/restore
9. ✅ **قابلية التوسع والاعتماد** - Scalability with fast performance, mobile-friendly, API/webhooks

See [FEATURES_COMPARISON.md](./FEATURES_COMPARISON.md) for detailed feature mapping.

---

## 🔮 Roadmap & Potential Enhancements

### Suggested Next Steps
1. **Advanced Reporting**: Charts showing revenue trends, conversion funnels, team performance over time
2. **Role-Based Access Control**: Team management with Admin/Manager/Sales roles and user-specific visibility
3. **Bulk Actions**: Bulk email, bulk status updates, bulk tag assignment, bulk delete operations

### Future Considerations
- SMS integration activation (API ready)
- Accounting system connections (Unimicro, Fiken)
- Calendar synchronization (Google, Outlook)
- Mobile app (React Native)
- Advanced workflow automation (visual workflow builder)
- Multi-tenant support (separate databases per company)

---

## 🤝 Support & Contribution

### Getting Help
- Check [USER_GUIDE.md](./USER_GUIDE.md) for detailed instructions
- Review API documentation in the app (API → Documentation)
- Test features in API Playground
- Validate permissions with Auth Testing tool

### Reporting Issues
- Export data regularly for backup
- Document steps to reproduce issues
- Include browser and OS information
- Check webhook logs for integration issues

---

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

## 🎯 System Information

- **Version**: 1.0.0 (Production Ready)
- **Languages**: Norwegian (Bokmål), English
- **Currency**: NOK (Norwegian Kroner)
- **Data Storage**: EU-compliant, GDPR-ready
- **API Rate Limit**: 1000 requests/hour per key
- **File Upload Limit**: 10 files, 25 MB total per email
- **Supported File Types**: PDF, Word, Excel, PowerPoint, TXT, CSV, Images, ZIP/RAR/7Z
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: Responsive design, touch-optimized

---

**Norwegian CRM - Effektiv kundehåndtering for norske bedrifter** 🇳🇴

Built with ❤️ using React, TypeScript, and modern web technologies.
