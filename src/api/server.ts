const MOCK_API_KEY = 'test_key_12345'

interface ApiKeyData {
  id: string
  name: string
  key: string
  permissions: string[]
  resourcePermissions?: Array<{
    resource: string
    actions: string[]
  }>
  isActive: boolean
  createdAt: string
  lastUsedAt?: string
}

class ApiServer {
  private async validateApiKey(apiKey: string): Promise<boolean> {
    if (apiKey === MOCK_API_KEY) {
      return true
    }

    const keys = await window.spark.kv.get<ApiKeyData[]>('api_keys') || []
    const key = keys.find(k => k.key === apiKey && k.isActive)
    
    if (key) {
      key.lastUsedAt = new Date().toISOString()
      await window.spark.kv.set('api_keys', keys)
      return true
    }
    
    return false
  }

  private async checkPermission(apiKey: string, resource: string, action: string): Promise<boolean> {
    if (apiKey === MOCK_API_KEY) {
      return true
    }

    const keys = await window.spark.kv.get<ApiKeyData[]>('api_keys') || []
    const key = keys.find(k => k.key === apiKey && k.isActive)
    
    if (!key) {
      return false
    }
    
    if (key.permissions.includes('*') || key.permissions.includes(`${resource}:${action}`)) {
      return true
    }
    
    if (key.resourcePermissions) {
      const resourcePerm = key.resourcePermissions.find(rp => rp.resource === resource)
      if (resourcePerm && resourcePerm.actions.includes(action)) {
        return true
      }
    }
    
    return false
  }

  private async triggerWebhooks(event: string, data: any): Promise<void> {
    const activeWebhooks = await window.spark.kv.get<any[]>('webhooks') || []
    
    for (const webhook of activeWebhooks) {
      if (webhook.isActive && webhook.events.includes(event)) {
        try {
          const payload = {
            event,
            data,
            timestamp: new Date().toISOString()
          }
          
          const signature = btoa(JSON.stringify(payload))
          
          await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': `sha256=${signature}`,
            },
            body: JSON.stringify(payload)
          })
        } catch (error) {
          console.error('Webhook delivery failed:', error)
        }
      }
    }
  }

  async handleRequest(
    path: string,
    method: string,
    headers: Record<string, string>,
    body?: any
  ): Promise<{ status: number; data: any }> {
    const apiKey = headers['x-api-key'] || headers['authorization']?.replace('Bearer ', '')
    
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

    try {
      const parts = path.split('/').filter(Boolean)
      
      if (parts[0] === 'contacts') {
        return await this.handleContactsRequest(method, parts, apiKey, body)
      }
      if (parts[0] === 'deals') {
        return await this.handleDealsRequest(method, parts, apiKey, body)
      }
      if (parts[0] === 'tasks') {
        return await this.handleTasksRequest(method, parts, apiKey, body)
      }
      if (parts[0] === 'emails') {
        return await this.handleEmailsRequest(method, parts, apiKey, body)
      }

      return {
        status: 404,
        data: { error: { code: 'NOT_FOUND', message: 'Endepunkt ikke funnet' } },
      }
    } catch (error) {
      return {
        status: 500,
        data: {
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Intern feil'
          }
        }
      }
    }
  }

  private async handleContactsRequest(
    method: string,
    parts: string[],
    apiKey: string,
    body: any,
  ): Promise<{ status: number; data: any }> {
    const contacts = await window.spark.kv.get<any[]>('contacts') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      return { status: 200, data: { data: contacts } }
    }

    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'create')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const newContact = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
      }
      contacts.push(newContact)
      await window.spark.kv.set('contacts', contacts)
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

    if (method === 'PATCH' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'update')
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
      }
      contacts[index] = updatedContact
      await window.spark.kv.set('contacts', contacts)
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
      await window.spark.kv.set('contacts', contacts)
      await this.triggerWebhooks('contact.deleted', deletedContact)

      return { status: 200, data: { data: deletedContact } }
    }

    return { status: 405, data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke tillatt' } } }
  }

  private async handleDealsRequest(
    method: string,
    parts: string[],
    apiKey: string,
    body: any,
  ): Promise<{ status: number; data: any }> {
    const deals = await window.spark.kv.get<any[]>('deals') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      return { status: 200, data: { data: deals } }
    }

    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'create')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const newDeal = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
      }
      deals.push(newDeal)
      await window.spark.kv.set('deals', deals)
      await this.triggerWebhooks('deal.created', newDeal)

      return { status: 201, data: { data: newDeal } }
    }

    if (method === 'PATCH' && parts.length === 3 && parts[2] === 'stage') {
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'update')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const index = deals.findIndex(d => d.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Deal ikke funnet' } } }
      }

      deals[index] = {
        ...deals[index],
        stage: body.stage,
      }
      await window.spark.kv.set('deals', deals)
      await this.triggerWebhooks('deal.stage_changed', {
        dealId: parts[1],
        stage: body.stage,
      })

      return { status: 200, data: { data: deals[index] } }
    }

    return { status: 405, data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke tillatt' } } }
  }

  private async handleTasksRequest(
    method: string,
    parts: string[],
    apiKey: string,
    body: any,
  ): Promise<{ status: number; data: any }> {
    const tasks = await window.spark.kv.get<any[]>('tasks') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      return { status: 200, data: { data: tasks } }
    }

    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'create')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const newTask = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
      }
      tasks.push(newTask)
      await window.spark.kv.set('tasks', tasks)
      await this.triggerWebhooks('task.created', newTask)

      return { status: 201, data: { data: newTask } }
    }

    if (method === 'PATCH' && parts.length === 3 && parts[2] === 'complete') {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'update')
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
        updatedAt: new Date().toISOString(),
      }
      await window.spark.kv.set('tasks', tasks)
      await this.triggerWebhooks('task.completed', tasks[index])

      return { status: 200, data: { data: tasks[index] } }
    }

    return { status: 405, data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke tillatt' } } }
  }

  private async handleEmailsRequest(
    method: string,
    parts: string[],
    apiKey: string,
    body: any,
  ): Promise<{ status: number; data: any }> {
    const emails = await window.spark.kv.get<any[]>('emails') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'emails', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      return { status: 200, data: { data: emails } }
    }

    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'emails', 'send')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const newEmail = {
        id: Date.now().toString(),
        ...body,
        status: body.scheduledFor ? 'scheduled' : 'sent',
        sentAt: body.scheduledFor ? null : new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      emails.push(newEmail)
      await window.spark.kv.set('emails', emails)
      await this.triggerWebhooks('email.sent', newEmail)

      return { status: 201, data: { data: newEmail } }
    }

    if (method === 'GET' && parts.length === 3 && parts[2] === 'analytics') {
      const hasPermission = await this.checkPermission(apiKey, 'emails', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }

      const email = emails.find(e => e.id === parts[1])
      if (!email) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'E-post ikke funnet' } } }
      }
      const analytics = {
        openRate: email.openRate || 0,
        clickRate: email.clickRate || 0,
        openCount: email.openCount || 0,
        clickCount: email.clickCount || 0,
      }
      return { status: 200, data: { data: analytics } }
    }

    return { status: 405, data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke tillatt' } } }
  }
}

export const apiServer = new ApiServer()
