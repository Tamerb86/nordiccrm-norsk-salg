import { useState } from 'react'
import { ShieldCheck, Play, CheckCircle, XC
import { ShieldCheck, Play, CheckCircle, XCircle, Warning, Lock, LockOpen, TestTube, CaretDown } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import { Input } from '@/components/ui/in
import { Select, SelectContent, SelectItem, Sel
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, Col
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

  expectedOutcome: 'succ
  id: string

  description: string
    name: 'Les kon
  method: string
    resource: 'con
  requiredPermission: string
    id: 'create-
}

interface TestResult {
      firstName: 'Te
  success: boolean
  message: string
  statusCode: number
  expectedOutcome: 'success' | 'forbidden' | 'unauthorized'
  actualOutcome: 'success' | 'forbidden' | 'unauthorized' | 'error'
  timestamp: string
}

const TEST_SCENARIOS: TestScenario[] = [
   
    id: 'read-contacts',
    name: 'Les kontakter',
    description: 'Hent liste over kontakter',
    endpoint: '/api/contacts',
    method: 'PUT',
    resource: 'contacts',
    requiredPermission: 'read',
  },
   
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
    
  {
    id: 'delete-contact',
    name: 'Slett kontakt',
    method: 'POST',
    endpoint: '/api/contacts/:id',
      to: 'test@examp
    resource: 'contacts',
    requiredPermission: 'delete',
  },
  {
    id: 'read-deals',
    name: 'Les avtaler',
    description: 'Hent liste over avtaler',
    name: 'Opprett webhook'
    method: 'GET',
    resource: 'deals',
    requiredPermission: 'read',
    
  {
    id: 'read-reports'
    name: 'Oppdater avtale',
    method: 'GET',
    endpoint: '/api/deals/:id',
]
export default functio
  const [selectedKeyId, setSelec
  const [isRunn

  const activeKeys 
  cons
    
   

  }
  const determineExpectedOutcome = (key: Api
    
      return 'unau

    return hasAccess ? 'success

   
  ): Promise<{ success

      return { success: false, statusC

      return { succ

    if (!hasAccess) {
    }
    const successRate = 0.95

      

  }
  const runTest = asyn
      toast.error('Vennli
    }
    setIsRunning(true)
    const expected

      scenarioId: scenario.id,
    
   
      statusCode: res
      actualOutcome: res
    }
    setTestResults((prev) => [tes

      toast.success(`Te
      toast.error(`Test feilet: 
  }
  const runAllTests = async 
      toast.error('Vennligst 
    }
    se

   

        scenarioId: scena
        message:
            ? `✓ Test bestått 
        statusCode
        actualOutcome: re
      }
    


    toast.success(`Alle test

    switch (outcome) {
        return '200
        return '403 Forbi
        return '401 Unauthorized
        return 
        return 'Ukjent status'
  }
  cons
    
   
      case 'unauthorize
      case 'error':
      default:
    }

    setExpandedResults((
      if (newSet.has(scenarioId
    
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
      return resourcePerm.permissions.includes(permission as any)
     

    return key.permissions.includes(permission as any)
   

  const determineExpectedOutcome = (key: ApiKey, scenario: TestScenario): 'success' | 'forbidden' | 'unauthorized' => {
    if (!key.isActive) return 'unauthorized'
    
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return 'unauthorized'
     

    const hasAccess = hasPermission(key, scenario.resource, scenario.requiredPermission)
    return hasAccess ? 'success' : 'forbidden'
   

  const simulateApiRequest = async (
    key: ApiKey,
    scenario: TestScenario
  ): Promise<{ success: boolean; statusCode: number; outcome: 'success' | 'forbidden' | 'unauthorized' | 'error' }> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))

    if (!key.isActive) {
      return { success: false, statusCode: 401, outcome: 'unauthorized' }
     

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
   

  const runTest = async (scenario: TestScenario) => {
    if (!selectedKey) {
      toast.error('Vennligst velg en API-nøkkel')
      return
     

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

                  <div className="p-
                      const scenario = TES
    }

                        <Card
                       

                          <Co
                              <div className="p-4 cur
            
                                    <div className
     
  }

                                   
                       
                                  </div>
            
    }

                      
                      

                                  </div>
                              </div>
                            <CollapsibleContent>

                                  <div
                                
                                  <div>
        message:
                                    </Badge>
                                  <div>
                                    <Badge variant="outline">{scenario.requiredPermission}</Badge>
                                  <div
                        
                                </div>
                                  <div>
      }

                                  </div>
     

                       

                            </CollapsibleContent>
                        </Card>
   

            </>
    switch (outcome) {

        <CardHeader>
          <CardDescript
        <CardContent>
            <div className
                const latestResult = testResults.f
                ret
                    <CardContent classN
              
        return 'Ukjent status'
     
  }

                          <p className="text-xs
                      
                     
                              Tillatelse: <Badge variant="outline" c
                       
                            <div className="flex items-center gap-
                          
                              </span>
      case 'error':
                        <Button
      default:
                   
    }
   

                )
            </div>
        </CardContent>
    </div>
}








    setTestResults([])

  }

  const getKeyPermissionsSummary = (key: ApiKey): string => {



    }



  const passedCount = testResults.filter((r) => r.success).length

  const totalCount = testResults.length



      <Card>

          <div className="flex items-center justify-between">

              <div className="p-2 bg-primary/10 rounded-lg">

              </div>

                <CardTitle>Autentiseringstesting</CardTitle>





                Tøm resultater





          <div className="space-y-4">





                </SelectTrigger>







                      <SelectItem key={key.id} value={key.id}>







                    ))



            </div>

            {selectedKey && (

                <CardContent className="pt-4 space-y-3">





                      )}





                  <Separator />

                    <div className="flex items-center justify-between">





                        <span className="text-muted-foreground">Utløper:</span>



                      </div>





                  </div>







                        </h5>





                              </Badge>





                    </>



            )}







              >



            </div>













                    {failedCount > 0 && (



                      </Badge>

                  </div>











                        <Card























                                  </div>













                                  </div>

                              </div>

                            <CollapsibleContent>



                                  <div>







                                    </Badge>

                                  <div>

                                    <Badge variant="outline">{scenario.requiredPermission}</Badge>





                                </div>

                                  <div>





                                  </div>









                            </CollapsibleContent>

                        </Card>





            </>

        </CardContent>



        <CardHeader>



        <CardContent>

































                              </span>



                        <Button











                )

            </div>

        </CardContent>

    </div>

}
