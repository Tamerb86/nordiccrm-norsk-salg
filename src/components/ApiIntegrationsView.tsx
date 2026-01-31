import { useState, lazy, Suspense } from 'react'
import { Key, Lightning, PlugsConnected, Book, Terminal, ShieldCheck } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import PermissionGuard from '@/components/PermissionGuard'

const ApiKeysManager = lazy(() => import('@/components/ApiKeysManager'))
const WebhooksManager = lazy(() => import('@/components/WebhooksManager'))
const IntegrationsManager = lazy(() => import('@/components/IntegrationsManager'))
const ApiDocumentation = lazy(() => import('@/components/ApiDocumentation'))
const ApiPlayground = lazy(() => import('@/components/ApiPlayground'))
const ApiAuthTester = lazy(() => import('@/components/ApiAuthTester'))

function TabLoadingSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ApiIntegrationsView() {
  const { t } = useLanguage()
  const { hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('api-keys')

  return (
    <PermissionGuard resource="api" action="view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.api.title}</h1>
            <p className="text-muted-foreground mt-2">
              {t.api.manageMessage}
            </p>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
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
          <TabsTrigger value="auth-tester" className="gap-2">
            <ShieldCheck size={18} />
            <span className="hidden sm:inline">Auth Test</span>
          </TabsTrigger>
          <TabsTrigger value="playground" className="gap-2">
            <Terminal size={18} />
            <span className="hidden sm:inline">Playground</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <Book size={18} />
            <span className="hidden sm:inline">{t.api.apiDocs}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <ApiKeysManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="webhooks">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <WebhooksManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="integrations">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <IntegrationsManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="auth-tester">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <ApiAuthTester />
          </Suspense>
        </TabsContent>

        <TabsContent value="playground">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <ApiPlayground />
          </Suspense>
        </TabsContent>

        <TabsContent value="docs">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <ApiDocumentation />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
    </PermissionGuard>
  )
}
