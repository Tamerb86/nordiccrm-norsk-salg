import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { PlugsConnected, Plus, Trash, ArrowsClockwise, Envelope, ChatCircle, Calendar, Database, CheckCircle, XCircle } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import type { Integration, IntegrationType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const INTEGRATION_TYPES: { value: IntegrationType; label: string; icon: any }[] = [
  { value: 'smtp', label: 'SMTP E-post', icon: Envelope },
  { value: 'sms', label: 'SMS Gateway', icon: ChatCircle },
  { value: 'accounting', label: 'Regnskapssystem', icon: Database },
  { value: 'calendar', label: 'Kalender', icon: Calendar },
  { value: 'storage', label: 'Fillagring', icon: Database },
  { value: 'custom', label: 'Egendefinert', icon: PlugsConnected },
]

const SMTP_PROVIDERS = ['Gmail', 'Outlook', 'SendGrid', 'Mailgun', 'Custom']
const SMS_PROVIDERS = ['Twilio', 'Vonage', 'MessageBird', 'Custom']

export default function IntegrationsManager() {
  const [integrations = [], setIntegrations] = useKV<Integration[]>('integrations', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newIntegration, setNewIntegration] = useState({
    type: 'smtp' as IntegrationType,
    name: '',
    provider: '',
    config: {} as Record<string, any>,
  })

  const handleCreateIntegration = () => {
    if (!newIntegration.name.trim() || !newIntegration.provider.trim()) {
      toast.error('Vennligst fyll ut alle påkrevde felt')
      return
    }

    const integration: Integration = {
      id: Date.now().toString(),
      type: newIntegration.type,
      name: newIntegration.name,
      provider: newIntegration.provider,
      isActive: true,
      config: newIntegration.config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setIntegrations((current = []) => [...current, integration])
    toast.success(t.api.integrationCreated)
    
    setNewIntegration({
      type: 'smtp',
      name: '',
      provider: '',
      config: {},
    })
    setIsDialogOpen(false)
  }

  const handleToggleActive = (integrationId: string) => {
    setIntegrations((current = []) =>
      current.map((integration) =>
        integration.id === integrationId
          ? { ...integration, isActive: !integration.isActive, updatedAt: new Date().toISOString() }
          : integration
      )
    )
    toast.success(t.api.integrationUpdated)
  }

  const handleDeleteIntegration = (integrationId: string) => {
    setIntegrations((current = []) => current.filter((integration) => integration.id !== integrationId))
    toast.success(t.api.integrationDeleted)
  }

  const handleSyncNow = (integration: Integration) => {
    setIntegrations((current = []) =>
      current.map((i) =>
        i.id === integration.id
          ? {
              ...i,
              lastSyncAt: new Date().toISOString(),
              lastSyncStatus: 'success',
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    )
    toast.success('Synkronisering fullført')
  }

  const updateConfig = (key: string, value: any) => {
    setNewIntegration((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }))
  }

  const getProviders = (type: IntegrationType) => {
    if (type === 'smtp') return SMTP_PROVIDERS
    if (type === 'sms') return SMS_PROVIDERS
    return ['Custom']
  }

  const renderConfigFields = () => {
    const { type } = newIntegration

    if (type === 'smtp') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="smtp-host">{t.api.smtpHost}</Label>
            <Input
              id="smtp-host"
              value={newIntegration.config.host || ''}
              onChange={(e) => updateConfig('host', e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-port">{t.api.smtpPort}</Label>
              <Input
                id="smtp-port"
                type="number"
                value={newIntegration.config.port || ''}
                onChange={(e) => updateConfig('port', e.target.value)}
                placeholder="587"
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <Switch
                id="smtp-secure"
                checked={newIntegration.config.secure || false}
                onCheckedChange={(checked) => updateConfig('secure', checked)}
              />
              <Label htmlFor="smtp-secure">{t.api.smtpSecure}</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-username">{t.api.smtpUsername}</Label>
            <Input
              id="smtp-username"
              value={newIntegration.config.username || ''}
              onChange={(e) => updateConfig('username', e.target.value)}
              placeholder="din-epost@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-password">{t.api.smtpPassword}</Label>
            <Input
              id="smtp-password"
              type="password"
              value={newIntegration.config.password || ''}
              onChange={(e) => updateConfig('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </>
      )
    }

    if (type === 'sms') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="sms-api-key">{t.api.smsApiKey}</Label>
            <Input
              id="sms-api-key"
              type="password"
              value={newIntegration.config.apiKey || ''}
              onChange={(e) => updateConfig('apiKey', e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sms-from">Avsender-ID</Label>
            <Input
              id="sms-from"
              value={newIntegration.config.from || ''}
              onChange={(e) => updateConfig('from', e.target.value)}
              placeholder="DITTFIRMA"
            />
          </div>
        </>
      )
    }

    return null
  }

  const getIntegrationIcon = (type: IntegrationType) => {
    const iconType = INTEGRATION_TYPES.find((t) => t.value === type)
    return iconType?.icon || PlugsConnected
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.api.integrations}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Koble til eksterne tjenester og systemer
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} weight="bold" />
              {t.api.newIntegration}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t.api.newIntegration}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="integration-type">{t.api.integrationType}</Label>
                <Select
                  value={newIntegration.type}
                  onValueChange={(value: IntegrationType) =>
                    setNewIntegration({ ...newIntegration, type: value, provider: '', config: {} })
                  }
                >
                  <SelectTrigger id="integration-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEGRATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="integration-name">Navn på integrasjon</Label>
                <Input
                  id="integration-name"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  placeholder="Min integrasjon"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="integration-provider">{t.api.integrationProvider}</Label>
                <Select
                  value={newIntegration.provider}
                  onValueChange={(value) =>
                    setNewIntegration({ ...newIntegration, provider: value })
                  }
                >
                  <SelectTrigger id="integration-provider">
                    <SelectValue placeholder="Velg leverandør" />
                  </SelectTrigger>
                  <SelectContent>
                    {getProviders(newIntegration.type).map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderConfigFields()}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateIntegration} className="flex-1">
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

      {integrations.length === 0 ? (
        <Card className="p-12 text-center">
          <PlugsConnected size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t.common.noResults}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Opprett din første integrasjon for å koble til eksterne tjenester
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {integrations.map((integration) => {
            const Icon = getIntegrationIcon(integration.type)
            const typeLabel = INTEGRATION_TYPES.find((t) => t.value === integration.type)?.label

            return (
              <Card key={integration.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={20} weight="duotone" className="text-primary flex-shrink-0" />
                      <h3 className="font-semibold text-foreground truncate">{integration.name}</h3>
                      {integration.isActive ? (
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
                    </div>

                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary">{typeLabel}</Badge>
                      <Badge variant="secondary">{integration.provider}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {integration.lastSyncAt && (
                        <span>
                          {t.api.lastSync}:{' '}
                          {new Date(integration.lastSyncAt).toLocaleDateString('nb-NO')}
                        </span>
                      )}
                      {integration.lastSyncStatus && (
                        <span
                          className={
                            integration.lastSyncStatus === 'success'
                              ? 'text-accent'
                              : 'text-destructive'
                          }
                        >
                          {integration.lastSyncStatus === 'success'
                            ? t.api.statusSuccess
                            : t.api.statusFailed}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {integration.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncNow(integration)}
                      >
                        <ArrowsClockwise size={18} />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(integration.id)}
                    >
                      {integration.isActive ? 'Deaktiver' : 'Aktiver'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteIntegration(integration.id)}
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
