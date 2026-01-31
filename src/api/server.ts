import crypto from 'crypto'

declare const spark: {
  kv: {
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
  }
}

const MOCK_API_KEY = 'test_api_key_12345'

interface ApiKeyData {
  id: string
  key: string
  name: string
  permissions: string[]
  resourcePermissions?: Array<{
    resource: string
    actions: string[]
  }>
  isActive: boolean
  lastUsedAt?: string
  createdAt: string
}

interface WebhookData {
  id: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
  createdAt: string
}

class ApiServer {
  private baseUrl = '/api/v1'

  private async validateApiKey(apiKey: string): Promise<boolean> {
    if (apiKey === MOCK_API_KEY) return true
    
    const apiKeys = await spark.kv.get<ApiKeyData[]>('api-keys') || []
    const key = apiKeys.find(k => k.key === apiKey && k.isActive)
    
    if (key) {
      key.lastUsedAt = new Date().toISOString()
      await spark.kv.set('api-keys', apiKeys)
      return true
    }
    
    return false
  }

  private async checkPermission(
    apiKey: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    if (apiKey === MOCK_API_KEY) return true
    
    const apiKeys = await spark.kv.get<ApiKeyData[]>('api-keys') || []
    const key = apiKeys.find(k => k.key === apiKey && k.isActive)
    
    if (!key) return false
    
    if (key.permissions.includes('admin')) return true
    
    if (key.resourcePermissions) {
      const resourcePerm = key.resourcePermissions.find(
        r => r.resource === resource || r.resource === 'all'
      )
      
      if (resourcePerm && resourcePerm.actions.includes(action)) {
        return true
      }
    }
    
    return false
  }

  private async triggerWebhooks(event: string, data: any) {
    const webhooks = await spark.kv.get<WebhookData[]>('webhooks') || []
    const activeWebhooks = webhooks.filter(w => 
      w.isActive && w.events.includes(event)
    )

    for (const webhook of activeWebhooks) {
      try {
        const payload = {
          event,
          timestamp: new Date().toISOString(),
          data,
        }

        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex')

        await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256=${signature}`,
          },
          body: JSON.stringify(payload),
        })
      } catch (error) {
        console.error(`Webhook delivery failed for ${webhook.url}:`, error)
      }
    }
  }

  async handleRequest(
    body: any,
    method: string,
    path: string,
    headers: Record<string, string>
  ): Promise<{ status: number; data: any }> {
    const authHeader = headers['authorization'] || headers['Authorization']
    const apiKey = authHeader?.replace('Bearer ', '')

    if (!apiKey) {
      return {
        status: 401,
        data: { error: { code: 'UNAUTHORIZED', message: 'API-nøkkel mangler' } },
      }
    }

    const isValid = await this.validateApiKey(apiKey)

    if (!isValid) {
      return {
        status: 401,
        data: { error: { code: 'UNAUTHORIZED', message: 'Ugyldig API-nøkkel' } },
      }
    }

    const pathWithoutBase = path.replace(this.baseUrl, '')
    const parts = pathWithoutBase.split('/').filter(Boolean)

    try {
      if (parts[0] === 'contacts') {
        return await this.handleContactsRequest(method, parts, body, apiKey)
      } else if (parts[0] === 'deals') {
        return await this.handleDealsRequest(method, parts, body, apiKey)
      } else if (parts[0] === 'tasks') {
        return await this.handleTasksRequest(method, parts, body, apiKey)
      } else if (parts[0] === 'emails') {
        return await this.handleEmailsRequest(method, parts, body, apiKey)
      } else {
        return {
          status: 404,
          data: { error: { code: 'NOT_FOUND', message: 'Endepunkt ikke funnet' } },
        }
      }
    } catch (error) {
      return {
        status: 500,
        data: {
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'En feil oppstod',
          },
        },
      }
    }
  }

  private async handleContactsRequest(
    method: string,
    parts: string[],
    body: any,
    apiKey: string
  ): Promise<{ status: number; data: any }> {
    const contacts = await spark.kv.get<any[]>('contacts') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      return { status: 200, data: { data: contacts, pagination: { total: contacts.length } } }
    }

    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'write')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const newContact = {
        id: `cnt_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      contacts.push(newContact)
      await spark.kv.set('contacts', contacts)
      await this.triggerWebhooks('contact.created', newContact)

      return { status: 201, data: { data: newContact } }
    }

    if (method === 'GET' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const contact = contacts.find(c => c.id === parts[1])
      if (!contact) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Kontakt ikke funnet' } } }
      }

      return { status: 200, data: { data: contact } }
    }

    if (method === 'PUT' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'write')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const index = contacts.findIndex(c => c.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Kontakt ikke funnet' } } }
      }

      const updatedContact = {
        ...contacts[index],
        ...body,
        id: contacts[index].id,
        createdAt: contacts[index].createdAt,
        updatedAt: new Date().toISOString(),
      }

      contacts[index] = updatedContact
      await spark.kv.set('contacts', contacts)
      await this.triggerWebhooks('contact.updated', updatedContact)

      return { status: 200, data: { data: updatedContact } }
    }

