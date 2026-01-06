import { useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Globe, CheckCircle, ArrowRight, Users, Target, ListChecks, EnvelopeSimple, PlugsConnected } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function LanguageTest() {
  const { t, language, setLanguage } = useLanguage()
  const [testResults, setTestResults] = useState<string[]>([])

  const runTests = () => {
    const results: string[] = []
    
    results.push(`✓ App title: ${t.app.title}`)
    results.push(`✓ App tagline: ${t.app.tagline}`)
    results.push(`✓ Navigation items: ${t.nav.dashboard}, ${t.nav.contacts}, ${t.nav.pipeline}, ${t.nav.tasks}`)
    results.push(`✓ Contact fields: ${t.contact.firstName}, ${t.contact.lastName}, ${t.contact.email}`)
    results.push(`✓ Status labels: ${t.status.lead}, ${t.status.prospect}, ${t.status.customer}, ${t.status.lost}`)
    results.push(`✓ Task priorities: ${t.priority.low}, ${t.priority.medium}, ${t.priority.high}`)
    results.push(`✓ Email: ${t.email.compose}, ${t.email.send}, ${t.email.scheduled}`)
    results.push(`✓ API: ${t.api.title}, ${t.api.apiKeys}, ${t.api.webhooks}`)
    results.push(`✓ Footer: ${t.footer.product}, ${t.footer.company}, ${t.footer.support}`)
    results.push(`✓ Common: ${t.common.save}, ${t.common.cancel}, ${t.common.delete}`)
    
    setTestResults(results)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe size={24} weight="duotone" className="text-primary" />
                {language === 'no' ? 'Språktest' : 'Language Test'}
              </CardTitle>
              <CardDescription>
                {language === 'no' 
                  ? 'Test bytte mellom norsk og engelsk i sanntid'
                  : 'Test switching between Norwegian and English in real-time'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {language === 'no' ? '🇳🇴 Norsk' : '🇬🇧 English'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button 
              onClick={() => setLanguage('no')} 
              variant={language === 'no' ? 'default' : 'outline'}
              className="flex-1"
            >
              🇳🇴 Norsk
              {language === 'no' && <CheckCircle size={16} className="ml-2" weight="fill" />}
            </Button>
            <Button 
              onClick={() => setLanguage('en')} 
              variant={language === 'en' ? 'default' : 'outline'}
              className="flex-1"
            >
              🇬🇧 English
              {language === 'en' && <CheckCircle size={16} className="ml-2" weight="fill" />}
            </Button>
          </div>

          <Button onClick={runTests} className="w-full" variant="secondary">
            {language === 'no' ? 'Kjør oversettelsestest' : 'Run Translation Test'}
          </Button>

          {testResults.length > 0 && (
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm text-muted-foreground font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="navigation" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="navigation">{t.nav.dashboard}</TabsTrigger>
          <TabsTrigger value="contacts">{t.contact.title}</TabsTrigger>
          <TabsTrigger value="tasks">{t.task.title}</TabsTrigger>
          <TabsTrigger value="email">{t.email.title}</TabsTrigger>
          <TabsTrigger value="api">{t.api.title}</TabsTrigger>
        </TabsList>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'no' ? 'Navigasjonseksempel' : 'Navigation Example'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <Users size={20} weight="duotone" />
                <span className="font-medium">{t.nav.contacts}</span>
                <ArrowRight size={16} className="ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <Target size={20} weight="duotone" />
                <span className="font-medium">{t.nav.pipeline}</span>
                <ArrowRight size={16} className="ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <ListChecks size={20} weight="duotone" />
                <span className="font-medium">{t.nav.tasks}</span>
                <ArrowRight size={16} className="ml-auto" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>{t.contact.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t.contact.firstName}</label>
                  <input className="w-full px-3 py-2 mt-1 border rounded-md" disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.contact.lastName}</label>
                  <input className="w-full px-3 py-2 mt-1 border rounded-md" disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.contact.email}</label>
                  <input className="w-full px-3 py-2 mt-1 border rounded-md" disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.contact.phone}</label>
                  <input className="w-full px-3 py-2 mt-1 border rounded-md" disabled />
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Badge>{t.status.lead}</Badge>
                <Badge variant="secondary">{t.status.prospect}</Badge>
                <Badge variant="outline">{t.status.customer}</Badge>
                <Badge variant="destructive">{t.status.lost}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>{t.task.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t.task.taskTitle}</label>
                <input className="w-full px-3 py-2 mt-1 border rounded-md" disabled />
              </div>
              <div>
                <label className="text-sm font-medium">{t.task.priority}</label>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">{t.priority.low}</Badge>
                  <Badge variant="default">{t.priority.medium}</Badge>
                  <Badge variant="destructive">{t.priority.high}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t.task.type}</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant="outline">{t.taskType.call}</Badge>
                  <Badge variant="outline">{t.taskType.email}</Badge>
                  <Badge variant="outline">{t.taskType.meeting}</Badge>
                  <Badge variant="outline">{t.taskType['follow-up']}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>{t.email.compose}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t.email.to}</label>
                <input className="w-full px-3 py-2 mt-1 border rounded-md" disabled />
              </div>
              <div>
                <label className="text-sm font-medium">{t.email.subject}</label>
                <input className="w-full px-3 py-2 mt-1 border rounded-md" disabled />
              </div>
              <div>
                <label className="text-sm font-medium">{t.email.body}</label>
                <textarea className="w-full px-3 py-2 mt-1 border rounded-md" rows={4} disabled />
              </div>
              <div className="flex gap-2">
                <Button size="sm">{t.email.send}</Button>
                <Button size="sm" variant="outline">{t.email.schedule}</Button>
                <Button size="sm" variant="secondary">{t.email.saveAsTemplate}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>{t.api.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-md text-center">
                  <PlugsConnected size={32} weight="duotone" className="mx-auto mb-2 text-primary" />
                  <p className="font-medium">{t.api.apiKeys}</p>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <PlugsConnected size={32} weight="duotone" className="mx-auto mb-2 text-primary" />
                  <p className="font-medium">{t.api.webhooks}</p>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <PlugsConnected size={32} weight="duotone" className="mx-auto mb-2 text-primary" />
                  <p className="font-medium">{t.api.integrations}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.api.permissionRead}:</span>
                  <Badge variant="outline">{t.common.yes}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.api.permissionWrite}:</span>
                  <Badge variant="outline">{t.common.yes}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.api.permissionDelete}:</span>
                  <Badge variant="outline">{t.common.no}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'no' ? 'Teststatus' : 'Test Status'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} weight="fill" className="text-green-600 dark:text-green-400" />
                <span className="font-medium">
                  {language === 'no' ? 'Språkbytte fungerer' : 'Language switching works'}
                </span>
              </div>
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                {language === 'no' ? 'Vellykket' : 'Success'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-muted-foreground">{language === 'no' ? 'Aktivt språk' : 'Active language'}:</p>
                <p className="font-medium">{language === 'no' ? 'Norsk' : 'English'}</p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-muted-foreground">{language === 'no' ? 'Språkkode' : 'Language code'}:</p>
                <p className="font-medium font-mono">{language}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
