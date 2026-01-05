import { useState } from 'react'
import { Key, Lightning, PlugsConnected, Book } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import ApiKeysManager from '@/components/ApiKeysManager'
import WebhooksManager from '@/components/WebhooksManager'
import IntegrationsManager from '@/components/IntegrationsManager'

export default function ApiIntegrationsView() {
  const [activeTab, setActiveTab] = useState('api-keys')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.api.title}</h1>
          <p className="text-muted-foreground mt-2">
            Administrer API-nøkler, webhooks og eksterne integrasjoner
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="api-keys" className="gap-2">
            <Key size={18} />
            <span className="hidden sm:inline">{t.api.apiKeys}</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Lightning size={18} />
            <span className="hidden sm:inline">{t.api.webhooks}</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <PlugsConnected size={18} />
            <span className="hidden sm:inline">{t.api.integrations}</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <Book size={18} />
            <span className="hidden sm:inline">{t.api.apiDocs}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <ApiKeysManager />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksManager />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsManager />
        </TabsContent>

        <TabsContent value="docs">
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">API-dokumentasjon</h2>
                <p className="text-muted-foreground">
                  Dokumentasjon for hvordan du bruker CRM API-et for å integrere med eksterne systemer.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Autentisering</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Alle API-forespørsler krever en API-nøkkel i headeren:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    {`Authorization: Bearer YOUR_API_KEY`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Endepunkter</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-mono rounded">
                          GET
                        </span>
                        <code className="text-sm">/api/contacts</code>
                      </div>
                      <p className="text-sm text-muted-foreground">Hent alle kontakter</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-mono rounded">
                          POST
                        </span>
                        <code className="text-sm">/api/contacts</code>
                      </div>
                      <p className="text-sm text-muted-foreground">Opprett en ny kontakt</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-mono rounded">
                          GET
                        </span>
                        <code className="text-sm">/api/deals</code>
                      </div>
                      <p className="text-sm text-muted-foreground">Hent alle avtaler</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-mono rounded">
                          POST
                        </span>
                        <code className="text-sm">/api/deals</code>
                      </div>
                      <p className="text-sm text-muted-foreground">Opprett en ny avtale</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-mono rounded">
                          POST
                        </span>
                        <code className="text-sm">/api/emails</code>
                      </div>
                      <p className="text-sm text-muted-foreground">Send en e-post</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Webhooks</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Webhooks sender POST-forespørsler til din URL når hendelser oppstår. Hver forespørsel inkluderer:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
{`{
  "event": "contact.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "123",
    "firstName": "Ola",
    "lastName": "Nordmann",
    ...
  }
}`}
                  </pre>
                  <p className="text-sm text-muted-foreground mt-3">
                    Verifiser webhook-signaturen ved å bruke hemmeligheten som er oppgitt i webhook-konfigurasjonen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Ratebegrensning</h3>
                  <p className="text-sm text-muted-foreground">
                    API-et er begrenset til 1000 forespørsler per time per API-nøkkel.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Feilkoder</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <code className="font-mono">400</code>
                      <span className="text-muted-foreground">Ugyldig forespørsel</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="font-mono">401</code>
                      <span className="text-muted-foreground">Ikke autentisert</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="font-mono">403</code>
                      <span className="text-muted-foreground">Ingen tilgang</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="font-mono">404</code>
                      <span className="text-muted-foreground">Ikke funnet</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="font-mono">429</code>
                      <span className="text-muted-foreground">For mange forespørsler</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="font-mono">500</code>
                      <span className="text-muted-foreground">Serverfeil</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
