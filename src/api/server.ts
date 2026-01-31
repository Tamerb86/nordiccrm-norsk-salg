const MOCK_API_KEY = 'test_key_12345'

  name: string
  permission
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

    }
    const keys = await window.spark.kv.get<ApiKeyData[]>('
    
      key.lastUse
     

  }
  private async checkPermission(apiKey: string, resource: string, action
    

    const key = keys.find(k => k.key === apiK
    if (!key) {
    }
    i
    
    if (key.perm
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
    }

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
      if (part
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
      if (!hasPermis
      }
    }
    if (method === 'POST' && parts.
      if (!hasPermission) {
      }
      con
       
     
   

    }
    if (method === 
      if (!hasPermis
      }
      const co
        return { status: 404, data: { error: 
      return { status: 200, data: { data: contact } }

      const hasPermission = await this.checkPermi
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen 

      if (index === -1) {
      }
        ...contacts[index],
     


    }
    if (method === 'DELETE'
      if (!hasPermission) {
      }

      }
      contacts.splice(index, 1)
      await this
      return { status: 200, data: { data: { 

      status: 405,
    }

    me
    apiKey: string,
  ): 

      const hasPermission = await this.checkPermi
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen 
      return { status: 200,

      c


        id: Date.now(
        createdAt: new Date().toISOString(),
      d
      await this.triggerWebhooks('deal.created', newD
     

      const hasPermission = await this.checkPermiss
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen ti

      if (!deal) {
      }

    if (method === 'PATCH' && parts.length === 2) {
      if (!hasPermission)
      }
      c
        return { status: 404, 
      const updatedDeal = {
        ...body,
      d
      await this.triggerWebhooks('deal
      return { status: 200, data: { data: updatedDeal


        return { status: 403, data: { error: { code: 'FORBID
     

      const deletedDeal = deals[index]
      await window.spark.kv.set('deals', deals)

    }
    ret
      data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'M
  }
  private async handleTasksRequest(
    par
    body: any,
    const tasks = await window.
    if (method === 'GET' && parts.length === 1) {
      if (!hasPermission) {

    }
    i

      }
      const newTas
        ...body,
     
   

      return { status: 201, data: {

      const hasPermi
        return { st

      if (!task) {
      }

    if (method === 'PATCH' && parts.length === 2)
      if (!hasPermission) {
      }
      const index = tasks.findIndex(t => t.id === parts[1])
       
      const updatedTask = {
     

      await this.triggerWebhooks('task.updated', u
      return { status: 200, data: { data: updatedTask } }

      const hasPermission = await this.checkPermission(apiKey, 'tasks', 'update')
       

      if (index === -1)
      }
        ...tasks
        completedAt: new Date().toISOString(
      a
      return { status: 20

      const hasPermission = await this.checkPermission(ap
      
      const index = tasks.findIndex(t => t.id === par
     

      await window.spark.kv.set('tasks', tasks)

    }
    return {
      d

  private async handleEmailsRequest(
    parts: string[
    body: any,
    con
    if (method === 'GET' && parts.length === 1) {
     

    }
    if (method === 'POST' && parts.length === 1) {
      if (!hasPermission) {
      }
      c

        status: body.scheduledFor ? 'scheduled' : 'sent',
      emails.push(newEmai
      await this.triggerWebhooks('email.sent', newEmail)
      r

      const hasPermissio
        return {

      if (!email) {
      }
    }

      if (!hasPermission) {
     

        return { status: 404, data: { error: { code:

        emailId: email.id,
        openCount: email.openCount || 0,
      }
    }
    return {
      data: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode ikke tillatt' } },
  }










































































































































































































