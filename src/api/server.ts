const MOCK_API_KEY = 'test_

  name: string

interface ApiKeyData {
  id: string
  name: string
  key: string
  permissions: string[]
  resourcePermissions?: Array<{
    resource: string
    actions: string[]
  na
  isActive: boolean
  createdAt: string
  lastUsedAt?: string
 

    ['sign']
  
  const hashAr
  
}
class ApiServer 

    if (apiKey === 
 

    
      key.lastUsedAt = new Da

    
  }
  private async c
    r

      return true

    
    if (!key) 
    }
    if (key.permissions.includes('*') || key.
    }
    i
    
      }
   

  private async triggerWebhooks(
    const activeWeb
    )
    for (const web
        const payload =
          timestamp: new Date().to
        }
     

          headers: {
            'X-Webhook-Signature': `sha256=${signature}`,
    
      } catch (
      }
  }

    method: string,
    headers: Reco
    c

      return {
        data: { error: { code: 'UNAUTHORIZED', message: 'API-nøkkel mangler' } },
    }
    const isValid =
    if 
     
    

   

        return await this.handleContactsRequest(method, par
      if (parts[0] === 'deals') {
      }
        return await this.handleTasksRequest
     

      return {
        dat
    } catch (error) {
        status: 
          error: {
            mes
        }


    method: string,
    body: any,
  ): Promise<{ status: n

      const hasPermission = await 
        return { status: 
      return { statu

      const hasPermission = await this.checkPermission(ap
        retu

        ..
        createdAt: new 
      contacts.push(newContact)
      a
     


        return { statu

      if (!contact)
      }
    }
    if (method === 'PATCH' && parts.length ==
      if (!hasPermission) {
      }

        return { s
      const up
        ...body,
      }
      a


    if (method === 'DELETE' && parts.length === 2) {

      }
      const in
        return { sta
      const deletedContact = contacts[index]
      a


    return { status: 405, data: { error: { code: 'METHOD_N


    body:
  ): Promise<{ status: number; data:

      c
        return { status: 403, dat
      return { status: 200, data: { data: deals } }

      const hasPermission = await
        return { status: 403, data: { error: { code: 'FORBIDDEN', message

        ...body,
        createdAt: new Date().toISOString(),
      }


    }
    if (method === 'PATCH' && parts.length === 3 && parts[2] === 'stage') {
      i
      }
      const in
        return { sta

      deals[index]
        stage: body.stage,
      }
      await 
        pr
      }
     


  private async handleTasksRequest(
    parts: string[]
    apiKey: string
    const task
    if (method ===
      if (!hasPermission) {
      }

    if (method === 'POST' && parts.length === 1) 
      if (!hasPermission) {
      }
      const newTask = {
       
      }
     

    }
    if (method === 'PATCH' && parts.length === 3 && parts[2] === 'complete') {
      if (!hasPermission) {
      }
      c


        ...tasks
        updatedAt: new Date().toISOString(),
      await window.spark.kv.set('tasks', tas

    }
    return { status: 405, data: { error: { cod


    body: any,
  ): 

      const hasPermission = await this.checkPermi
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen 
      return { status: 200,

      c


        ...body,
        status: body.scheduledFor ? 'scheduled' : 'sent',
       
        createdAt: new Date().toISOString(),
     

      return { status: 201, data: { data: newEmail 

      const hasPermission =
        return { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Ingen tilgang' } } }


      }
        openRate: email.o
        openCount: email.openCount,
      }
      return { status: 200, da

  }

























































































































































































































