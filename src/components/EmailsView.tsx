import { useState } from 'react'
import { PaperPlaneRight, Gear } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { norwegianTranslations as t } from '@/lib/norwegian'
import EmailComposer from '@/components/EmailComposer'
import EmailHistory from '@/components/EmailHistory'
import EmailTemplatesManager from '@/components/EmailTemplatesManager'

export default function EmailsView() {
  const [isComposerOpen, setIsComposerOpen] = useState(false)

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
