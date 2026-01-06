import type { Contact, Deal } from './types'

export function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows: string[] = []
  
  csvRows.push(headers.map(escapeCSVValue).join(','))
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      return escapeCSVValue(value)
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function exportContactsToCSV(contacts: Contact[], filename: string = 'contacts.csv'): void {
  const headers = [
    'id',
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
    'notes',
    'createdAt',
    'updatedAt',
  ]
  
  const exportData = contacts.map(contact => ({
    ...contact,
    tags: Array.isArray(contact.tags) ? contact.tags.join('; ') : '',
  }))
  
  const csv = convertToCSV(exportData, headers)
  downloadCSV(csv, filename)
}

export function exportDealsToCSV(
  deals: Deal[],
  contacts: Contact[],
  filename: string = 'deals.csv'
): void {
  const contactMap = new Map(contacts.map(c => [c.id, c]))
  
  const headers = [
    'id',
    'title',
    'contactId',
    'contactName',
    'contactEmail',
    'contactCompany',
    'stage',
    'value',
    'probability',
    'expectedCloseDate',
    'actualCloseDate',
    'description',
    'assignedTo',
    'lostReason',
    'createdAt',
    'updatedAt',
  ]
  
  const exportData = deals.map(deal => {
    const contact = contactMap.get(deal.contactId)
    return {
      ...deal,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : '',
      contactEmail: contact?.email || '',
      contactCompany: contact?.company || '',
    }
  })
  
  const csv = convertToCSV(exportData, headers)
  downloadCSV(csv, filename)
}
