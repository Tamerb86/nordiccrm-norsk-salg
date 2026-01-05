import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Lightning as WebhookIcon, Plus, Trash, ToggleLeft, Play, ListBullets, CheckCircle, XCircle } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import type { Webhook, WebhookEvent, WebhookLog } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

const WEBHOOK_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: 'contact.created', label: 'Kontakt opprettet' },
  { value: 'contact.updated', label: 'Kontakt oppdatert' },
  { value: 'contact.deleted', label: 'Kontakt slettet' },
  { value: 'deal.created', label: 'Avtale opprettet' },
  { value: 'deal.updated', label: 'Avtale oppdatert' },
  { value: 'deal.stage_changed', label: 'Avtalefase endret' },
  { value: 'deal.closed', label: 'Avtale lukket' },
  { value: 'task.created', label: 'Oppgave opprettet' },
  { value: 'task.completed', label: 'Oppgave fullført' },
  { value: 'email.sent', label: 'E-post sendt' },
  { value: 'email.opened', label: 'E-post åpnet' },
  { value: 'email.clicked', label: 'E-post klikket' },
]

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let secret = 'whsec_'
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

export default function WebhooksManager() {
  const [webhooks = [], setWebhooks] = useKV<Webhook[]>('webhooks', [])
  const [webhookLogs = [], setWebhookLogs] = useKV<WebhookLog[]>('webhook-logs', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)
  const [showLogs, setShowLogs] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as WebhookEvent[],
  })

  const handleCreateWebhook = () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) {
      toast.error('Vennligst fyll ut alle påkrevde felt')
      return
    }

    if (newWebhook.events.length === 0) {
      toast.error('Velg minst én hendelse')
      return
    }

    const webhook: Webhook = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      secret: generateSecret(),
      isActive: true,
      failureCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setWebhooks((current = []) => [...current, webhook])
    toast.success(t.api.webhookCreated)
    
    setNewWebhook({ name: '', url: '', events: [] })
    setIsDialogOpen(false)
  }

  const handleToggleActive = (webhookId: string) => {
    setWebhooks((current = []) =>
      current.map((webhook) =>
        webhook.id === webhookId
          ? { ...webhook, isActive: !webhook.isActive, updatedAt: new Date().toISOString() }
          : webhook
      )
    )
    toast.success(t.api.webhookUpdated)
  }

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks((current = []) => current.filter((webhook) => webhook.id !== webhookId))
    toast.success(t.api.webhookDeleted)
  }

  const handleTestWebhook = async (webhook: Webhook) => {
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'Dette er en test-webhook' },
    }

    const log: WebhookLog = {
      id: Date.now().toString(),
      webhookId: webhook.id,
      event: 'contact.created',
      payload: testPayload,
      success: true,
      statusCode: 200,
      responseTime: 150,
      createdAt: new Date().toISOString(),
    }

    setWebhookLogs((current = []) => [log, ...current])
    
    setWebhooks((current = []) =>
      current.map((w) =>
        w.id === webhook.id
          ? { ...w, lastTriggeredAt: new Date().toISOString(), lastStatus: 'success' }
          : w
      )
    )

    toast.success(t.api.webhookTested)
  }

  const toggleEvent = (event: WebhookEvent) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }))
  }

  const viewWebhookLogs = (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setShowLogs(true)
  }

  const webhookLogsForSelected = selectedWebhook
    ? webhookLogs.filter((log) => log.webhookId === selectedWebhook.id)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.api.webhooks}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Konfigurer webhooks for å motta varsler om hendelser i sanntid
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} weight="bold" />
              {t.api.newWebhook}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.api.newWebhook}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">{t.api.webhookName}</Label>
                <Input
                  id="webhook-name"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="Min webhook"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">{t.api.webhookUrl}</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.api.events}</Label>
                <ScrollArea className="h-64 border rounded-md p-4">
                  <div className="space-y-3">
                    {WEBHOOK_EVENTS.map((event) => (
                      <div key={event.value} className="flex items-center gap-2">
                        <Checkbox
                          id={event.value}
                          checked={newWebhook.events.includes(event.value)}
                          onCheckedChange={() => toggleEvent(event.value)}
                        />
                        <Label htmlFor={event.value} className="cursor-pointer">
                          {event.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateWebhook} className="flex-1">
                  {t.common.save}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t.common.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {webhooks.length === 0 ? (
        <Card className="p-12 text-center">
          <WebhookIcon size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t.common.noResults}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Opprett din første webhook for å motta varsler om hendelser
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <WebhookIcon size={20} weight="duotone" className="text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-foreground truncate">{webhook.name}</h3>
                    {webhook.isActive ? (
                      <Badge variant="outline" className="border-accent text-accent">
                        <CheckCircle size={14} weight="fill" className="mr-1" />
                        {t.api.active}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                        <XCircle size={14} weight="fill" className="mr-1" />
                        {t.api.inactive}
                      </Badge>
                    )}
                    {webhook.lastStatus && (
                      <Badge
                        variant="outline"
                        className={
                          webhook.lastStatus === 'success'
                            ? 'border-accent text-accent'
                            : 'border-destructive text-destructive'
                        }
                      >
                        {webhook.lastStatus === 'success' ? t.api.statusSuccess : t.api.statusFailed}
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded mb-3 break-all">
                    {webhook.url}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.slice(0, 3).map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {WEBHOOK_EVENTS.find((e) => e.value === event)?.label || event}
                      </Badge>
                    ))}
                    {webhook.events.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{webhook.events.length - 3} flere
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {webhook.lastTriggeredAt && (
                      <span>
                        {t.api.lastTriggered}:{' '}
                        {new Date(webhook.lastTriggeredAt).toLocaleDateString('nb-NO')}
                      </span>
                    )}
                    {webhook.failureCount > 0 && (
                      <span className="text-destructive">
                        {t.api.failureCount}: {webhook.failureCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook)}
                  >
                    <Play size={18} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewWebhookLogs(webhook)}
                  >
                    <ListBullets size={18} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(webhook.id)}
                  >
                    <ToggleLeft size={18} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t.api.webhookLogs} - {selectedWebhook?.name}
            </DialogTitle>
          </DialogHeader>

          {webhookLogsForSelected.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.api.noLogs}
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {webhookLogsForSelected.map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle size={16} weight="fill" className="text-accent" />
                        ) : (
                          <XCircle size={16} weight="fill" className="text-destructive" />
                        )}
                        <span className="text-sm font-medium">
                          {WEBHOOK_EVENTS.find((e) => e.value === log.event)?.label || log.event}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString('nb-NO')}
                      </span>
                    </div>
                    
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {log.statusCode && <span>Status: {log.statusCode}</span>}
                      {log.responseTime && <span>{log.responseTime}ms</span>}
                    </div>
                    
                    {log.errorMessage && (
                      <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                        {log.errorMessage}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
