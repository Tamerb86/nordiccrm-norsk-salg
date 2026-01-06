export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'lost'

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'status-change' | 'email-sent' | 'email-opened' | 'email-clicked'

export type TaskType = 'call' | 'email' | 'meeting' | 'follow-up' | 'other'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  status: ContactStatus
  tags: string[]
  value: number
  source?: string
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  title: string
  contactId: string
  stage: string
  value: number
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  description?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  lostReason?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  contactId?: string
  dealId?: string
  dueDate: string
  completed: boolean
  completedAt?: string
  priority: TaskPriority
  type: TaskType
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  type: ActivityType
  contactId: string
  dealId?: string
  subject: string
  notes?: string
  duration?: number
  outcome?: string
  createdBy: string
  createdAt: string
  metadata?: Record<string, any>
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
}

export interface DashboardMetrics {
  totalContacts: number
  totalDeals: number
  totalRevenue: number
  openDeals: number
  wonDeals: number
  lostDeals: number
  averageDealValue: number
  conversionRate: number
}

export type EmailStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category?: string
  createdAt: string
  updatedAt: string
}

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly'

export interface EmailRecurrence {
  pattern: RecurrencePattern
  interval: number
  endDate?: string
  endAfterOccurrences?: number
  occurrenceCount?: number
  nextScheduledAt?: string
  parentEmailId?: string
}

export interface Email {
  id: string
  contactId: string
  dealId?: string
  from: string
  to: string
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  htmlBody?: string
  status: EmailStatus
  templateId?: string
  scheduledAt?: string
  sentAt?: string
  openedAt?: string
  clickedAt?: string
  failedReason?: string
  trackingEnabled: boolean
  openCount: number
  clickCount: number
  attachments?: EmailAttachment[]
  recurrence?: EmailRecurrence
  createdAt: string
  updatedAt: string
}

export interface EmailAttachment {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export interface CustomTemplateVariable {
  id: string
  key: string
  label: string
  description: string
  example: string
  createdAt: string
  updatedAt: string
}

export type ApiKeyPermission = 'read' | 'write' | 'delete' | 'admin'

export type ApiKeyResource = 'contacts' | 'deals' | 'tasks' | 'emails' | 'webhooks' | 'reports' | 'all'

export interface ResourcePermission {
  resource: ApiKeyResource
  actions: ApiKeyPermission[]
}

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: ApiKeyPermission[]
  resourcePermissions?: ResourcePermission[]
  rateLimit?: number
  ipWhitelist?: string[]
  lastUsedAt?: string
  expiresAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  description?: string
}

export type WebhookEvent = 
  | 'contact.created' 
  | 'contact.updated' 
  | 'contact.deleted'
  | 'deal.created' 
  | 'deal.updated' 
  | 'deal.stage_changed'
  | 'deal.closed'
  | 'task.created'
  | 'task.completed'
  | 'email.sent'
  | 'email.opened'
  | 'email.clicked'

export interface Webhook {
  id: string
  name: string
  url: string
  events: WebhookEvent[]
  secret: string
  isActive: boolean
  lastTriggeredAt?: string
  lastStatus?: 'success' | 'failed'
  failureCount: number
  createdAt: string
  updatedAt: string
}

export type IntegrationType = 'smtp' | 'sms' | 'accounting' | 'calendar' | 'storage' | 'custom'

export interface Integration {
  id: string
  type: IntegrationType
  name: string
  provider: string
  isActive: boolean
  config: Record<string, any>
  lastSyncAt?: string
  lastSyncStatus?: 'success' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface WebhookLog {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: Record<string, any>
  statusCode?: number
  responseTime?: number
  success: boolean
  errorMessage?: string
  createdAt: string
}

export type UserRole = 'admin' | 'manager' | 'sales'

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isActive: boolean
  avatar?: string
  phone?: string
  department?: string
  title?: string
  invitedAt: string
  lastActiveAt?: string
  createdAt: string
  updatedAt: string
}

export interface RolePermissions {
  contacts: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    viewAll: boolean
    exportData: boolean
    importData: boolean
  }
  deals: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    viewAll: boolean
    reassign: boolean
  }
  tasks: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    viewAll: boolean
    reassign: boolean
  }
  emails: {
    view: boolean
    send: boolean
    viewAll: boolean
    manageTemplates: boolean
  }
  reports: {
    view: boolean
    viewAll: boolean
    export: boolean
  }
  api: {
    view: boolean
    manage: boolean
  }
  team: {
    view: boolean
    invite: boolean
    edit: boolean
    remove: boolean
    changeRoles: boolean
  }
}
