import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { ShieldCheck, Play, CheckCircle, XCircle, Warning, Lock, LockOpen, TestTube, CaretDown } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import type { ApiKey } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface TestScenario {
  id: string
  name: string
  description: string
  endpoint: string
  method: string
  resource: string
  requiredPermission: string
  testData?: any
}

interface TestResult {
  scenarioId: string
  success: boolean
  message: string
  statusCode: number
  expectedOutcome: 'success' | 'forbidden' | 'unauthorized'
  actualOutcome: 'success' | 'forbidden' | 'unauthorized' | 'error'
  timestamp: string
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'read-contacts',
    name: 'Les kontakter',
    description: 'Hent liste over kontakter',
    endpoint: '/api/contacts',
    method: 'GET',
    resource: 'contacts',
    requiredPermission: 'read',
  },
  {
    id: 'create-contact',
    name: 'Opprett kontakt',
    description: 'Opprett ny kontakt',
    endpoint: '/api/contacts',
    method: 'POST',
    resource: 'contacts',
    requiredPermission: 'write',
    testData: {
      firstName: 'Test',
      lastName: 'Bruker',
      email: 'test@example.no',
    },
  },
  {
    id: 'delete-contact',
    name: 'Slett kontakt',
    description: 'Slett en kontakt',
    endpoint: '/api/contacts/:id',
    method: 'DELETE',
    resource: 'contacts',
    requiredPermission: 'delete',
  },
  {
    id: 'read-deals',
    name: 'Les avtaler',
    description: 'Hent liste over avtaler',
    endpoint: '/api/deals',
    method: 'GET',
    resource: 'deals',
    requiredPermission: 'read',
  },
  {
    id: 'update-deal',
    name: 'Oppdater avtale',
    description: 'Oppdater en avtale',
    endpoint: '/api/deals/:id',
    method: 'PUT',
    resource: 'deals',
    requiredPermission: 'write',
    testData: {
      title: 'Oppdatert avtale',
      value: 50000,
    },
  },
  {
    id: 'read-tasks',
    name: 'Les oppgaver',
    description: 'Hent liste over oppgaver',
    endpoint: '/api/tasks',
    method: 'GET',
    resource: 'tasks',
    requiredPermission: 'read',
  },
  {
    id: 'create-task',
    name: 'Opprett oppgave',
    description: 'Opprett ny oppgave',
    endpoint: '/api/tasks',
    method: 'POST',
    resource: 'tasks',
    requiredPermission: 'write',
    testData: {
      title: 'Test oppgave',
      dueDate: new Date().toISOString(),
    },
  },
  {
    id: 'read-emails',
    name: 'Les e-poster',
    description: 'Hent liste over e-poster',
    endpoint: '/api/emails',
    method: 'GET',
    resource: 'emails',
    requiredPermission: 'read',
  },
  {
    id: 'send-email',
    name: 'Send e-post',
    description: 'Send en e-post',
    endpoint: '/api/emails/send',
    method: 'POST',
    resource: 'emails',
    requiredPermission: 'write',
    testData: {
      to: 'test@example.no',
      subject: 'Test e-post',
      body: 'Dette er en test',
    },
  },
  {
    id: 'read-webhooks',
    name: 'Les webhooks',
    description: 'Hent liste over webhooks',
    endpoint: '/api/webhooks',
    method: 'GET',
    resource: 'webhooks',
    requiredPermission: 'read',
  },
  {
    id: 'create-webhook',
    name: 'Opprett webhook',
    description: 'Opprett ny webhook',
    endpoint: '/api/webhooks',
    method: 'POST',
    resource: 'webhooks',
    requiredPermission: 'write',
    testData: {
      url: 'https://example.no/webhook',
      events: ['contact.created'],
    },
  },
  {
    id: 'read-reports',
    name: 'Les rapporter',
    description: 'Hent rapporter og statistikk',
    endpoint: '/api/reports',
    method: 'GET',
    resource: 'reports',
    requiredPermission: 'read',
  },
]

