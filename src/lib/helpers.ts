import { format, parseISO, isAfter, isBefore, startOfDay, addDays, addWeeks, addMonths } from 'date-fns'
import type { RecurrencePattern, EmailRecurrence } from './types'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('nb-NO').format(num)
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd.MM.yyyy')
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd.MM.yyyy HH:mm')
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60)
    return `${minutes} min siden`
  }
  
  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours} ${hours === 1 ? 'time' : 'timer'} siden`
  }
  
  if (diffInHours < 48) {
    return 'I går'
  }
  
  if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24)
    return `${days} dager siden`
  }
  
  return formatDate(dateObj)
}

export function isOverdue(dueDate: string): boolean {
  const due = startOfDay(parseISO(dueDate))
  const today = startOfDay(new Date())
  return isBefore(due, today)
}

export function isDueToday(dueDate: string): boolean {
  const due = startOfDay(parseISO(dueDate))
  const today = startOfDay(new Date())
  return due.getTime() === today.getTime()
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    lead: 'bg-[oklch(0.75_0.15_80)] text-white',
    prospect: 'bg-[oklch(0.70_0.12_230)] text-white',
    customer: 'bg-[oklch(0.65_0.15_160)] text-white',
    lost: 'bg-[oklch(0.60_0.15_25)] text-white',
  }
  return colors[status] || 'bg-muted text-muted-foreground'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-[oklch(0.70_0.12_230)] text-white',
    high: 'bg-[oklch(0.60_0.15_25)] text-white',
  }
  return colors[priority] || 'bg-muted text-muted-foreground'
}

export function sortByDate<T extends { createdAt: string }>(items: T[], desc = true): T[] {
  return [...items].sort((a, b) => {
    const dateA = parseISO(a.createdAt)
    const dateB = parseISO(b.createdAt)
    return desc ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
  })
}

export function filterBySearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return items
  
  const lowerSearch = searchTerm.toLowerCase()
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearch)
      }
      if (Array.isArray(value)) {
        return value.some((v) => String(v).toLowerCase().includes(lowerSearch))
      }
      return false
    })
  )
}

export function calculateConversionRate(won: number, total: number): number {
  if (total === 0) return 0
  return Math.round((won / total) * 100)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s+()-]+$/
  return phone.length >= 8 && phoneRegex.test(phone)
}

export function calculateNextScheduledDate(
  currentDate: string | Date,
  pattern: RecurrencePattern,
  interval: number = 1
): Date {
  const baseDate = typeof currentDate === 'string' ? parseISO(currentDate) : currentDate
  
  switch (pattern) {
    case 'daily':
      return addDays(baseDate, interval)
    case 'weekly':
      return addWeeks(baseDate, interval)
    case 'monthly':
      return addMonths(baseDate, interval)
    case 'none':
    default:
      return baseDate
  }
}

export function shouldSendRecurringEmail(
  recurrence: EmailRecurrence,
  currentOccurrences: number
): boolean {
  if (recurrence.pattern === 'none') return false
  
  if (recurrence.endAfterOccurrences && currentOccurrences >= recurrence.endAfterOccurrences) {
    return false
  }
  
  if (recurrence.endDate) {
    const endDate = parseISO(recurrence.endDate)
    const nextScheduled = recurrence.nextScheduledAt ? parseISO(recurrence.nextScheduledAt) : new Date()
    if (isAfter(nextScheduled, endDate)) {
      return false
    }
  }
  
  return true
}

export function formatRecurrencePattern(pattern: RecurrencePattern, interval: number = 1): string {
  if (pattern === 'none') return 'Ingen gjentakelse'
  
  const patterns: Record<RecurrencePattern, string> = {
    none: 'Ingen gjentakelse',
    daily: interval === 1 ? 'Daglig' : `Hver ${interval}. dag`,
    weekly: interval === 1 ? 'Ukentlig' : `Hver ${interval}. uke`,
    monthly: interval === 1 ? 'Månedlig' : `Hver ${interval}. måned`,
  }
  
  return patterns[pattern] || 'Ingen gjentakelse'
}

export interface TemplateVariable {
  key: string
  label: string
  description: string
  example: string
}

export const availableTemplateVariables: TemplateVariable[] = [
  {
    key: 'firstName',
    label: 'Fornavn',
    description: 'Kontaktens fornavn',
    example: 'Ola'
  },
  {
    key: 'lastName',
    label: 'Etternavn',
    description: 'Kontaktens etternavn',
    example: 'Nordmann'
  },
  {
    key: 'fullName',
    label: 'Fullt navn',
    description: 'Kontaktens fulle navn',
    example: 'Ola Nordmann'
  },
  {
    key: 'email',
    label: 'E-post',
    description: 'Kontaktens e-postadresse',
    example: 'ola@eksempel.no'
  },
  {
    key: 'phone',
    label: 'Telefon',
    description: 'Kontaktens telefonnummer',
    example: '+47 123 45 678'
  },
  {
    key: 'company',
    label: 'Selskap',
    description: 'Kontaktens selskapsnavn',
    example: 'Eksempel AS'
  },
  {
    key: 'status',
    label: 'Status',
    description: 'Kontaktens nåværende status',
    example: 'Kunde'
  },
  {
    key: 'value',
    label: 'Verdi',
    description: 'Kontaktens totale verdi',
    example: '50 000 kr'
  },
  {
    key: 'today',
    label: 'Dagens dato',
    description: 'Dagens dato',
    example: format(new Date(), 'dd.MM.yyyy')
  }
]

export function replaceTemplateVariables(
  text: string,
  contact: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    company?: string
    status?: string
    value?: number
  },
  customValues?: Record<string, string>
): string {
  let result = text

  const fullName = contact.firstName && contact.lastName 
    ? `${contact.firstName} ${contact.lastName}` 
    : contact.firstName || contact.lastName || ''

  const replacements: Record<string, string> = {
    '{firstName}': contact.firstName || '[Fornavn]',
    '{lastName}': contact.lastName || '[Etternavn]',
    '{fullName}': fullName || '[Fullt navn]',
    '{email}': contact.email || '[E-post]',
    '{phone}': contact.phone || '[Telefon]',
    '{company}': contact.company || '[Selskap]',
    '{status}': contact.status || '[Status]',
    '{value}': contact.value ? formatCurrency(contact.value) : '[Verdi]',
    '{today}': format(new Date(), 'dd.MM.yyyy')
  }

  if (customValues) {
    Object.entries(customValues).forEach(([key, value]) => {
      replacements[`{${key}}`] = value
    })
  }

  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
  })

  return result
}

export function getTemplateVariablePreview(text: string): string {
  const previewContact = {
    firstName: 'Ola',
    lastName: 'Nordmann',
    email: 'ola@eksempel.no',
    phone: '+47 123 45 678',
    company: 'Eksempel AS',
    status: 'Kunde',
    value: 50000
  }

  return replaceTemplateVariables(text, previewContact)
}