    if (method === 'DELETE' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'delete')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const index = contacts.findIndex(c => c.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Kontakt ikke funnet' } } }
      }

      const deletedContact = contacts[index]
      contacts.splice(index, 1)
      await spark.kv.set('contacts', contacts)
      await this.triggerWebhooks('contact.deleted', deletedContact)

      return { status: 204, data: null }
    }

    return { status: 405, data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke støttet' } } }
  }

  private async handleDealsRequest(
    method: string,
    parts: string[],
    body: any,
    apiKey: string
  ): Promise<{ status: number; data: any }> {
    const deals = await spark.kv.get<any[]>('deals') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      return { status: 200, data: { data: deals, pagination: { total: deals.length } } }
    }

    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'write')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const newDeal = {
        id: `deal_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      deals.push(newDeal)
      await spark.kv.set('deals', deals)
      await this.triggerWebhooks('deal.created', newDeal)

      return { status: 201, data: { data: newDeal } }
    }

    if (method === 'PATCH' && parts.length === 3 && parts[2] === 'stage') {
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'write')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const index = deals.findIndex(d => d.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Avtale ikke funnet' } } }
      }

      const oldStage = deals[index].stage
      deals[index] = {
        ...deals[index],
        stage: body.stage,
        probability: body.probability || deals[index].probability,
        updatedAt: new Date().toISOString(),
      }

      await spark.kv.set('deals', deals)
      await this.triggerWebhooks('deal.stage_changed', {
        ...deals[index],
        previousStage: oldStage,
      })

      return { status: 200, data: { data: deals[index] } }
    }

    return { status: 405, data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke støttet' } } }
  }

  private async handleTasksRequest(
    method: string,
    parts: string[],
    body: any,
    apiKey: string
  ): Promise<{ status: number; data: any }> {
    const tasks = await spark.kv.get<any[]>('tasks') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      return { status: 200, data: { data: tasks, pagination: { total: tasks.length } } }
    }

    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'write')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const newTask = {
        id: `task_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        ...body,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      tasks.push(newTask)
      await spark.kv.set('tasks', tasks)
      await this.triggerWebhooks('task.created', newTask)

      return { status: 201, data: { data: newTask } }
    }

    if (method === 'PATCH' && parts.length === 3 && parts[2] === 'complete') {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'write')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const index = tasks.findIndex(t => t.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Oppgave ikke funnet' } } }
      }

      tasks[index] = {
        ...tasks[index],
        completed: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await spark.kv.set('tasks', tasks)
      await this.triggerWebhooks('task.completed', tasks[index])

      return { status: 200, data: { data: tasks[index] } }
    }

    return { status: 405, data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke støttet' } } }
  }

  private async handleEmailsRequest(
    method: string,
    parts: string[],
    body: any,
    apiKey: string
  ): Promise<{ status: number; data: any }> {
    const emails = await spark.kv.get<any[]>('emails') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'emails', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      return { status: 200, data: { data: emails, pagination: { total: emails.length } } }
    }

    if (method === 'POST' && parts.length === 2 && parts[1] === 'send') {
      const hasPermission = await this.checkPermission(apiKey, 'emails', 'write')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const newEmail = {
        id: `email_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        ...body,
        status: body.scheduledAt ? 'scheduled' : 'sent',
        trackingEnabled: body.trackingEnabled || false,
        openCount: 0,
        clickCount: 0,
        sentAt: body.scheduledAt ? undefined : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      emails.push(newEmail)
      await spark.kv.set('emails', emails)
      
      if (!body.scheduledAt) {
        await this.triggerWebhooks('email.sent', newEmail)
      }

      return { status: 201, data: { data: newEmail } }
    }

    if (method === 'GET' && parts.length === 3 && parts[2] === 'stats') {
      const hasPermission = await this.checkPermission(apiKey, 'emails', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const email = emails.find(e => e.id === parts[1])
      if (!email) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'E-post ikke funnet' } } }
      }

      const stats = {
        id: email.id,
        openRate: email.openCount > 0 ? 100 : 0,
        clickRate: email.clickCount > 0 ? 50 : 0,
        openCount: email.openCount,
        clickCount: email.clickCount,
      }

      return { status: 200, data: stats }
    }

    return { status: 405, data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke støttet' } } }
  }
}

export const apiServer = new ApiServer()
