import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateId,
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  isOverdue,
  isDueToday,
  getInitials,
  getFullName,
  getStatusColor,
  getPriorityColor,
  sortByDate,
  filterBySearch,
  calculateConversionRate,
  validateEmail,
  validatePhone,
  calculateNextScheduledDate,
  shouldSendRecurringEmail,
  formatRecurrencePattern,
  replaceTemplateVariables,
  getTemplateVariablePreview
} from '@/lib/helpers'
import { addDays, addWeeks, addMonths } from 'date-fns'

describe('helpers.ts - Core Utility Functions', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with expected format (timestamp-random)', () => {
      const id = generateId()
      expect(id).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('formatCurrency', () => {
    it('should format numbers as NOK currency', () => {
      expect(formatCurrency(10000)).toContain('kr')
      expect(formatCurrency(10000)).toContain('10')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toContain('0')
    })

    it('should handle negative numbers', () => {
      const result = formatCurrency(-5000)
      expect(result).toContain('5')
    })

    it('should format large numbers correctly', () => {
      const result = formatCurrency(1000000)
      expect(result).toBeTruthy()
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with Norwegian locale', () => {
      const result = formatNumber(1000)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle decimals', () => {
      const result = formatNumber(1234.56)
      expect(result).toBeTruthy()
    })
  })

  describe('formatDate', () => {
    it('should format ISO date strings to dd.MM.yyyy', () => {
      const date = '2024-03-15T10:30:00.000Z'
      const result = formatDate(date)
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    })

    it('should handle Date objects', () => {
      const date = new Date('2024-03-15')
      const result = formatDate(date)
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    })
  })

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const date = '2024-03-15T14:30:00.000Z'
      const result = formatDateTime(date)
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}/)
    })
  })

  describe('formatRelativeDate', () => {
    it('should return "min siden" for recent dates', () => {
      const recentDate = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      const result = formatRelativeDate(recentDate)
      expect(result).toContain('min siden')
    })

    it('should return "timer siden" for dates within 24 hours', () => {
      const hoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      const result = formatRelativeDate(hoursAgo)
      expect(result).toMatch(/\d+ (time|timer) siden/)
    })

    it('should return "I går" for yesterday', () => {
      const yesterday = new Date(Date.now() - 30 * 60 * 60 * 1000) // 30 hours ago
      const result = formatRelativeDate(yesterday)
      expect(result).toBe('I går')
    })

    it('should return formatted date for older dates', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      const result = formatRelativeDate(oldDate)
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    })
  })

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(isOverdue(yesterday.toISOString())).toBe(true)
    })

    it('should return false for future dates', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      expect(isOverdue(tomorrow.toISOString())).toBe(false)
    })

    it('should return false for today', () => {
      const today = new Date()
      expect(isOverdue(today.toISOString())).toBe(false)
    })
  })

  describe('isDueToday', () => {
    it('should return true for today', () => {
      const today = new Date()
      expect(isDueToday(today.toISOString())).toBe(true)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(isDueToday(yesterday.toISOString())).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      expect(isDueToday(tomorrow.toISOString())).toBe(false)
    })
  })

  describe('getInitials', () => {
    it('should return initials from first and last name', () => {
      expect(getInitials('John', 'Doe')).toBe('JD')
    })

    it('should handle lowercase names', () => {
      expect(getInitials('john', 'doe')).toBe('JD')
    })

    it('should handle single character names', () => {
      expect(getInitials('A', 'B')).toBe('AB')
    })
  })

  describe('getFullName', () => {
    it('should concatenate first and last name', () => {
      expect(getFullName('John', 'Doe')).toBe('John Doe')
    })

    it('should handle empty strings', () => {
      expect(getFullName('', '')).toBe(' ')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct color for lead', () => {
      const result = getStatusColor('lead')
      expect(result).toContain('bg-')
    })

    it('should return correct color for prospect', () => {
      const result = getStatusColor('prospect')
      expect(result).toContain('bg-')
    })

    it('should return correct color for customer', () => {
      const result = getStatusColor('customer')
      expect(result).toContain('bg-')
    })

    it('should return correct color for lost', () => {
      const result = getStatusColor('lost')
      expect(result).toContain('bg-')
    })

    it('should return default color for unknown status', () => {
      const result = getStatusColor('unknown')
      expect(result).toBe('bg-muted text-muted-foreground')
    })
  })

  describe('getPriorityColor', () => {
    it('should return correct colors for priorities', () => {
      expect(getPriorityColor('low')).toContain('bg-')
      expect(getPriorityColor('medium')).toContain('bg-')
      expect(getPriorityColor('high')).toContain('bg-')
    })

    it('should return default for unknown priority', () => {
      expect(getPriorityColor('unknown')).toBe('bg-muted text-muted-foreground')
    })
  })

  describe('sortByDate', () => {
    const items = [
      { id: '1', createdAt: '2024-01-01T00:00:00Z' },
      { id: '2', createdAt: '2024-01-03T00:00:00Z' },
      { id: '3', createdAt: '2024-01-02T00:00:00Z' },
    ]

    it('should sort descending by default', () => {
      const sorted = sortByDate(items)
      expect(sorted[0].id).toBe('2')
      expect(sorted[2].id).toBe('1')
    })

    it('should sort ascending when specified', () => {
      const sorted = sortByDate(items, false)
      expect(sorted[0].id).toBe('1')
      expect(sorted[2].id).toBe('2')
    })

    it('should not mutate original array', () => {
      const original = [...items]
      sortByDate(items)
      expect(items).toEqual(original)
    })
  })

  describe('filterBySearch', () => {
    const items = [
      { id: '1', name: 'John Doe', email: 'john@example.com', tags: ['vip'] },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', tags: ['new'] },
      { id: '3', name: 'Bob Johnson', email: 'bob@test.com', tags: ['vip', 'new'] },
    ]

    it('should filter by string field', () => {
      const result = filterBySearch(items, 'john', ['name'])
      expect(result).toHaveLength(2)
      expect(result.map(r => r.id)).toContain('1')
      expect(result.map(r => r.id)).toContain('3')
    })

    it('should filter by multiple fields', () => {
      const result = filterBySearch(items, 'test', ['name', 'email'])
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })

    it('should filter by array field', () => {
      const result = filterBySearch(items, 'vip', ['tags'])
      expect(result).toHaveLength(2)
    })

    it('should be case insensitive', () => {
      const result = filterBySearch(items, 'JOHN', ['name'])
      expect(result).toHaveLength(2)
    })

    it('should return all items for empty search', () => {
      const result = filterBySearch(items, '', ['name'])
      expect(result).toHaveLength(3)
    })

    it('should return empty array for no matches', () => {
      const result = filterBySearch(items, 'xyz123', ['name'])
      expect(result).toHaveLength(0)
    })
  })

  describe('calculateConversionRate', () => {
    it('should calculate correct percentage', () => {
      expect(calculateConversionRate(25, 100)).toBe(25)
      expect(calculateConversionRate(1, 2)).toBe(50)
      expect(calculateConversionRate(75, 100)).toBe(75)
    })

    it('should handle zero total', () => {
      expect(calculateConversionRate(5, 0)).toBe(0)
    })

    it('should return 0 for zero won', () => {
      expect(calculateConversionRate(0, 100)).toBe(0)
    })

    it('should round to nearest integer', () => {
      expect(calculateConversionRate(1, 3)).toBe(33)
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('test+tag@example.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test @example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('12345678')).toBe(true)
      expect(validatePhone('+47 123 45 678')).toBe(true)
      expect(validatePhone('(123) 456-7890')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('calculateNextScheduledDate', () => {
    const baseDate = '2024-01-15T10:00:00Z'

    it('should add days for daily pattern', () => {
      const next = calculateNextScheduledDate(baseDate, 'daily', 1)
      const expected = addDays(new Date(baseDate), 1)
      expect(next.toDateString()).toBe(expected.toDateString())
    })

    it('should add weeks for weekly pattern', () => {
      const next = calculateNextScheduledDate(baseDate, 'weekly', 1)
      const expected = addWeeks(new Date(baseDate), 1)
      expect(next.toDateString()).toBe(expected.toDateString())
    })

    it('should add months for monthly pattern', () => {
      const next = calculateNextScheduledDate(baseDate, 'monthly', 1)
      const expected = addMonths(new Date(baseDate), 1)
      expect(next.toDateString()).toBe(expected.toDateString())
    })

    it('should handle custom intervals', () => {
      const next = calculateNextScheduledDate(baseDate, 'daily', 3)
      const expected = addDays(new Date(baseDate), 3)
      expect(next.toDateString()).toBe(expected.toDateString())
    })

    it('should return same date for none pattern', () => {
      const next = calculateNextScheduledDate(baseDate, 'none')
      expect(next.toISOString()).toBe(new Date(baseDate).toISOString())
    })
  })

  describe('shouldSendRecurringEmail', () => {
    it('should return false for none pattern', () => {
      const recurrence = {
        pattern: 'none' as const,
        interval: 1
      }
      expect(shouldSendRecurringEmail(recurrence, 0)).toBe(false)
    })

    it('should check occurrence limit', () => {
      const recurrence = {
        pattern: 'daily' as const,
        interval: 1,
        endAfterOccurrences: 5
      }
      expect(shouldSendRecurringEmail(recurrence, 4)).toBe(true)
      expect(shouldSendRecurringEmail(recurrence, 5)).toBe(false)
      expect(shouldSendRecurringEmail(recurrence, 6)).toBe(false)
    })

    it('should check end date', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      const recurrenceFuture = {
        pattern: 'daily' as const,
        interval: 1,
        endDate: futureDate,
        nextScheduledAt: new Date().toISOString()
      }
      
      const recurrencePast = {
        pattern: 'daily' as const,
        interval: 1,
        endDate: pastDate,
        nextScheduledAt: new Date().toISOString()
      }
      
      expect(shouldSendRecurringEmail(recurrenceFuture, 0)).toBe(true)
      expect(shouldSendRecurringEmail(recurrencePast, 0)).toBe(false)
    })
  })

  describe('formatRecurrencePattern', () => {
    it('should format patterns correctly', () => {
      expect(formatRecurrencePattern('none')).toBe('Ingen gjentakelse')
      expect(formatRecurrencePattern('daily', 1)).toBe('Daglig')
      expect(formatRecurrencePattern('weekly', 1)).toBe('Ukentlig')
      expect(formatRecurrencePattern('monthly', 1)).toBe('Månedlig')
    })

    it('should format custom intervals', () => {
      expect(formatRecurrencePattern('daily', 2)).toContain('2')
      expect(formatRecurrencePattern('weekly', 3)).toContain('3')
      expect(formatRecurrencePattern('monthly', 4)).toContain('4')
    })
  })

  describe('replaceTemplateVariables', () => {
    const contact = {
      firstName: 'Ola',
      lastName: 'Nordmann',
      email: 'ola@example.no',
      phone: '+47 123 45 678',
      company: 'Test AS',
      status: 'customer',
      value: 50000
    }

    it('should replace basic variables', () => {
      const text = 'Hei {firstName} {lastName}!'
      const result = replaceTemplateVariables(text, contact)
      expect(result).toBe('Hei Ola Nordmann!')
    })

    it('should replace all supported variables', () => {
      const text = '{firstName} {lastName} - {email} - {phone} - {company} - {status}'
      const result = replaceTemplateVariables(text, contact)
      expect(result).toContain('Ola')
      expect(result).toContain('Nordmann')
      expect(result).toContain('ola@example.no')
      expect(result).toContain('+47 123 45 678')
      expect(result).toContain('Test AS')
      expect(result).toContain('customer')
    })

    it('should handle fullName variable', () => {
      const text = 'Hei {fullName}!'
      const result = replaceTemplateVariables(text, contact)
      expect(result).toBe('Hei Ola Nordmann!')
    })

    it('should format currency for value', () => {
      const text = 'Verdi: {value}'
      const result = replaceTemplateVariables(text, contact)
      expect(result).toContain('50')
    })

    it('should handle missing values with placeholders', () => {
      const text = 'Hei {firstName} {lastName}!'
      const result = replaceTemplateVariables(text, {})
      expect(result).toContain('[Fornavn]')
      expect(result).toContain('[Etternavn]')
    })

    it('should handle custom variables', () => {
      const text = 'Hei {firstName}, din {customField}!'
      const customValues = { customField: 'test verdi' }
      const result = replaceTemplateVariables(text, contact, customValues)
      expect(result).toBe('Hei Ola, din test verdi!')
    })

    it('should replace today variable', () => {
      const text = 'Dato: {today}'
      const result = replaceTemplateVariables(text, contact)
      expect(result).toMatch(/Dato: \d{2}\.\d{2}\.\d{4}/)
    })
  })

  describe('getTemplateVariablePreview', () => {
    it('should generate preview with sample data', () => {
      const text = 'Hei {firstName} {lastName} fra {company}!'
      const result = getTemplateVariablePreview(text)
      expect(result).toContain('Ola')
      expect(result).toContain('Nordmann')
      expect(result).toContain('Eksempel AS')
    })

    it('should handle all variables', () => {
      const text = '{firstName} {lastName} {email} {phone} {company} {status} {value}'
      const result = getTemplateVariablePreview(text)
      expect(result).not.toContain('{')
      expect(result).not.toContain('}')
    })
  })
})
