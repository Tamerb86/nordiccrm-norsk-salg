import { vi } from 'vitest'
import type { Contact, Deal, Task, Email } from '@/lib/types'

export const createMockContact = (overrides?: Partial<Contact>): Contact => ({
  id: `contact-${Date.now()}`,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '+47 123 45 678',
  company: 'Test Company',
  status: 'lead',
  tags: [],
  value: 10000,
  assignedTo: 'user-123',
  notes: 'Test notes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

export const createMockDeal = (overrides?: Partial<Deal>): Deal => ({
  id: `deal-${Date.now()}`,
  title: 'Test Deal',
  contactId: 'contact-123',
  stage: 'qualification',
  value: 50000,
  probability: 50,
  expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  description: 'Test deal description',
  assignedTo: 'user-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

export const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: `task-${Date.now()}`,
  title: 'Test Task',
  description: 'Test task description',
  contactId: 'contact-123',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  completed: false,
  priority: 'medium',
  type: 'follow-up',
  assignedTo: 'user-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

export const createMockEmail = (overrides?: Partial<Email>): Email => ({
  id: `email-${Date.now()}`,
  contactId: 'contact-123',
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  body: 'Test email body',
  status: 'draft',
  trackingEnabled: false,
  openCount: 0,
  clickCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

export const mockUseKV = (data: Record<string, any>) => {
  return vi.fn((key: string, defaultValue: any) => {
    const value = data[key] ?? defaultValue
    const setValue = vi.fn((updater) => {
      if (typeof updater === 'function') {
        data[key] = updater(data[key])
      } else {
        data[key] = updater
      }
    })
    const deleteValue = vi.fn(() => {
      delete data[key]
    })
    return [value, setValue, deleteValue]
  })
}

export const mockLanguageContext = {
  t: {
    common: {
      search: 'Search',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      export: 'Export',
      import: 'Import',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      close: 'Close',
      confirm: 'Confirm'
    },
    contacts: {
      title: 'Contacts',
      addContact: 'Add Contact',
      editContact: 'Edit Contact',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      status: 'Status',
      tags: 'Tags',
      notes: 'Notes',
      value: 'Value',
      assignedTo: 'Assigned To',
      searchPlaceholder: 'Search contacts...',
      noContacts: 'No contacts found',
      deleteConfirm: 'Are you sure you want to delete this contact?',
      bulkActions: 'Bulk Actions'
    },
    deals: {
      title: 'Deals',
      addDeal: 'Add Deal',
      editDeal: 'Edit Deal',
      stage: 'Stage',
      probability: 'Probability',
      expectedCloseDate: 'Expected Close Date',
      noDeal: 'No deals found'
    },
    tasks: {
      title: 'Tasks',
      addTask: 'Add Task',
      editTask: 'Edit Task',
      dueDate: 'Due Date',
      priority: 'Priority',
      completed: 'Completed',
      noTasks: 'No tasks found'
    },
    email: {
      title: 'Emails',
      compose: 'Compose',
      subject: 'Subject',
      body: 'Body',
      send: 'Send',
      schedule: 'Schedule',
      noEmails: 'No emails found'
    },
    status: {
      lead: 'Lead',
      prospect: 'Prospect',
      customer: 'Customer',
      lost: 'Lost'
    }
  },
  language: 'en'
}

export const mockAuthContext = {
  isAuthenticated: true,
  isLoading: false,
  user: {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin' as const
  },
  login: vi.fn(),
  logout: vi.fn(),
  hasPermission: vi.fn(() => true)
}

export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}
