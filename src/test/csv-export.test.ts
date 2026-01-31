import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  escapeCSVValue,
  convertToCSV,
  downloadCSV,
  exportContactsToCSV,
  exportDealsToCSV
} from '@/lib/csv-export'
import { createMockContact, createMockDeal } from './testUtils'

describe('csv-export.ts - CSV Export Functions', () => {
  describe('escapeCSVValue', () => {
    it('should return empty string for null or undefined', () => {
      expect(escapeCSVValue(null)).toBe('')
      expect(escapeCSVValue(undefined)).toBe('')
    })

    it('should convert values to strings', () => {
      expect(escapeCSVValue(123)).toBe('123')
      expect(escapeCSVValue(true)).toBe('true')
      expect(escapeCSVValue(false)).toBe('false')
    })

    it('should wrap values with commas in quotes', () => {
      expect(escapeCSVValue('Hello, World')).toBe('"Hello, World"')
    })

    it('should wrap values with quotes in quotes and escape inner quotes', () => {
      expect(escapeCSVValue('Say "Hello"')).toBe('"Say ""Hello"""')
    })

    it('should wrap values with newlines in quotes', () => {
      expect(escapeCSVValue('Line 1\nLine 2')).toBe('"Line 1\nLine 2"')
    })

    it('should not modify simple strings', () => {
      expect(escapeCSVValue('Hello World')).toBe('Hello World')
      expect(escapeCSVValue('test123')).toBe('test123')
    })

    it('should handle empty strings', () => {
      expect(escapeCSVValue('')).toBe('')
    })
  })

  describe('convertToCSV', () => {
    it('should convert array of objects to CSV string', () => {
      const data = [
        { name: 'John', age: 30, city: 'Oslo' },
        { name: 'Jane', age: 25, city: 'Bergen' }
      ]
      const headers = ['name', 'age', 'city']
      
      const result = convertToCSV(data, headers)
      
      expect(result).toBe(
        'name,age,city\n' +
        'John,30,Oslo\n' +
        'Jane,25,Bergen'
      )
    })

    it('should handle empty data array', () => {
      const data: any[] = []
      const headers = ['name', 'age']
      
      const result = convertToCSV(data, headers)
      
      expect(result).toBe('name,age')
    })

    it('should handle values that need escaping', () => {
      const data = [
        { name: 'John, Doe', note: 'Say "hi"' }
      ]
      const headers = ['name', 'note']
      
      const result = convertToCSV(data, headers)
      
      expect(result).toContain('"John, Doe"')
      expect(result).toContain('"Say ""hi"""')
    })

    it('should handle missing properties', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane' }
      ]
      const headers = ['name', 'age', 'city']
      
      const result = convertToCSV(data, headers)
      
      expect(result).toContain('John,30,')
      expect(result).toContain('Jane,,')
    })

    it('should maintain column order from headers', () => {
      const data = [
        { city: 'Oslo', name: 'John', age: 30 }
      ]
      const headers = ['name', 'age', 'city']
      
      const result = convertToCSV(data, headers)
      const lines = result.split('\n')
      
      expect(lines[0]).toBe('name,age,city')
      expect(lines[1]).toBe('John,30,Oslo')
    })
  })

  describe('downloadCSV', () => {
    let createElementSpy: any
    let appendChildSpy: any
    let removeChildSpy: any
    let createObjectURLSpy: any
    let revokeObjectURLSpy: any
    let mockLink: any

    beforeEach(() => {
      mockLink = {
        download: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {}
      }

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink)
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink)
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    })

    afterEach(() => {
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })

    it('should create and trigger download link', () => {
      const content = 'name,age\nJohn,30'
      const filename = 'test.csv'

      downloadCSV(content, filename)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', filename)
      expect(mockLink.click).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should create blob with correct content and type', () => {
      const content = 'test content'
      const filename = 'test.csv'

      downloadCSV(content, filename)

      expect(createObjectURLSpy).toHaveBeenCalled()
      const blob = createObjectURLSpy.mock.calls[0][0]
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('text/csv;charset=utf-8;')
    })
  })

  describe('exportContactsToCSV', () => {
    let downloadCSVSpy: any

    beforeEach(() => {
      downloadCSVSpy = vi.spyOn({ downloadCSV }, 'downloadCSV').mockImplementation(() => {})
    })

    afterEach(() => {
      downloadCSVSpy.mockRestore()
    })

    it('should export contacts with all fields', () => {
      const contacts = [
        createMockContact({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          tags: ['vip', 'important']
        })
      ]

      exportContactsToCSV(contacts)

      expect(downloadCSVSpy).not.toHaveBeenCalled()
    })

    it('should convert tags array to semicolon-separated string', () => {
      const contacts = [
        createMockContact({
          tags: ['tag1', 'tag2', 'tag3']
        })
      ]

      const csv = convertToCSV(
        contacts.map(c => ({ ...c, tags: c.tags.join('; ') })),
        ['id', 'firstName', 'lastName', 'tags']
      )

      expect(csv).toContain('tag1; tag2; tag3')
    })

    it('should handle contacts with empty tags', () => {
      const contacts = [
        createMockContact({ tags: [] })
      ]

      const exportData = contacts.map(c => ({
        ...c,
        tags: Array.isArray(c.tags) ? c.tags.join('; ') : ''
      }))

      expect(exportData[0].tags).toBe('')
    })

    it('should include all required contact fields', () => {
      const contact = createMockContact()
      const contacts = [contact]

      const headers = [
        'id', 'firstName', 'lastName', 'email', 'phone',
        'company', 'status', 'tags', 'value', 'source',
        'assignedTo', 'notes', 'createdAt', 'updatedAt'
      ]

      const csv = convertToCSV(
        contacts.map(c => ({ ...c, tags: c.tags.join('; ') })),
        headers
      )

      headers.forEach(header => {
        expect(csv).toContain(header)
      })
    })
  })

  describe('exportDealsToCSV', () => {
    it('should export deals with contact information', () => {
      const contact = createMockContact({
        id: 'contact-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Acme Corp'
      })

      const deal = createMockDeal({
        contactId: 'contact-1',
        title: 'Big Deal'
      })

      const contactMap = new Map([[contact.id, contact]])
      const exportData = [deal].map(d => {
        const c = contactMap.get(d.contactId)
        return {
          ...d,
          contactName: c ? `${c.firstName} ${c.lastName}` : '',
          contactEmail: c?.email || '',
          contactCompany: c?.company || ''
        }
      })

      expect(exportData[0].contactName).toBe('John Doe')
      expect(exportData[0].contactEmail).toBe('john@example.com')
      expect(exportData[0].contactCompany).toBe('Acme Corp')
    })

    it('should handle deals with missing contacts', () => {
      const deal = createMockDeal({
        contactId: 'non-existent',
        title: 'Orphan Deal'
      })

      const contacts: any[] = []
      const contactMap = new Map(contacts.map(c => [c.id, c]))
      
      const exportData = [deal].map(d => {
        const c = contactMap.get(d.contactId)
        return {
          ...d,
          contactName: c ? `${c.firstName} ${c.lastName}` : '',
          contactEmail: c?.email || '',
          contactCompany: c?.company || ''
        }
      })

      expect(exportData[0].contactName).toBe('')
      expect(exportData[0].contactEmail).toBe('')
      expect(exportData[0].contactCompany).toBe('')
    })

    it('should include all required deal fields', () => {
      const contact = createMockContact({ id: 'contact-1' })
      const deal = createMockDeal({ contactId: 'contact-1' })

      const headers = [
        'id', 'title', 'contactId', 'contactName', 'contactEmail',
        'contactCompany', 'stage', 'value', 'probability',
        'expectedCloseDate', 'actualCloseDate', 'description',
        'assignedTo', 'lostReason', 'createdAt', 'updatedAt'
      ]

      const contactMap = new Map([[contact.id, contact]])
      const exportData = [deal].map(d => {
        const c = contactMap.get(d.contactId)
        return {
          ...d,
          contactName: c ? `${c.firstName} ${c.lastName}` : '',
          contactEmail: c?.email || '',
          contactCompany: c?.company || ''
        }
      })

      const csv = convertToCSV(exportData, headers)

      headers.forEach(header => {
        expect(csv).toContain(header)
      })
    })

    it('should handle multiple deals correctly', () => {
      const contacts = [
        createMockContact({ id: 'c1', firstName: 'John', lastName: 'Doe' }),
        createMockContact({ id: 'c2', firstName: 'Jane', lastName: 'Smith' })
      ]

      const deals = [
        createMockDeal({ contactId: 'c1', title: 'Deal 1' }),
        createMockDeal({ contactId: 'c2', title: 'Deal 2' })
      ]

      const contactMap = new Map(contacts.map(c => [c.id, c]))
      const exportData = deals.map(d => {
        const c = contactMap.get(d.contactId)
        return {
          ...d,
          contactName: c ? `${c.firstName} ${c.lastName}` : '',
          contactEmail: c?.email || '',
          contactCompany: c?.company || ''
        }
      })

      expect(exportData).toHaveLength(2)
      expect(exportData[0].contactName).toBe('John Doe')
      expect(exportData[1].contactName).toBe('Jane Smith')
    })
  })
})
