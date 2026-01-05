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
