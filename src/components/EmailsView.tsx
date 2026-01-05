import { useState } from 'react'
import { PaperPlaneRight, Gear, Clock } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { norwegianTranslations as t } from '@/lib/norwegian'
import { formatDateTime } from '@/lib/helpers'
import type { Email } from '@/lib/types'
import EmailComposer from '@/components/EmailComposer'
import EmailHistory from '@/components/EmailHistory'
import EmailTemplatesManager from '@/components/EmailTemplatesManager'

export default function EmailsView() {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [emails] = useKV<Email[]>('emails', [])

  const safeEmails = emails || []
  const scheduledEmails = safeEmails
    .filter(e => e.status === 'scheduled' && e.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())

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
            Send og spor e-poster til dine kunder
          </p>
        </div>
        <Button onClick={() => setIsComposerOpen(true)} size="lg" className="gap-2">
          <PaperPlaneRight size={20} weight="duotone" />
          {t.email.compose}
        </Button>
      </div>

      {scheduledEmails.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-900">
              <Clock size={20} weight="duotone" />
              Planlagte e-poster ({scheduledEmails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scheduledEmails.slice(0, 3).map((email) => (
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
              {scheduledEmails.length > 3 && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  + {scheduledEmails.length - 3} flere planlagte e-poster
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="history">{t.email.history}</TabsTrigger>
          <TabsTrigger value="templates">{t.email.templates}</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <EmailHistory />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <EmailTemplatesManager />
        </TabsContent>
      </Tabs>

      <EmailComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />
    </motion.div>
  )
}
