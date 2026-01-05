import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'
import { nb } from 'date-fns/locale'

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
  return format(dateObj, 'dd.MM.yyyy', { locale: nb })
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: nb })
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
