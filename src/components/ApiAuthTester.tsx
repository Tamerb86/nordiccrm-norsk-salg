import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { ShieldCheck, Play, CheckCircle, XCircle, Warning, Lock, LockOpen, TestTube, CaretDown, Question } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import type { ApiKey } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  expectedOutcome: 'success' | 'forbidden' | 'unauthorized'
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
    expectedOutcome: 'success',
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
    expectedOutcome: 'success',
  },
  {
    id: 'delete-contact',
    name: 'Slett kontakt',
    description: 'Slett en kontakt',
    endpoint: '/api/contacts/:id',
    method: 'DELETE',
    resource: 'contacts',
    requiredPermission: 'delete',
    expectedOutcome: 'success',
  },
  {
    id: 'read-deals',
    name: 'Les avtaler',
    description: 'Hent liste over avtaler',
    endpoint: '/api/deals',
    method: 'GET',
    resource: 'deals',
    requiredPermission: 'read',
    expectedOutcome: 'success',
  },
  {
    id: 'update-deal',
    name: 'Oppdater avtale',
    description: 'Oppdater en avtale',
    endpoint: '/api/deals/:id',
    method: 'PUT',
    resource: 'deals',
    requiredPermission: 'write',
    expectedOutcome: 'success',
  },
  {
    id: 'read-reports',
    name: 'Les rapporter',
    description: 'Hent rapporter',
    endpoint: '/api/reports',
    method: 'GET',
    resource: 'reports',
    requiredPermission: 'read',
    expectedOutcome: 'success',
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
    toast.success(`Alle tester fullført`)
  }

  const getOutcomeMessage = (outcome: 'success' | 'forbidden' | 'unauthorized' | 'error'): string => {
    switch (outcome) {
      case 'success':
        return '200 OK'
      case 'forbidden':
        return '403 Forbidden'
      case 'unauthorized':
        return '401 Unauthorized'
      case 'error':
        return '500 Server Error'
      default:
        return 'Ukjent status'
    }
  }

  const getOutcomeIcon = (outcome: 'success' | 'forbidden' | 'unauthorized' | 'error') => {
    switch (outcome) {
      case 'success':
        return <CheckCircle className="text-green-600" weight="fill" />
      case 'forbidden':
        return <Lock className="text-orange-600" weight="fill" />
      case 'unauthorized':
        return <XCircle className="text-red-600" weight="fill" />
      case 'error':
        return <Warning className="text-red-600" weight="fill" />
      default:
        return <Question className="text-muted-foreground" />
    }
  }

  const toggleResultExpansion = (scenarioId: string) => {
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

  const getKeyPermissionsSummary = (key: ApiKey): string => {
    if (key.resourcePermissions && key.resourcePermissions.length > 0) {
      return key.resourcePermissions
        .map((rp) => `${rp.resource}: ${rp.actions.join(', ')}`)
        .join(' | ')
    }
    return key.permissions.join(', ')
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
                <CardDescription>Test API-nøkler og tillatelser</CardDescription>
              </div>
            </div>
            {testResults.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setTestResults([])}>
                Tøm resultater
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key-select">Velg API-nøkkel</Label>
              <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
                <SelectTrigger id="api-key-select">
                  <SelectValue placeholder="Velg en API-nøkkel å teste" />
                </SelectTrigger>
                <SelectContent>
                  {activeKeys.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Ingen aktive API-nøkler
                    </SelectItem>
                  ) : (
                    activeKeys.map((key) => (
                      <SelectItem key={key.id} value={key.id}>
                        {key.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedKey && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nøkkel:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {selectedKey.key.substring(0, 20)}...
                    </code>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={selectedKey.isActive ? 'default' : 'secondary'}>
                        {selectedKey.isActive ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>

                    {selectedKey.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Utløper:</span>
                        <span className="text-sm">
                          {new Date(selectedKey.expiresAt).toLocaleDateString('no-NO')}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Tillatelser</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedKey.resourcePermissions && selectedKey.resourcePermissions.length > 0 ? (
                        selectedKey.resourcePermissions.map((rp) => (
                          <Badge key={rp.resource} variant="outline">
                            {rp.resource}: {rp.actions.join(', ')}
                          </Badge>
                        ))
                      ) : (
                        selectedKey.permissions.map((perm) => (
                          <Badge key={perm} variant="outline">
                            {perm}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button onClick={runAllTests} disabled={!selectedKey || isRunning} className="flex-1">
                <TestTube size={16} className="mr-2" />
                {isRunning ? 'Kjører tester...' : 'Kjør alle tester'}
              </Button>
            </div>

            {totalCount > 0 && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" weight="fill" />
                  <span className="text-sm font-medium">
                    {passedCount} bestått
                  </span>
                </div>
                {failedCount > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle size={20} className="text-red-600" weight="fill" />
                    <span className="text-sm font-medium">
                      {failedCount} feilet
                    </span>
                  </div>
                )}
                <Badge variant="outline" className="ml-auto">
                  {totalCount} totalt
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test-scenarier</CardTitle>
          <CardDescription>Klikk for å kjøre individuelle tester</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {TEST_SCENARIOS.map((scenario) => {
                const latestResult = testResults.find((r) => r.scenarioId === scenario.id)
                const isExpanded = expandedResults.has(scenario.id)

                return (
                  <Card key={scenario.id} className="overflow-hidden">
                    <Collapsible open={isExpanded} onOpenChange={() => toggleResultExpansion(scenario.id)}>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <CollapsibleTrigger className="flex items-start gap-3 flex-1 text-left">
                            <CaretDown
                              size={20}
                              className={`mt-0.5 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{scenario.name}</h4>
                                {latestResult && getOutcomeIcon(latestResult.actualOutcome)}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{scenario.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {scenario.method}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {scenario.resource}
                                </Badge>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <Button
                            size="sm"
                            onClick={() => runTest(scenario)}
                            disabled={!selectedKey || isRunning}
                          >
                            <Play size={16} weight="fill" />
                          </Button>
                        </div>

                        <CollapsibleContent>
                          <Separator className="my-4" />
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Endpoint: </span>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{scenario.endpoint}</code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ressurs: </span>
                              <Badge variant="outline">{scenario.resource}</Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tillatelse: </span>
                              <Badge variant="outline">{scenario.requiredPermission}</Badge>
                            </div>
                            {latestResult && (
                              <>
                                <Separator className="my-2" />
                                <div className="space-y-2">
                                  <div className="font-medium">Siste resultat:</div>
                                  <div className={latestResult.success ? 'text-green-600' : 'text-red-600'}>
                                    {latestResult.message}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Status: {latestResult.statusCode} | {new Date(latestResult.timestamp).toLocaleString('no-NO')}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
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
