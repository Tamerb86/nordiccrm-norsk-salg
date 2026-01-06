import { useState } from 'react'
import { PaperPlaneRight, Repeat, Clock } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/language-context'
import { formatDateTime, formatRecurrencePattern } from '@/lib/helpers'
import type { Email } from '@/lib/types'
import EmailComposer from '@/components/EmailComposer'
import EmailHistory from '@/components/EmailHistory'
import EmailTemplatesManager from '@/components/EmailTemplatesManager'
import CustomTemplateVariablesManager from '@/components/CustomTemplateVariablesManager'

export default function EmailsView() {
  const { t } = useLanguage()
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [emails] = useKV<Email[]>('emails', [])

  const safeEmails = emails || []
  const scheduledEmails = safeEmails
    .filter(e => e.status === 'scheduled' && e.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())

  const recurringEmails = scheduledEmails.filter(e => e.recurrence && e.recurrence.pattern !== 'none')
  const oneTimeScheduled = scheduledEmails.filter(e => !e.recurrence || e.recurrence.pattern === 'none')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.email.title}</h1>
          <p className="text-muted-foreground mt-1">
            {t.email.sendAndTrackMessage}
          </p>
        </div>
        <Button onClick={() => setIsComposerOpen(true)} size="lg" className="gap-2">
          <PaperPlaneRight size={20} weight="duotone" />
          {t.email.compose}
        </Button>
      </div>

      {scheduledEmails.length > 0 && (
        <div className="space-y-4">
          {recurringEmails.length > 0 && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-purple-900">
                  <Repeat size={20} weight="duotone" />
                  {t.email.recurrenceSeries} ({recurringEmails.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recurringEmails.slice(0, 3).map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{email.subject}</p>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0 bg-purple-100 text-purple-700">
                            <Repeat size={10} weight="bold" className="mr-1" />
                            {formatRecurrencePattern(
                              email.recurrence!.pattern,
                              email.recurrence!.interval
                            )}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">Til: {email.to}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700">
                          <Clock size={12} />
                          {formatDateTime(email.scheduledAt!)}
                        </Badge>
                        {email.recurrence?.occurrenceCount !== undefined && email.recurrence.occurrenceCount > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {t.email.recurrenceCount}: {email.recurrence.occurrenceCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {recurringEmails.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground pt-1">
                      + {recurringEmails.length - 3} flere gjentakende e-poster
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {oneTimeScheduled.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                  <Clock size={20} weight="duotone" />
                  Planlagte e-poster ({oneTimeScheduled.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {oneTimeScheduled.slice(0, 3).map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{email.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">Til: {email.to}</p>
                      </div>
                      <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700">
                        <Clock size={12} />
                        {formatDateTime(email.scheduledAt!)}
                      </Badge>
                    </div>
                  ))}
                  {oneTimeScheduled.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground pt-1">
                      + {oneTimeScheduled.length - 3} flere planlagte e-poster
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="history">{t.email.history}</TabsTrigger>
          <TabsTrigger value="templates">{t.email.templates}</TabsTrigger>
          <TabsTrigger value="variables">Variabler</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <EmailHistory />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <EmailTemplatesManager />
        </TabsContent>

        <TabsContent value="variables" className="mt-6">
          <CustomTemplateVariablesManager />
        </TabsContent>
      </Tabs>

      <EmailComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />
    </motion.div>
  )
}
