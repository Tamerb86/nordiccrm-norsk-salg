import { useState } from 'react'
import { Play, Copy, Check } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { createApiClient } from '@/lib/api-client'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface QueryParam {
  name: string
  type: string
  description: string
  required?: boolean
}

interface Endpoint {
  method: HttpMethod
  path: string
  description: string
  category: string
  sampleBody?: string
  queryParams?: QueryParam[]
}

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/contacts',
    description: 'Hent alle kontakter',
    category: 'contacts',
    queryParams: [
      { name: 'status', type: 'string', description: 'Filtrer etter status (lead, prospect, customer, lost)' },
      { name: 'limit', type: 'number', description: 'Antall resultater (standard: 50, maks: 100)' },
      { name: 'offset', type: 'number', description: 'Offset for paginering' },
    ],
  },
  {
    method: 'POST',
    path: '/api/contacts',
    description: 'Opprett ny kontakt',
    category: 'contacts',
    sampleBody: JSON.stringify({
      firstName: 'Kari',
      lastName: 'Hansen',
      email: 'kari@example.no',
      phone: '+47 987 65 432',
      company: 'Hansen Consulting',
      status: 'lead',
      tags: ['web', 'b2c'],
      value: 25000,
      notes: 'Interessert i webløsning',
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/contacts/:id',
    description: 'Hent en spesifikk kontakt',
    category: 'contacts',
  },
  {
    method: 'PUT',
    path: '/api/contacts/:id',
    description: 'Oppdater kontakt',
    category: 'contacts',
    sampleBody: JSON.stringify({
      status: 'customer',
      value: 75000,
    }, null, 2),
  },
  {
    method: 'DELETE',
    path: '/api/contacts/:id',
    description: 'Slett kontakt',
    category: 'contacts',
  },
  {
    method: 'GET',
    path: '/api/deals',
    description: 'Hent alle avtaler',
    category: 'deals',
    queryParams: [
      { name: 'stage', type: 'string', description: 'Filtrer etter stadium' },
      { name: 'contactId', type: 'string', description: 'Filtrer etter kontakt' },
      { name: 'minValue', type: 'number', description: 'Minimumsverdi' },
      { name: 'maxValue', type: 'number', description: 'Maksimumsverdi' },
    ],
  },
  {
    method: 'POST',
    path: '/api/deals',
    description: 'Opprett ny avtale',
    category: 'deals',
    sampleBody: JSON.stringify({
      title: 'CRM implementering',
      contactId: 'cnt_123abc',
      stage: 'qualification',
      value: 200000,
      probability: 30,
      expectedCloseDate: '2024-03-15',
      description: 'Implementering av CRM-system',
    }, null, 2),
  },
  {
    method: 'PATCH',
    path: '/api/deals/:id/stage',
    description: 'Flytt avtale til nytt stadium',
    category: 'deals',
    sampleBody: JSON.stringify({
      stage: 'negotiation',
      probability: 75,
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/tasks',
    description: 'Hent alle oppgaver',
    category: 'tasks',
    queryParams: [
      { name: 'completed', type: 'boolean', description: 'Filtrer etter status (true/false)' },
      { name: 'priority', type: 'string', description: 'Filtrer etter prioritet (low, medium, high)' },
      { name: 'dueDate', type: 'string', description: 'Filtrer etter forfallsdato' },
    ],
  },
  {
    method: 'POST',
    path: '/api/tasks',
    description: 'Opprett ny oppgave',
    category: 'tasks',
    sampleBody: JSON.stringify({
      title: 'Send tilbud',
      contactId: 'cnt_123abc',
      dueDate: '2024-01-25',
      priority: 'high',
      type: 'email',
    }, null, 2),
  },
  {
    method: 'PATCH',
    path: '/api/tasks/:id/complete',
    description: 'Marker oppgave som fullført',
    category: 'tasks',
  },
  {
    method: 'POST',
    path: '/api/emails/send',
    description: 'Send e-post',
    category: 'emails',
    sampleBody: JSON.stringify({
      contactId: 'cnt_123abc',
      to: 'ola@example.no',
      subject: 'Oppfølging av møte',
      body: 'Hei Ola,\\n\\nTakk for møtet i dag...',
      trackingEnabled: true,
      scheduledAt: '2024-01-20T10:00:00Z',
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/emails',
    description: 'Hent e-posthistorikk',
    category: 'emails',
  },
  {
    method: 'GET',
    path: '/api/emails/:id/stats',
    description: 'Hent e-poststatistikk',
    category: 'emails',
  },
]

const methodColors: Record<HttpMethod, string> = {
  GET: 'bg-accent text-accent-foreground',
  POST: 'bg-primary text-primary-foreground',
  PUT: 'bg-orange-500 text-white',
  PATCH: 'bg-orange-500 text-white',
  DELETE: 'bg-destructive text-destructive-foreground',
}

export default function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(endpoints[0])
  const [apiKey, setApiKey] = useState('')
  const [pathParams, setPathParams] = useState('')
  const [queryParams, setQueryParams] = useState('')
  const [requestBody, setRequestBody] = useState(endpoints[0].sampleBody || '')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const handleEndpointChange = (endpointString: string) => {
    const endpoint = endpoints.find(e => `${e.method} ${e.path}` === endpointString)
    if (endpoint) {
      setSelectedEndpoint(endpoint)
      setRequestBody(endpoint.sampleBody || '')
      setQueryParams('')
      setPathParams('')
      setResponse('')
      setResponseStatus(null)
      setResponseTime(null)
    }
  }

  const handleExecute = async () => {
    if (!apiKey.trim()) {
      toast.error('API-nøkkel påkrevd', {
        description: 'Vennligst legg til en API-nøkkel for å teste endepunktet',
      })
      return
    }

    setIsLoading(true)
    setResponse('')
    setResponseStatus(null)
    setResponseTime(null)

    const startTime = Date.now()

    try {
      const client = createApiClient(apiKey)
      let result: any
      let parsedBody: any = null

      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method)) {
        try {
          parsedBody = JSON.parse(requestBody)
        } catch (e) {
          throw new Error('Ugyldig JSON i request body')
        }
      }

      let path = selectedEndpoint.path
      const pathId = pathParams || 'example_id'
      if (path.includes(':id')) {
        path = path.replace(':id', pathId)
      }

      if (path === '/api/contacts' && selectedEndpoint.method === 'GET') {
        result = await client.getContacts()
      } else if (path === '/api/contacts' && selectedEndpoint.method === 'POST') {
        result = await client.createContact(parsedBody)
      } else if (path.includes('/api/contacts/') && selectedEndpoint.method === 'GET') {
        result = await client.getContact(pathId)
      } else if (path.includes('/api/contacts/') && selectedEndpoint.method === 'PUT') {
        result = await client.updateContact(pathId, parsedBody)
      } else if (path.includes('/api/contacts/') && selectedEndpoint.method === 'DELETE') {
        result = await client.deleteContact(pathId)
      } else if (path === '/api/deals' && selectedEndpoint.method === 'GET') {
        result = await client.getDeals()
      } else if (path === '/api/deals' && selectedEndpoint.method === 'POST') {
        result = await client.createDeal(parsedBody)
      } else if (path.includes('/api/deals/') && path.includes('/stage') && selectedEndpoint.method === 'PATCH') {
        result = await client.updateDealStage(pathId, parsedBody.stage, parsedBody.probability)
      } else if (path === '/api/tasks' && selectedEndpoint.method === 'GET') {
        result = await client.getTasks()
      } else if (path === '/api/tasks' && selectedEndpoint.method === 'POST') {
        result = await client.createTask(parsedBody)
      } else if (path.includes('/api/tasks/') && path.includes('/complete') && selectedEndpoint.method === 'PATCH') {
        result = await client.completeTask(pathId)
      } else if (path === '/api/emails' && selectedEndpoint.method === 'GET') {
        result = await client.getEmails()
      } else if (path === '/api/emails/send' && selectedEndpoint.method === 'POST') {
        result = await client.sendEmail(parsedBody)
      } else if (path.includes('/api/emails/') && path.includes('/stats') && selectedEndpoint.method === 'GET') {
        result = await client.getEmailStats(pathId)
      } else {
        result = {
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'Dette endepunktet er ikke implementert ennå',
          },
        }
      }

      const endTime = Date.now()
      setResponseTime(endTime - startTime)

      if (result.error) {
        setResponseStatus(result.error.code === 'UNAUTHORIZED' ? 401 : result.error.code === 'FORBIDDEN' ? 403 : result.error.code === 'NOT_FOUND' ? 404 : 400)
        setResponse(JSON.stringify(result, null, 2))
        toast.error('Forespørsel feilet', {
          description: result.error.message,
        })
      } else {
        setResponseStatus(selectedEndpoint.method === 'POST' ? 201 : selectedEndpoint.method === 'DELETE' ? 204 : 200)
        setResponse(JSON.stringify(result, null, 2))
        toast.success('Forespørsel fullført', {
          description: `${selectedEndpoint.method} ${path}`,
        })
      }
    } catch (error) {
      const endTime = Date.now()
      setResponseTime(endTime - startTime)
      setResponseStatus(500)
      setResponse(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'En feil oppstod',
        },
      }, null, 2))

      toast.error('Forespørsel feilet', {
        description: error instanceof Error ? error.message : 'En feil oppstod',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Kopiert til utklippstavlen')
  }

  const generateCurlCommand = () => {
    let path = selectedEndpoint.path
    if (pathParams && path.includes(':id')) {
      path = path.replace(':id', pathParams)
    }
    if (queryParams) {
      path += `?${queryParams}`
    }

    const url = `https://api.your-crm.no/v1${path}`
    let curl = `curl -X ${selectedEndpoint.method} "${url}" \\\n  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}"`

    if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBody) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/\n\s*/g, '')}'`
    }

    return curl
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">API Playground</h2>
          <p className="text-muted-foreground">
            Test API-endepunktene direkte i nettleseren
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="endpoint">Endepunkt</Label>
              <Select
                value={`${selectedEndpoint.method} ${selectedEndpoint.path}`}
                onValueChange={handleEndpointChange}
              >
                <SelectTrigger id="endpoint" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 font-semibold text-xs text-muted-foreground">Kontakter</div>
                  {endpoints.filter(e => e.category === 'contacts').map(endpoint => (
                    <SelectItem key={`${endpoint.method} ${endpoint.path}`} value={`${endpoint.method} ${endpoint.path}`}>
                      <div className="flex items-center gap-2">
                        <Badge className={`${methodColors[endpoint.method]} text-xs px-1.5 py-0`}>
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm">{endpoint.path}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="p-2 font-semibold text-xs text-muted-foreground mt-2">Avtaler</div>
                  {endpoints.filter(e => e.category === 'deals').map(endpoint => (
                    <SelectItem key={`${endpoint.method} ${endpoint.path}`} value={`${endpoint.method} ${endpoint.path}`}>
                      <div className="flex items-center gap-2">
                        <Badge className={`${methodColors[endpoint.method]} text-xs px-1.5 py-0`}>
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm">{endpoint.path}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="p-2 font-semibold text-xs text-muted-foreground mt-2">Oppgaver</div>
                  {endpoints.filter(e => e.category === 'tasks').map(endpoint => (
                    <SelectItem key={`${endpoint.method} ${endpoint.path}`} value={`${endpoint.method} ${endpoint.path}`}>
                      <div className="flex items-center gap-2">
                        <Badge className={`${methodColors[endpoint.method]} text-xs px-1.5 py-0`}>
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm">{endpoint.path}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="p-2 font-semibold text-xs text-muted-foreground mt-2">E-post</div>
                  {endpoints.filter(e => e.category === 'emails').map(endpoint => (
                    <SelectItem key={`${endpoint.method} ${endpoint.path}`} value={`${endpoint.method} ${endpoint.path}`}>
                      <div className="flex items-center gap-2">
                        <Badge className={`${methodColors[endpoint.method]} text-xs px-1.5 py-0`}>
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm">{endpoint.path}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1.5">
                {selectedEndpoint.description}
              </p>
            </div>

            <div>
              <Label htmlFor="api-key">API-nøkkel</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk_live_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1.5 font-mono text-sm"
              />
            </div>

            {selectedEndpoint.path.includes(':id') && (
              <div>
                <Label htmlFor="path-params">Path Parameter (ID)</Label>
                <Input
                  id="path-params"
                  placeholder="cnt_123abc"
                  value={pathParams}
                  onChange={(e) => setPathParams(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
              </div>
            )}

            {selectedEndpoint.queryParams && selectedEndpoint.queryParams.length > 0 && (
              <div>
                <Label htmlFor="query-params">Query Parameters</Label>
                <Input
                  id="query-params"
                  placeholder="status=lead&limit=10"
                  value={queryParams}
                  onChange={(e) => setQueryParams(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
                <div className="mt-2 space-y-1">
                  {selectedEndpoint.queryParams.map(param => (
                    <div key={param.name} className="text-xs text-muted-foreground">
                      <code className="bg-muted px-1 py-0.5 rounded">{param.name}</code>
                      <span className="mx-1">•</span>
                      <span className="italic">{param.type}</span>
                      <span className="mx-1">•</span>
                      <span>{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
              <div>
                <Label htmlFor="request-body">Request Body (JSON)</Label>
                <Textarea
                  id="request-body"
                  placeholder="{}"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="mt-1.5 font-mono text-xs h-48"
                />
              </div>
            )}

            <Button 
              onClick={handleExecute} 
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              <Play size={18} weight="fill" />
              {isLoading ? 'Utfører...' : 'Utfør forespørsel'}
            </Button>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="response" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="response">Respons</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>

              <TabsContent value="response" className="space-y-3 mt-4">
                {responseStatus !== null && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={responseStatus >= 200 && responseStatus < 300 ? 'default' : 'destructive'}
                        className="font-mono"
                      >
                        {responseStatus}
                      </Badge>
                      {responseTime !== null && (
                        <span className="text-sm text-muted-foreground">
                          {responseTime}ms
                        </span>
                      )}
                    </div>
                    {response && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyResponse}
                        className="gap-2"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        Kopier
                      </Button>
                    )}
                  </div>
                )}

                <ScrollArea className="h-[500px] w-full rounded-lg border bg-muted/50">
                  {response ? (
                    <pre className="p-4 text-xs font-mono">
                      {response}
                    </pre>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground flex items-center justify-center h-full">
                      {isLoading ? 'Utfører forespørsel...' : 'Responsen vil vises her'}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="curl" className="mt-4">
                <ScrollArea className="h-[500px] w-full rounded-lg border bg-muted/50">
                  <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
                    {generateCurlCommand()}
                  </pre>
                </ScrollArea>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generateCurlCommand())
                    toast.success('cURL-kommando kopiert')
                  }}
                  className="w-full mt-2 gap-2"
                >
                  <Copy size={16} />
                  Kopier cURL-kommando
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Card>
  )
}