export default function ApiAuthTester() {
  const [apiKeys = []] = useKV<ApiKey[]>('api-keys', [])
  const [selectedKeyId, setSelectedKeyId] = useState<string>('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const selectedKey = apiKeys.find((key) => key.id === selectedKeyId)
  const activeKeys = apiKeys.filter((key) => key.isActive)

  const hasPermission = (key: ApiKey, resource: string, permission: string): boolean => {
    if (key.resourcePermissions && key.resourcePermissions.length > 0) {
      const resourcePerm = key.resourcePermissions.find((rp) => rp.resource === resource)
      if (!resourcePerm) return false
      return resourcePerm.actions.includes(permission as any)
    }

    return key.permissions.includes(permission as any)
  }

  const determineExpectedOutcome = (key: ApiKey, scenario: TestScenario): 'success' | 'forbidden' | 'unauthorized' => {
    if (!key.isActive) return 'unauthorized'
    
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return 'unauthorized'
    }

    const hasAccess = hasPermission(key, scenario.resource, scenario.requiredPermission)
    return hasAccess ? 'success' : 'forbidden'
  }

  const simulateApiRequest = async (
    key: ApiKey,
    scenario: TestScenario
  ): Promise<{ success: boolean; statusCode: number; outcome: 'success' | 'forbidden' | 'unauthorized' | 'error' }> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))

    if (!key.isActive) {
      return { success: false, statusCode: 401, outcome: 'unauthorized' }
    }

    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return { success: false, statusCode: 401, outcome: 'unauthorized' }
    }

    const hasAccess = hasPermission(key, scenario.resource, scenario.requiredPermission)
    if (!hasAccess) {
      return { success: false, statusCode: 403, outcome: 'forbidden' }
    }

    const successRate = 0.95
    const simulatedSuccess = Math.random() < successRate

    if (!simulatedSuccess) {
      return { success: false, statusCode: 500, outcome: 'error' }
    }

    return { success: true, statusCode: 200, outcome: 'success' }
  }

  const runTest = async (scenario: TestScenario) => {
    if (!selectedKey) {
      toast.error('Vennligst velg en API-nøkkel')
      return
    }

    setIsRunning(true)

    const expectedOutcome = determineExpectedOutcome(selectedKey, scenario)
    const result = await simulateApiRequest(selectedKey, scenario)

    const testResult: TestResult = {
      scenarioId: scenario.id,
      success: result.outcome === expectedOutcome,
      message:
        result.outcome === expectedOutcome
          ? `✓ Test bestått - ${getOutcomeMessage(result.outcome)}`
          : `✗ Test feilet - Forventet ${getOutcomeMessage(expectedOutcome)}, fikk ${getOutcomeMessage(result.outcome)}`,
      statusCode: result.statusCode,
      expectedOutcome,
      actualOutcome: result.outcome,
      timestamp: new Date().toISOString(),
    }

    setTestResults((prev) => [testResult, ...prev])
    setIsRunning(false)

    if (testResult.success) {
      toast.success(`Test bestått: ${scenario.name}`)
    } else {
      toast.error(`Test feilet: ${scenario.name}`)
    }
  }

  const runAllTests = async () => {
    if (!selectedKey) {
      toast.error('Vennligst velg en API-nøkkel')
      return
    }

    setIsRunning(true)
    setTestResults([])

    for (const scenario of TEST_SCENARIOS) {
      const expectedOutcome = determineExpectedOutcome(selectedKey, scenario)
      const result = await simulateApiRequest(selectedKey, scenario)

      const testResult: TestResult = {
        scenarioId: scenario.id,
        success: result.outcome === expectedOutcome,
        message:
          result.outcome === expectedOutcome
            ? `✓ Test bestått - ${getOutcomeMessage(result.outcome)}`
            : `✗ Test feilet - Forventet ${getOutcomeMessage(expectedOutcome)}, fikk ${getOutcomeMessage(result.outcome)}`,
        statusCode: result.statusCode,
        expectedOutcome,
        actualOutcome: result.outcome,
        timestamp: new Date().toISOString(),
      }

      setTestResults((prev) => [testResult, ...prev])
    }

    setIsRunning(false)

    const passedTests = testResults.filter((r) => r.success).length
    toast.success(`Alle tester fullført: ${passedTests}/${TEST_SCENARIOS.length} bestått`)
  }

  const getOutcomeMessage = (outcome: string): string => {
    switch (outcome) {
      case 'success':
        return '200 OK - Tilgang tillatt'
      case 'forbidden':
        return '403 Forbidden - Mangler tillatelse'
      case 'unauthorized':
        return '401 Unauthorized - Ugyldig nøkkel'
      case 'error':
        return '500 Error - Serverfeil'
      default:
        return 'Ukjent status'
    }
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <CheckCircle className="text-accent" weight="fill" />
      case 'forbidden':
        return <Lock className="text-destructive" weight="fill" />
      case 'unauthorized':
        return <XCircle className="text-destructive" weight="fill" />
      case 'error':
        return <Warning className="text-yellow-500" weight="fill" />
      default:
        return null
    }
  }

  const toggleResultExpand = (scenarioId: string) => {
    setExpandedResults((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(scenarioId)) {
        newSet.delete(scenarioId)
      } else {
        newSet.add(scenarioId)
      }
      return newSet
    })
  }

  const clearResults = () => {
    setTestResults([])
    toast.success('Testresultater tømt')
  }

  const getKeyPermissionsSummary = (key: ApiKey): string => {
    if (key.resourcePermissions && key.resourcePermissions.length > 0) {
      const resources = key.resourcePermissions.map((rp) => rp.resource).join(', ')
      return `Ressursbasert: ${resources}`
    }
    return `Global: ${key.permissions.join(', ')}`
  }

  const passedCount = testResults.filter((r) => r.success).length
  const failedCount = testResults.filter((r) => !r.success).length
  const totalCount = testResults.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck size={24} className="text-primary" weight="duotone" />
              </div>
              <div>
                <CardTitle>Autentiseringstesting</CardTitle>
                <CardDescription>Test API-nøkler med forskjellige tillatelser</CardDescription>
              </div>
            </div>
            {testResults.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearResults}>
                Tøm resultater
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Velg API-nøkkel for testing</Label>
              <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg en API-nøkkel..." />
                </SelectTrigger>
                <SelectContent>
                  {activeKeys.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Ingen aktive API-nøkler funnet
                    </div>
                  ) : (
                    activeKeys.map((key) => (
                      <SelectItem key={key.id} value={key.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{key.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {key.resourcePermissions ? 'Ressursbasert' : 'Global'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedKey && (
              <Card className="bg-muted/50 border-primary/20">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{selectedKey.name}</h4>
                      {selectedKey.description && (
                        <p className="text-xs text-muted-foreground">{selectedKey.description}</p>
                      )}
                    </div>
                    <Badge variant={selectedKey.isActive ? 'default' : 'secondary'}>
                      {selectedKey.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tillatelser:</span>
                      <span className="font-mono text-xs">{getKeyPermissionsSummary(selectedKey)}</span>
                    </div>
                    {selectedKey.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Utløper:</span>
                        <span className="text-xs">
                          {new Date(selectedKey.expiresAt).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rate limit:</span>
                      <span className="text-xs">{selectedKey.rateLimit || 1000} req/time</span>
                    </div>
                  </div>

                  {selectedKey.resourcePermissions && selectedKey.resourcePermissions.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase">
                          Ressurs-tillatelser
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedKey.resourcePermissions.map((rp) => (
                            <div key={rp.resource} className="flex items-center gap-2 text-xs">
                              <Badge variant="secondary" className="capitalize">
                                {rp.resource}
                              </Badge>
                              <span className="text-muted-foreground">{rp.actions.join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                disabled={!selectedKey || isRunning}
                className="flex-1"
                size="lg"
              >
                <TestTube size={18} className="mr-2" weight="duotone" />
                Kjør alle tester ({TEST_SCENARIOS.length})
              </Button>
            </div>
          </div>

          {testResults.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Testresultater</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle size={14} className="text-accent" weight="fill" />
                      {passedCount} bestått
                    </Badge>
                    {failedCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <XCircle size={14} className="text-destructive" weight="fill" />
                        {failedCount} feilet
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {testResults.map((result, index) => {
                      const scenario = TEST_SCENARIOS.find((s) => s.id === result.scenarioId)
                      if (!scenario) return null

                      const isExpanded = expandedResults.has(result.scenarioId)

                      return (
                        <Card
                          key={`${result.scenarioId}-${index}`}
                          className={`${
                            result.success ? 'border-accent/30 bg-accent/5' : 'border-destructive/30 bg-destructive/5'
                          }`}
                        >
                          <Collapsible open={isExpanded} onOpenChange={() => toggleResultExpand(result.scenarioId)}>
                            <CollapsibleTrigger asChild>
                              <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    {getOutcomeIcon(result.actualOutcome)}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-sm">{scenario.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                          {scenario.method}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-2">{scenario.description}</p>
                                      <p className={`text-xs ${result.success ? 'text-accent' : 'text-destructive'}`}>
                                        {result.message}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={result.actualOutcome === 'success' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {result.statusCode}
                                    </Badge>
                                    <CaretDown
                                      size={16}
                                      className={`text-muted-foreground transition-transform ${
                                        isExpanded ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 pt-0 space-y-3">
                                <Separator />
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="text-muted-foreground block mb-1">Endepunkt:</span>
                                    <code className="font-mono bg-muted px-2 py-1 rounded">{scenario.endpoint}</code>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block mb-1">Ressurs:</span>
                                    <Badge variant="secondary" className="capitalize">
                                      {scenario.resource}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block mb-1">Påkrevd tillatelse:</span>
                                    <Badge variant="outline">{scenario.requiredPermission}</Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block mb-1">Tidspunkt:</span>
                                    <span>{new Date(result.timestamp).toLocaleTimeString('nb-NO')}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="text-muted-foreground block mb-1">Forventet resultat:</span>
                                    <div className="flex items-center gap-2">
                                      {getOutcomeIcon(result.expectedOutcome)}
                                      <span>{getOutcomeMessage(result.expectedOutcome)}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block mb-1">Faktisk resultat:</span>
                                    <div className="flex items-center gap-2">
                                      {getOutcomeIcon(result.actualOutcome)}
                                      <span>{getOutcomeMessage(result.actualOutcome)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Individuelle tester</CardTitle>
          <CardDescription>Kjør individuelle tester for spesifikke endepunkter</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-4">
              {TEST_SCENARIOS.map((scenario) => {
                const latestResult = testResults.find((r) => r.scenarioId === scenario.id)

                return (
                  <Card key={scenario.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{scenario.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {scenario.method}
                            </Badge>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {scenario.resource}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{scenario.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-muted-foreground">
                              Endepunkt: <code className="font-mono">{scenario.endpoint}</code>
                            </span>
                            <span className="text-muted-foreground">
                              Tillatelse: <Badge variant="outline" className="text-xs">{scenario.requiredPermission}</Badge>
                            </span>
                          </div>
                          {latestResult && (
                            <div className="flex items-center gap-2 pt-1">
                              {getOutcomeIcon(latestResult.actualOutcome)}
                              <span className={`text-xs ${latestResult.success ? 'text-accent' : 'text-destructive'}`}>
                                {latestResult.message}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runTest(scenario)}
                          disabled={!selectedKey || isRunning}
                        >
                          <Play size={14} className="mr-1" weight="fill" />
                          Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
