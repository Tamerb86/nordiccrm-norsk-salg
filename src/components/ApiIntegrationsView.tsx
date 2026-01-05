import { useState } from 'react'
import { Key, Lightning, PlugsConnected, Book } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ApiKeysManager from '@/components/ApiKeysManager'
import WebhooksManager from '@/components/WebhooksManager'
import IntegrationsManager from '@/components/IntegrationsManager'
import ApiDocumentation from '@/components/ApiDocumentation'

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
          <ApiDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  )
}
