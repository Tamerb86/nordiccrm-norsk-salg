import { apiServer } from '@/api/server'
import type { Contact, Deal, Task, Email } from './types'

export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    field?: string
  }
  pagination?: {
    total: number
    limit?: number
    offset?: number
  }
}

export class ApiClient {
  private apiKey: string
  private baseUrl = '/api/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      }

      const result = await apiServer.handleRequest(
        body,
        method,
        `${this.baseUrl}${path}`,
        headers
      )

      if (result.status >= 400) {
        return result.data
      }

      return result.data
    } catch (error) {
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      }
    }
  }

  async getContacts(params?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Contact[]>> {
    let path = '/contacts'
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.status) queryParams.append('status', params.status)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())
      const query = queryParams.toString()
      if (query) path += `?${query}`
    }
    return this.makeRequest<Contact[]>('GET', path)
  }

  async getContact(id: string): Promise<ApiResponse<Contact>> {
    return this.makeRequest<Contact>('GET', `/contacts/${id}`)
  }

  async createContact(contact: Partial<Contact>): Promise<ApiResponse<Contact>> {
    return this.makeRequest<Contact>('POST', '/contacts', contact)
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<ApiResponse<Contact>> {
    return this.makeRequest<Contact>('PUT', `/contacts/${id}`, updates)
  }

  async deleteContact(id: string): Promise<ApiResponse<null>> {
    return this.makeRequest<null>('DELETE', `/contacts/${id}`)
  }

  async getDeals(params?: {
    stage?: string
    contactId?: string
    minValue?: number
    maxValue?: number
  }): Promise<ApiResponse<Deal[]>> {
    let path = '/deals'
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.stage) queryParams.append('stage', params.stage)
      if (params.contactId) queryParams.append('contactId', params.contactId)
      if (params.minValue) queryParams.append('minValue', params.minValue.toString())
      if (params.maxValue) queryParams.append('maxValue', params.maxValue.toString())
      const query = queryParams.toString()
      if (query) path += `?${query}`
    }
    return this.makeRequest<Deal[]>('GET', path)
  }

  async createDeal(deal: Partial<Deal>): Promise<ApiResponse<Deal>> {
    return this.makeRequest<Deal>('POST', '/deals', deal)
  }

  async updateDealStage(
    id: string,
    stage: string,
    probability?: number
  ): Promise<ApiResponse<Deal>> {
    return this.makeRequest<Deal>('PATCH', `/deals/${id}/stage`, {
      stage,
      probability,
    })
  }

  async getTasks(params?: {
    completed?: boolean
    priority?: string
    dueDate?: string
  }): Promise<ApiResponse<Task[]>> {
    let path = '/tasks'
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.completed !== undefined) {
        queryParams.append('completed', params.completed.toString())
      }
      if (params.priority) queryParams.append('priority', params.priority)
      if (params.dueDate) queryParams.append('dueDate', params.dueDate)
      const query = queryParams.toString()
      if (query) path += `?${query}`
    }
    return this.makeRequest<Task[]>('GET', path)
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.makeRequest<Task>('POST', '/tasks', task)
  }

  async completeTask(id: string): Promise<ApiResponse<Task>> {
    return this.makeRequest<Task>('PATCH', `/tasks/${id}/complete`)
  }

  async getEmails(): Promise<ApiResponse<Email[]>> {
    return this.makeRequest<Email[]>('GET', '/emails')
  }

  async sendEmail(email: {
    contactId: string
    to: string
    subject: string
    body: string
    trackingEnabled?: boolean
    scheduledAt?: string
  }): Promise<ApiResponse<Email>> {
    return this.makeRequest<Email>('POST', '/emails/send', email)
  }

  async getEmailStats(id: string): Promise<ApiResponse<{
    id: string
    openRate: number
    clickRate: number
    openCount: number
    clickCount: number
    lastOpenedAt?: string
  }>> {
    return this.makeRequest('GET', `/emails/${id}/stats`)
  }
}

export function createApiClient(apiKey: string): ApiClient {
  return new ApiClient(apiKey)
}
