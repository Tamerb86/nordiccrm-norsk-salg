import crypto from 'crypto'

const MOCK_API_KEY = 'test_api_key_12345'

  }


  id: string
  name: string
  resourcePermissions?: Array<{
    actions: string[
  isActive: boolean
  cr

  id: string
  events: string[]
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
    r
    
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

        return await this.handleTasksRequest(method, parts
        return await this.handleEmailsRequest(method, parts,

         
      }
      return {
        data: {
            code: 'INTERNAL_ERROR',
          },
      }
  }
  private async handleContactsRequest(
    parts: str
    apiKey: stri
    const contacts = a
    if (method === 'GET' && parts.length === 1) {
      if 
      }
      return { status

      const hasPermi
        return 

        id: `cnt_${Date.now()}${Mat
        createdAt: new Date().toISOString(),
      }
      cont
      a
     


        return { status: 403, data: { 

      if (!contact) 
      }
      return { sta

      const hasPermission = await this.checkPermission(apiKey, '


      if (index === -1) {
      }
      const updatedContact = {
       

      }
     

      return { status: 200, data: { data: updatedC

      const hasPermission =
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }


      }
      const deletedContact = contacts[index]
      await spar

    }
    ret

    method: string,
    body: any,
  ): Promise<{ status: number; data: any }> {

      const hasPermission = await this.checkPermission(a
     

    }
    if (method === 'POST' && parts.length === 1) {
      if (!hasPermission) {
      }
      c

        updatedAt: new Date().toISOString(),

      await spark.kv.set('deals', deals)


    if (method === 'PATCH' && parts.length === 3 && p
     

      const index = deals.findIndex(d => d.id ===
        return { status: 404, data: { error: { code: 'NOT_FOUND', message: 'Avtale 

      deals[index] = {
       


      await this.triggerW
        previousStage: oldStage,


    return { status: 405, data

    method: stri
    body: any,
  ): Promise<{ status: number; data: any }> {

      c


    }
    if (method === 'POST' && parts.length === 1) {

      }
     

        createdAt: new Date().toISOString(),
      }
      tasks.push(newTask)
      await this.triggerWebhooks('task.created', newTask)
      r

      const hasPermission = await this.checkPermission(apiKey,
        return { status: 

      i

      tasks[index] = {
        completed: true,
        updatedAt: new Date().toISOString(),


      return { status: 200, data: { data


  private async handleEmailsRequest(
   

    const emails = await spark.kv.g
    if (method === 
      if (!hasPermis
      }
      return { sta

      const hasPermission = await this.checkPermission(api


        id: `email_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        status: body.schedu
        openCount: 0,
       


     

      }
      return { status: 201, data: { data: newEmail } }

      const hasPermission = await this.checkPermission(apiKey, 'emails', 'read')
       

      if (!email) {
      }
      const stat
        openRate: email.openCount > 0 ? 100 
        openCount: email.openCount,
      }


  }













































































































































































