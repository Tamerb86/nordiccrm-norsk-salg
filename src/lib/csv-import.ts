import type { Contact, Deal } from './types'
import { generateId } from './helpers'

export interface ImportResult<T> {
  success: boolean
  data: T[]
  errors: ImportError[]
  skipped: number
  imported: number
}

export interface ImportError {
  row: number
  field?: string
  message: string
  data?: any
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

export function parseCSV(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim())
  
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }
  
  const headers = parseCSVLine(lines[0])
  const rows = lines.slice(1).map(line => parseCSVLine(line))
  
  return { headers, rows }
}

function validateEmail(email?: string): boolean {
  if (!email) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateContactStatus(status: string): status is Contact['status'] {
  return ['lead', 'prospect', 'customer', 'lost'].includes(status?.toLowerCase())
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/\s+/g, '')
}

export function importContactsFromCSV(csvContent: string, existingContacts: Contact[]): ImportResult<Contact> {
  const result: ImportResult<Contact> = {
    success: true,
    data: [],
    errors: [],
    skipped: 0,
    imported: 0,
  }
  
  try {
    const { headers, rows } = parseCSV(csvContent)
    
    if (headers.length === 0) {
      result.success = false
      result.errors.push({ row: 0, message: 'CSV file is empty or invalid' })
      return result
    }
    
    const normalizedHeaders = headers.map(normalizeHeader)
    const headerMap = new Map<string, number>()
    normalizedHeaders.forEach((header, index) => {
      headerMap.set(header, index)
    })
    
    const requiredFields = ['firstname', 'lastname']
    const missingFields = requiredFields.filter(field => !headerMap.has(field))
    
    if (missingFields.length > 0) {
      result.success = false
      result.errors.push({
        row: 0,
        message: `Missing required columns: ${missingFields.join(', ')}. Required: firstName, lastName`
      })
      return result
    }
    
    const existingEmails = new Set(
      existingContacts.filter(c => c.email).map(c => c.email!.toLowerCase())
    )
    
    rows.forEach((row, index) => {
      const rowNumber = index + 2
      
      if (row.length === 0 || row.every(cell => !cell)) {
        result.skipped++
        return
      }
      
      const getValue = (field: string): string => {
        const idx = headerMap.get(field)
        return idx !== undefined ? row[idx] : ''
      }
      
      const firstName = getValue('firstname')
      const lastName = getValue('lastname')
      const email = getValue('email')
      const phone = getValue('phone')
      const company = getValue('company')
      const status = getValue('status') || 'lead'
      const tagsStr = getValue('tags')
      const valueStr = getValue('value')
      const source = getValue('source')
      const assignedTo = getValue('assignedto')
      const notes = getValue('notes')
      
      if (!firstName || !lastName) {
        result.errors.push({
          row: rowNumber,
          message: 'Missing required field: firstName or lastName',
          data: { firstName, lastName }
        })
        result.skipped++
        return
      }
      
      if (email && !validateEmail(email)) {
        result.errors.push({
          row: rowNumber,
          field: 'email',
          message: `Invalid email format: ${email}`,
          data: { email }
        })
        result.skipped++
        return
      }
      
      if (email && existingEmails.has(email.toLowerCase())) {
        result.errors.push({
          row: rowNumber,
          field: 'email',
          message: `Contact with email ${email} already exists`,
          data: { email }
        })
        result.skipped++
        return
      }
      
      if (!validateContactStatus(status)) {
        result.errors.push({
          row: rowNumber,
          field: 'status',
          message: `Invalid status: ${status}. Must be one of: lead, prospect, customer, lost`,
          data: { status }
        })
        result.skipped++
        return
      }
      
      const tags = tagsStr
        ? tagsStr.split(';').map(tag => tag.trim()).filter(Boolean)
        : []
      
      const value = valueStr ? parseFloat(valueStr) || 0 : 0
      
      const newContact: Contact = {
        id: generateId(),
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        status: status as Contact['status'],
        tags,
        value,
        source: source || undefined,
        assignedTo: assignedTo || undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      result.data.push(newContact)
      result.imported++
      
      if (email) {
        existingEmails.add(email.toLowerCase())
      }
    })
    
    if (result.imported === 0 && result.errors.length > 0) {
      result.success = false
    }
    
  } catch (error) {
    result.success = false
    result.errors.push({
      row: 0,
      message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
  
  return result
}

export function importDealsFromCSV(
  csvContent: string,
  existingDeals: Deal[],
  existingContacts: Contact[]
): ImportResult<Deal> {
  const result: ImportResult<Deal> = {
    success: true,
    data: [],
    errors: [],
    skipped: 0,
    imported: 0,
  }
  
  try {
    const { headers, rows } = parseCSV(csvContent)
    
    if (headers.length === 0) {
      result.success = false
      result.errors.push({ row: 0, message: 'CSV file is empty or invalid' })
      return result
    }
    
    const normalizedHeaders = headers.map(normalizeHeader)
    const headerMap = new Map<string, number>()
    normalizedHeaders.forEach((header, index) => {
      headerMap.set(header, index)
    })
    
    const requiredFields = ['title', 'contactid', 'stage', 'value']
    const missingFields = requiredFields.filter(field => !headerMap.has(field))
    
    if (missingFields.length > 0) {
      result.success = false
      result.errors.push({
        row: 0,
        message: `Missing required columns: ${missingFields.join(', ')}. Required: title, contactId, stage, value`
      })
      return result
    }
    
    const contactEmailMap = new Map(
      existingContacts.map(c => [c.email?.toLowerCase(), c.id])
    )
    const contactIdMap = new Map(existingContacts.map(c => [c.id, c]))
    
    rows.forEach((row, index) => {
      const rowNumber = index + 2
      
      if (row.length === 0 || row.every(cell => !cell)) {
        result.skipped++
        return
      }
      
      const getValue = (field: string): string => {
        const idx = headerMap.get(field)
        return idx !== undefined ? row[idx] : ''
      }
      
      const title = getValue('title')
      let contactId = getValue('contactid')
      const contactEmail = getValue('contactemail')
      const stage = getValue('stage')
      const valueStr = getValue('value')
      const probabilityStr = getValue('probability')
      const expectedCloseDate = getValue('expectedclosedate')
      const actualCloseDate = getValue('actualclosedate')
      const description = getValue('description')
      const assignedTo = getValue('assignedto')
      const lostReason = getValue('lostreason')
      
      if (!title) {
        result.errors.push({
          row: rowNumber,
          message: 'Missing required field: title',
          data: { title }
        })
        result.skipped++
        return
      }
      
      if (!contactId && contactEmail) {
        const matchedId = contactEmailMap.get(contactEmail.toLowerCase())
        if (matchedId) {
          contactId = matchedId
        }
      }
      
      if (!contactId) {
        result.errors.push({
          row: rowNumber,
          field: 'contactId',
          message: 'Missing or invalid contactId, and could not match by email',
          data: { contactId, contactEmail }
        })
        result.skipped++
        return
      }
      
      if (!contactIdMap.has(contactId)) {
        result.errors.push({
          row: rowNumber,
          field: 'contactId',
          message: `Contact with ID ${contactId} not found`,
          data: { contactId }
        })
        result.skipped++
        return
      }
      
      if (!stage) {
        result.errors.push({
          row: rowNumber,
          field: 'stage',
          message: 'Missing required field: stage',
          data: { stage }
        })
        result.skipped++
        return
      }
      
      const value = valueStr ? parseFloat(valueStr) || 0 : 0
      const probability = probabilityStr ? Math.min(100, Math.max(0, parseFloat(probabilityStr) || 0)) : 50
      
      const newDeal: Deal = {
        id: generateId(),
        title,
        contactId,
        stage,
        value,
        probability,
        expectedCloseDate: expectedCloseDate || undefined,
        actualCloseDate: actualCloseDate || undefined,
        description: description || undefined,
        assignedTo: assignedTo || undefined,
        lostReason: lostReason || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      result.data.push(newDeal)
      result.imported++
    })
    
    if (result.imported === 0 && result.errors.length > 0) {
      result.success = false
    }
    
  } catch (error) {
    result.success = false
    result.errors.push({
      row: 0,
      message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
  
  return result
}

export function generateCSVTemplate(type: 'contacts' | 'deals'): string {
  if (type === 'contacts') {
    const headers = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'company',
      'status',
      'tags',
      'value',
      'source',
      'assignedTo',
      'notes'
    ]
    const exampleRow = [
      'John',
      'Doe',
      'john.doe@example.com',
      '+47 123 45 678',
      'Acme Corp',
      'lead',
      'important; potential',
      '50000',
      'website',
      'Sales Team',
      'Met at conference'
    ]
    return `${headers.join(',')}\n${exampleRow.join(',')}`
  } else {
    const headers = [
      'title',
      'contactId',
      'contactEmail',
      'stage',
      'value',
      'probability',
      'expectedCloseDate',
      'description',
      'assignedTo'
    ]
    const exampleRow = [
      'Website Redesign Project',
      'contact-id-here',
      'john.doe@example.com',
      'Kvalifisering',
      '150000',
      '60',
      '2024-12-31',
      'Complete website overhaul',
      'Sales Team'
    ]
    return `${headers.join(',')}\n${exampleRow.join(',')}`
  }
}
