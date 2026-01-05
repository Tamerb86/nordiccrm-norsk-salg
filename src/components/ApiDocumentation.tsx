import { useState } from 'react'
import { Copy, Check } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CodeBlockProps {
  code: string
  language?: string
}

function CodeBlock({ code, language = 'json' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 z-10"
        onClick={handleCopy}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </Button>
      <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto">
        {code}
      </pre>
    </div>
  )
}

export default function ApiDocumentation() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">API-dokumentasjon</h2>
          <p className="text-muted-foreground">
            Komplett dokumentasjon for Norwegian CRM API med kodeeksempler
          </p>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3">Grunnleggende</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <CodeBlock code="https://api.your-crm.no/v1" language="text" />
              </div>

              <div>
                <h4 className="font-medium mb-2">Autentisering</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Alle API-forespørsler krever en API-nøkkel i Authorization-headeren:
                </p>
                <CodeBlock code="Authorization: Bearer YOUR_API_KEY" language="text" />
              </div>

              <div>
                <h4 className="font-medium mb-2">Rate Limiting</h4>
                <p className="text-sm text-muted-foreground">
                  Standard grense: 1000 forespørsler per time per API-nøkkel
                </p>
              </div>
            </div>
          </section>

          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="contacts">Kontakter</TabsTrigger>
              <TabsTrigger value="deals">Avtaler</TabsTrigger>
              <TabsTrigger value="tasks">Oppgaver</TabsTrigger>
              <TabsTrigger value="emails">E-post</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/contacts</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Hent alle kontakter</p>
                  
                  <h5 className="font-medium text-sm mb-2">Query Parameters</h5>
                  <div className="text-sm space-y-1 mb-3">
                    <div><code>status</code> - Filtrer etter status (lead, prospect, customer, lost)</div>
                    <div><code>limit</code> - Antall resultater (standard: 50, maks: 100)</div>
                    <div><code>offset</code> - Offset for paginering</div>
                  </div>

                  <h5 className="font-medium text-sm mb-2">Eksempel</h5>
                  <CodeBlock code={`curl -X GET "https://api.your-crm.no/v1/contacts?status=lead&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />

                  <h5 className="font-medium text-sm mb-2 mt-3">Respons</h5>
                  <CodeBlock code={`{
  "data": [
    {
      "id": "cnt_123abc",
      "firstName": "Ola",
      "lastName": "Nordmann",
      "email": "ola@example.no",
      "phone": "+47 123 45 678",
      "company": "Acme AS",
      "status": "lead",
      "tags": ["viktig", "b2b"],
      "value": 50000,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "limit": 10,
    "offset": 0
  }
}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-mono rounded">POST</span>
                    <code className="text-sm">/api/contacts</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Opprett ny kontakt</p>

                  <h5 className="font-medium text-sm mb-2">Request Body</h5>
                  <CodeBlock code={`{
  "firstName": "Kari",
  "lastName": "Hansen",
  "email": "kari@example.no",
  "phone": "+47 987 65 432",
  "company": "Hansen Consulting",
  "status": "lead",
  "tags": ["web", "b2c"],
  "value": 25000,
  "notes": "Interessert i webløsning"
}`} />

                  <h5 className="font-medium text-sm mb-2 mt-3">Eksempel</h5>
                  <CodeBlock code={`curl -X POST "https://api.your-crm.no/v1/contacts" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"firstName":"Kari","lastName":"Hansen","email":"kari@example.no"}'`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/contacts/:id</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Hent en spesifikk kontakt</p>

                  <h5 className="font-medium text-sm mb-2">Eksempel</h5>
                  <CodeBlock code={`curl -X GET "https://api.your-crm.no/v1/contacts/cnt_123abc" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-mono rounded">PUT</span>
                    <code className="text-sm">/api/contacts/:id</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Oppdater kontakt</p>

                  <h5 className="font-medium text-sm mb-2">Eksempel</h5>
                  <CodeBlock code={`curl -X PUT "https://api.your-crm.no/v1/contacts/cnt_123abc" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"customer","value":75000}'`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-mono rounded">DELETE</span>
                    <code className="text-sm">/api/contacts/:id</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Slett kontakt</p>

                  <h5 className="font-medium text-sm mb-2">Eksempel</h5>
                  <CodeBlock code={`curl -X DELETE "https://api.your-crm.no/v1/contacts/cnt_123abc" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deals" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/deals</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Hent alle avtaler</p>

                  <h5 className="font-medium text-sm mb-2">Query Parameters</h5>
                  <div className="text-sm space-y-1 mb-3">
                    <div><code>stage</code> - Filtrer etter stadium</div>
                    <div><code>contactId</code> - Filtrer etter kontakt</div>
                    <div><code>minValue</code> - Minimumsverdi</div>
                    <div><code>maxValue</code> - Maksimumsverdi</div>
                  </div>

                  <h5 className="font-medium text-sm mb-2">Respons</h5>
                  <CodeBlock code={`{
  "data": [
    {
      "id": "deal_456xyz",
      "title": "Nettside redesign",
      "contactId": "cnt_123abc",
      "stage": "proposal",
      "value": 150000,
      "probability": 60,
      "expectedCloseDate": "2024-02-28",
      "createdAt": "2024-01-10T09:00:00Z"
    }
  ]
}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-mono rounded">POST</span>
                    <code className="text-sm">/api/deals</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Opprett ny avtale</p>

                  <h5 className="font-medium text-sm mb-2">Request Body</h5>
                  <CodeBlock code={`{
  "title": "CRM implementering",
  "contactId": "cnt_123abc",
  "stage": "qualification",
  "value": 200000,
  "probability": 30,
  "expectedCloseDate": "2024-03-15",
  "description": "Implementering av CRM-system"
}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-mono rounded">PATCH</span>
                    <code className="text-sm">/api/deals/:id/stage</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Flytt avtale til nytt stadium</p>

                  <h5 className="font-medium text-sm mb-2">Eksempel</h5>
                  <CodeBlock code={`curl -X PATCH "https://api.your-crm.no/v1/deals/deal_456xyz/stage" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"stage":"negotiation","probability":75}'`} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/tasks</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Hent alle oppgaver</p>

                  <h5 className="font-medium text-sm mb-2">Query Parameters</h5>
                  <div className="text-sm space-y-1 mb-3">
                    <div><code>completed</code> - Filtrer etter status (true/false)</div>
                    <div><code>priority</code> - Filtrer etter prioritet (low, medium, high)</div>
                    <div><code>dueDate</code> - Filtrer etter forfallsdato</div>
                  </div>

                  <h5 className="font-medium text-sm mb-2">Respons</h5>
                  <CodeBlock code={`{
  "data": [
    {
      "id": "task_789def",
      "title": "Ring opp for oppfølging",
      "contactId": "cnt_123abc",
      "dealId": "deal_456xyz",
      "dueDate": "2024-01-20",
      "priority": "high",
      "type": "call",
      "completed": false,
      "createdAt": "2024-01-15T14:00:00Z"
    }
  ]
}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-mono rounded">POST</span>
                    <code className="text-sm">/api/tasks</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Opprett ny oppgave</p>

                  <h5 className="font-medium text-sm mb-2">Eksempel</h5>
                  <CodeBlock code={`curl -X POST "https://api.your-crm.no/v1/tasks" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Send tilbud",
    "contactId": "cnt_123abc",
    "dueDate": "2024-01-25",
    "priority": "high",
    "type": "email"
  }'`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-mono rounded">PATCH</span>
                    <code className="text-sm">/api/tasks/:id/complete</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Marker oppgave som fullført</p>

                  <h5 className="font-medium text-sm mb-2">Eksempel</h5>
                  <CodeBlock code={`curl -X PATCH "https://api.your-crm.no/v1/tasks/task_789def/complete" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emails" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-mono rounded">POST</span>
                    <code className="text-sm">/api/emails/send</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Send e-post</p>

                  <h5 className="font-medium text-sm mb-2">Request Body</h5>
                  <CodeBlock code={`{
  "contactId": "cnt_123abc",
  "to": "ola@example.no",
  "subject": "Oppfølging av møte",
  "body": "Hei Ola,\\n\\nTakk for møtet i dag...",
  "trackingEnabled": true,
  "scheduledAt": "2024-01-20T10:00:00Z"
}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/emails</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Hent e-posthistorikk</p>

                  <h5 className="font-medium text-sm mb-2">Respons</h5>
                  <CodeBlock code={`{
  "data": [
    {
      "id": "email_101abc",
      "contactId": "cnt_123abc",
      "subject": "Oppfølging av møte",
      "status": "opened",
      "sentAt": "2024-01-20T10:00:00Z",
      "openedAt": "2024-01-20T11:30:00Z",
      "openCount": 2,
      "clickCount": 1
    }
  ]
}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/emails/:id/stats</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Hent e-poststatistikk</p>

                  <h5 className="font-medium text-sm mb-2">Respons</h5>
                  <CodeBlock code={`{
  "id": "email_101abc",
  "openRate": 100,
  "clickRate": 50,
  "openCount": 2,
  "clickCount": 1,
  "lastOpenedAt": "2024-01-20T14:15:00Z"
}`} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Webhook Events</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Webhooks sender POST-forespørsler til din URL når hendelser oppstår.
                  </p>

                  <h5 className="font-medium text-sm mb-2">Tilgjengelige hendelser</h5>
                  <div className="text-sm space-y-1 mb-4">
                    <div><code>contact.created</code> - Ny kontakt opprettet</div>
                    <div><code>contact.updated</code> - Kontakt oppdatert</div>
                    <div><code>deal.created</code> - Ny avtale opprettet</div>
                    <div><code>deal.stage_changed</code> - Avtale flyttet til nytt stadium</div>
                    <div><code>deal.closed</code> - Avtale lukket (vunnet/tapt)</div>
                    <div><code>task.completed</code> - Oppgave fullført</div>
                    <div><code>email.sent</code> - E-post sendt</div>
                    <div><code>email.opened</code> - E-post åpnet</div>
                  </div>

                  <h5 className="font-medium text-sm mb-2">Webhook Payload</h5>
                  <CodeBlock code={`{
  "event": "contact.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "cnt_123abc",
    "firstName": "Ola",
    "lastName": "Nordmann",
    "email": "ola@example.no",
    "status": "lead"
  },
  "signature": "sha256=abc123..."
}`} />
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Verifisering av signatur</h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    Hver webhook inkluderer en signatur i headeren:
                  </p>
                  <CodeBlock code={`X-Webhook-Signature: sha256=abc123...`} language="text" />
                  
                  <p className="text-sm text-muted-foreground mt-2 mb-2">
                    Verifiser signaturen med din webhook-hemmelighet:
                  </p>
                  <CodeBlock code={`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}`} language="javascript" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <section>
            <h3 className="text-xl font-semibold mb-3">Feilhåndtering</h3>
            <div className="space-y-2">
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <code className="font-mono text-sm">400</code>
                  <span className="font-medium">Bad Request</span>
                </div>
                <p className="text-sm text-muted-foreground">Ugyldig forespørsel eller manglende påkrevde felt</p>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <code className="font-mono text-sm">401</code>
                  <span className="font-medium">Unauthorized</span>
                </div>
                <p className="text-sm text-muted-foreground">Manglende eller ugyldig API-nøkkel</p>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <code className="font-mono text-sm">403</code>
                  <span className="font-medium">Forbidden</span>
                </div>
                <p className="text-sm text-muted-foreground">API-nøkkelen har ikke tilgang til denne ressursen</p>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <code className="font-mono text-sm">404</code>
                  <span className="font-medium">Not Found</span>
                </div>
                <p className="text-sm text-muted-foreground">Ressursen finnes ikke</p>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <code className="font-mono text-sm">429</code>
                  <span className="font-medium">Too Many Requests</span>
                </div>
                <p className="text-sm text-muted-foreground">Rate limit overskredet</p>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <code className="font-mono text-sm">500</code>
                  <span className="font-medium">Internal Server Error</span>
                </div>
                <p className="text-sm text-muted-foreground">Serverfeil - kontakt support</p>
              </div>
            </div>

            <h5 className="font-medium text-sm mb-2 mt-4">Feilrespons format</h5>
            <CodeBlock code={`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email-feltet er påkrevd",
    "field": "email"
  }
}`} />
          </section>
        </div>
      </div>
    </Card>
  )
}
