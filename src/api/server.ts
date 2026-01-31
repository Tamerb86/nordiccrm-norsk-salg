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
  createdAt: string
  isActive?: boolean
  lastUsed?: string
}

export class ApiServer {
  private async validateApiKey(apiKey: string): Promise<boolean> {
    if (apiKey === MOCK_API_KEY) {
      return true
    }

    const keys = await window.spark.kv.get<ApiKeyData[]>('api-keys') || []
    const key = keys.find(k => k.key === apiKey && k.isActive !== false)
    
    if (key) {
      const updatedKeys = keys.map(k => 
        k.key === apiKey ? { ...k, lastUsed: new Date().toISOString() } : k
      )
      await window.spark.kv.set('api-keys', updatedKeys)
      return true
    }

  private async 
  }

  private async checkPermission(apiKey: string, resource: string, action: string): Promise<boolean> {
    if (apiKey === MOCK_API_KEY) {
      return true
    }

    const keys = await window.spark.kv.get<ApiKeyData[]>('api-keys') || []
    const key = keys.find(k => k.key === apiKey && k.isActive !== false)
    
    if (!key) {
      return false
    }

    if (key.permissions.includes('*') || key.permissions.includes(`${resource}:*`)) {
      return true
    }

    if (key.permissions.includes(`${resource}:${action}`)) {
      return true
    }

    if (key.resourcePermissions) {
      const resourcePerm = key.resourcePermissions.find(rp => rp.resource === resource)
      if (resourcePerm && (resourcePerm.actions.includes('*') || resourcePerm.actions.includes(action))) {
        return true
  }
  pri

    return false
  }

  private async triggerWebhooks(event: string, payload: any): Promise<void> {
    const webhooks = await window.spark.kv.get<any[]>('webhooks') || []
    
    for (const webhook of webhooks) {
      if (webhook.isActive && webhook.events?.includes(event)) {
        try {
          const signature = btoa(JSON.stringify(payload))
          await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
            },
            body: JSON.stringify(payload),
          })
        } catch (error) {
          console.error('Webhook error:', error)
        }
      }
    }
  }

  async handleRequest(
    method: string,
    path: string,
    apiKey: string | null,
    body?: any
  ): Promise<{ status: number; data: any }> {
    if (!apiKey) {
      return {
        status: 401,
        data: { error: { code: 'UNAUTHORIZED', message: 'API-nøkkel mangler' } },
      }
    }


      const parts =
      if (part
      }
        return await this.handleDealsRequest(method, parts, apiKey, body)
      i
     


        status: 404,
      
      return {
        data: { error: { code: 'INTERNAL_ERROR', message: 'Intern serverfeil
    }

    method: string,
    api
  ): Promise<{ status: number; da

      c
        return { status: 403, data
      return { status: 200, data: { data: contacts } }


        return
      const newConta
        id: Date.now().toString(),
      }
      await window.sp
      return {
        status: 500,
        data: { error: { code: 'INTERNAL_ERROR', message: 'Intern serverfeil' } },
      i
     
  }

  private async handleContactsRequest(
    method: string,
    parts: string[],
    apiKey: string,
    body: any
  ): Promise<{ status: number; data: any }> {
    const contacts = await window.spark.kv.get<any[]>('contacts') || []

    if (method === 'GET' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'read')
        return { status: 40
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
       
      return { status: 200, data: { data: contacts } }


    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'create')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const newContact = {
        ...body,
        id: Date.now().toString(),
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
      if (!hasPermission) {
    }

    if (method === 'PATCH' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'update')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const index = contacts.findIndex(c => c.id === parts[1])
        createdAt: new Da
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Kontakt ikke funnet' } } }
      a
      const updatedContact = {
    }
        ...body,
      }
      contacts[index] = updatedContact
      await window.spark.kv.set('contacts', contacts)
      await this.triggerWebhooks('contact.updated', updatedContact)
      return { status: 200, data: { data: updatedContact } }
     

    if (method === 'DELETE' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'contacts', 'delete')
        return { status: 40
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      i
      const index = contacts.findIndex(c => c.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Kontakt ikke funnet' } } }
      }
      const deletedContact = contacts[index]
      await this.triggerWebhook
      await window.spark.kv.set('contacts', contacts)
      await this.triggerWebhooks('contact.deleted', deletedContact)
      return { status: 200, data: { data: { success: true } } }
    }

    return {
        return { s
      data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke tillatt' } },
     
  }

  private async handleDealsRequest(
    method: string,
    parts: string[],
    }
    body: any
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
        ...body,
        id: Date.now().toString(),
      return { status: 201, data: { data: ne
      }
      deals.push(newDeal)
      await window.spark.kv.set('deals', deals)
      await this.triggerWebhooks('deal.created', newDeal)
      return { status: 201, data: { data: newDeal } }
    }

    if (method === 'GET' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const deal = deals.find(d => d.id === parts[1])
        return { s
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Deal ikke funnet' } } }
       
      return { status: 200, data: { data: deal } }
    }

      return { status: 200, data: { data: updatedTa
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'update')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
       
      const index = deals.findIndex(d => d.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Deal ikke funnet' } } }
      }
        completed: true,
        ...deals[index],
      tasks[inde
      }
      deals[index] = updatedDeal
      await window.spark.kv.set('deals', deals)
      await this.triggerWebhooks('deal.updated', updatedDeal)
      return { status: 200, data: { data: updatedDeal } }
    }

    if (method === 'DELETE' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'deals', 'delete')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const index = deals.findIndex(d => d.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Deal ikke funnet' } } }
      }
  }
      deals.splice(index, 1)
    method: string,
      await this.triggerWebhooks('deal.deleted', deletedDeal)
      return { status: 200, data: { data: { success: true } } }
    c

    return {
      status: 405,
      data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke tillatt' } },
    }


      if (!hasPermission) {
    method: string,
    parts: string[],
    apiKey: string,
    body: any
  ): Promise<{ status: number; data: any }> {
    const tasks = await window.spark.kv.get<any[]>('tasks') || []

      return { status: 201, data: { data: newEmai
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'read')
    if (method === 'GET' &&
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      return { status: 200, data: { data: tasks } }
     

    if (method === 'POST' && parts.length === 1) {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'create')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
       
      const newTask = {
        return {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      tasks.push(newTask)
      await window.spark.kv.set('tasks', tasks)
      await this.triggerWebhooks('task.created', newTask)
      return { status: 201, data: { data: newTask } }
    }

    if (method === 'GET' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const task = tasks.find(t => t.id === parts[1])

        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Oppgave ikke funnet' } } }

      return { status: 200, data: { data: task } }
    }

    if (method === 'PATCH' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'update')

        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }


      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Oppgave ikke funnet' } } }
      }

        ...tasks[index],
        ...body,
      }
      tasks[index] = updatedTask
      await window.spark.kv.set('tasks', tasks)
      await this.triggerWebhooks('task.updated', updatedTask)

    }

    if (method === 'PATCH' && parts.length === 3 && parts[2] === 'complete') {

      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }

      const index = tasks.findIndex(t => t.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Oppgave ikke funnet' } } }
      }
      const completedTask = {
        ...tasks[index],
        completed: true,
        completedAt: new Date().toISOString(),
      }
      tasks[index] = completedTask

      await this.triggerWebhooks('task.completed', completedTask)
      return { status: 200, data: { data: completedTask } }


    if (method === 'DELETE' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'delete')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const index = tasks.findIndex(t => t.id === parts[1])
      if (index === -1) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Oppgave ikke funnet' } } }
      }
      const deletedTask = tasks[index]
      tasks.splice(index, 1)
      await window.spark.kv.set('tasks', tasks)
      await this.triggerWebhooks('task.deleted', deletedTask)
      return { status: 200, data: { data: { success: true } } }
    }


      status: 405,
      data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke tillatt' } },
    }
  }


    method: string,
    parts: string[],
    apiKey: string,
    body: any
  ): Promise<{ status: number; data: any }> {
    const emails = await window.spark.kv.get<any[]>('emails') || []


      const hasPermission = await this.checkPermission(apiKey, 'emails', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      return { status: 200, data: { data: emails } }



      const hasPermission = await this.checkPermission(apiKey, 'emails', 'create')

        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }

      const newEmail = {
        ...body,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),

      }
      emails.push(newEmail)
      await window.spark.kv.set('emails', emails)

      return { status: 201, data: { data: newEmail } }
    }

    if (method === 'GET' && parts.length === 2) {
      const hasPermission = await this.checkPermission(apiKey, 'emails', 'read')
      if (!hasPermission) {
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }
      }
      const email = emails.find(e => e.id === parts[1])

        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'E-post ikke funnet' } } }

      return { status: 200, data: { data: email } }


    if (method === 'GET' && parts.length === 3 && parts[2] === 'tracking') {
      const hasPermission = await this.checkPermission(apiKey, 'emails', 'read')

        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }

      const email = emails.find(e => e.id === parts[1])
      if (!email) {
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'E-post ikke funnet' } } }
      }
      return {
        status: 200,
        data: {
          data: {
            emailId: email.id,
            openCount: email.openCount || 0,
            clickCount: email.clickCount || 0,
            status: email.status,
          }
        }
      }



      status: 405,

    }

}

export const apiServer = new ApiServer()
