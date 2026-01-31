const MOCK_API_KEY = 'test_key_12345'

interface ApiKeyData {
  id: string
  name: string
  key: string
  permissions: string[]
  resourcePermissions?: Array<{
  }>
  createdAt: string
}
class ApiServer {
    if (apiKey === 
    }
 

      key.lastUse
      return true
    
  }
  pri


    const key = keys.find(k => k.key === apiKey && k.isActive)
    
    }
    if (key.permissions.includes('*') || key.pe
    }
    if (key.resou
     
    
    
  }

    
      if (webhook.isActive && webh
          const p
     

          const signature = btoa(JSON.stringify(payload))
          await fetch(webhook.url, {
    
              '
            body: 
     
    
    }

    p
    
  ): Promise<{ status: number; dat
    
      return {
        data: { err
    }
    c
    
        data: { 
   

      
        return await this.handleContactsRequest(method, parts, apiKey, body)
    
      }
        return await this.handleTasksRequest(method, parts, api
      if (par
      }
      return {
        data: { e
    } catch (error) {
        sta
          
            message: error instanceof Error ? error.messa
        }
    }

    method: string,
    apiKey: string,
  ): Promise<{ status: number; data: any }> {

      const hasPermission = await this.ch
        retu
      return { status: 20

      con
       

   

      contacts.push(ne
      await this.
      return { stat

      const ha
        return { status: 403, data: { error: 

    
      }
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

      await window.spark.kv.set('tasks', tasks)


    if (method === 'PATCH' && parts.length === 3 && parts[2] === 'complete') {
   

      if (index === -1) {
      }
      tasks[index] =
        completed: 
      }
      await this.triggerWebhooks('task.comple
      return { status: 200, data: { data: tasks[index] } }

  }
  private async handleEmailsRequest(
    parts: string[],
    body: any,
    con
    if (method === 'GET' && parts.length === 1) {
     

    }
    if (method === 'POST' && parts.length === 1) {
      if (!hasPermission) {
      }
      c

        sentAt: body.sc
      }
      await wind

    }
    if (method === 'GET' 
      if (!hasPermission) {
      }

        return { status: 404, data: { error: { code: 
     

        clickCount: email.clickCount || 0,
      return { status: 200, data: { data: analytics } }

  }











































































































































