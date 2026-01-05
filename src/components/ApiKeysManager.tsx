import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Key, Copy, Plus, Trash, Clock, CheckCircle, XCircle, CaretDown, CaretRight, LockKey, Globe, ShieldCheck } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import type { ApiKey, ApiKeyPermission, ApiKeyResource, ResourcePermission } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const prefix = 'crm_'
  let key = prefix
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

const RESOURCES: ApiKeyResource[] = ['contacts', 'deals', 'tasks', 'emails', 'webhooks', 'reports']
const PERMISSIONS: ApiKeyPermission[] = ['read', 'write', 'delete']

export default function ApiKeysManager() {
  const [apiKeys = [], setApiKeys] = useKV<ApiKey[]>('api-keys', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyDescription, setNewKeyDescription] = useState('')
  const [newKeyPermissions, setNewKeyPermissions] = useState<ApiKeyPermission[]>(['read'])
  const [useResourcePermissions, setUseResourcePermissions] = useState(false)
  const [resourcePermissions, setResourcePermissions] = useState<ResourcePermission[]>([])
  const [newKeyExpiry, setNewKeyExpiry] = useState<string>('')
  const [rateLimit, setRateLimit] = useState('1000')
  const [ipWhitelist, setIpWhitelist] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Vennligst angi et navn for API-nøkkelen')
      return
    }

    if (useResourcePermissions && resourcePermissions.length === 0) {
      toast.error('Vennligst velg minst én ressurstillatelse')
      return
    }

    const apiKey = generateApiKey()
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      description: newKeyDescription || undefined,
      key: apiKey,
      permissions: useResourcePermissions ? [] : newKeyPermissions,
      resourcePermissions: useResourcePermissions ? resourcePermissions : undefined,
      expiresAt: newKeyExpiry || undefined,
      rateLimit: parseInt(rateLimit) || 1000,
      ipWhitelist: ipWhitelist ? ipWhitelist.split(',').map(ip => ip.trim()).filter(Boolean) : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setApiKeys((current = []) => [...current, newKey])
    setCreatedKey(apiKey)
    toast.success(t.api.keyCreated)
    
    resetForm()
  }

  const resetForm = () => {
    setNewKeyName('')
    setNewKeyDescription('')
    setNewKeyPermissions(['read'])
    setUseResourcePermissions(false)
    setResourcePermissions([])
    setNewKeyExpiry('')
    setRateLimit('1000')
    setIpWhitelist('')
    setShowAdvanced(false)
  }

  const handleRevokeKey = (keyId: string) => {
    setApiKeys((current = []) =>
      current.map((key) =>
        key.id === keyId ? { ...key, isActive: false, updatedAt: new Date().toISOString() } : key
      )
    )
    toast.success(t.api.keyRevoked)
  }

  const handleDeleteKey = (keyId: string) => {
    setApiKeys((current = []) => current.filter((key) => key.id !== keyId))
    toast.success(t.common.success)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t.api.keyCopied)
  }

  const togglePermission = (permission: ApiKeyPermission) => {
    setNewKeyPermissions((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission]
    )
  }

  const toggleResourcePermission = (resource: ApiKeyResource, action: ApiKeyPermission) => {
    setResourcePermissions((current) => {
      const existing = current.find(rp => rp.resource === resource)
      
      if (!existing) {
        return [...current, { resource, actions: [action] }]
      }
      
      const hasAction = existing.actions.includes(action)
      const updatedActions = hasAction
        ? existing.actions.filter(a => a !== action)
        : [...existing.actions, action]
      
      if (updatedActions.length === 0) {
        return current.filter(rp => rp.resource !== resource)
      }
      
      return current.map(rp =>
        rp.resource === resource ? { ...rp, actions: updatedActions } : rp
      )
    })
  }

  const hasResourcePermission = (resource: ApiKeyResource, action: ApiKeyPermission): boolean => {
    const rp = resourcePermissions.find(rp => rp.resource === resource)
    return rp ? rp.actions.includes(action) : false
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setCreatedKey(null)
    resetForm()
  }

  const formatDate = (date?: string) => {
    if (!date) return t.api.neverExpires
    return new Date(date).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getResourceLabel = (resource: ApiKeyResource): string => {
    const key = `resource${resource.charAt(0).toUpperCase() + resource.slice(1)}` as keyof typeof t.api
    return t.api[key] as string
  }

  const getPermissionLabel = (permission: ApiKeyPermission): string => {
    const key = `permission${permission.charAt(0).toUpperCase() + permission.slice(1)}` as keyof typeof t.api
    return t.api[key] as string
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.api.apiKeys}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administrer API-nøkler for eksterne integrasjoner
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} weight="bold" />
              {t.api.newApiKey}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t.api.newApiKey}</DialogTitle>
            </DialogHeader>

            {createdKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                  <div className="flex items-start gap-2 mb-3">
                    <CheckCircle size={20} weight="fill" className="text-accent mt-0.5" />
                    <p className="text-sm text-foreground font-medium">{t.api.keyWarning}</p>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-md font-mono text-sm break-all">
                    <code className="flex-1">{createdKey}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(createdKey)}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                <Button onClick={closeDialog} className="w-full">
                  {t.common.close}
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="key-name">{t.api.apiKeyName}</Label>
                  <Input
                    id="key-name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Min integrasjon"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key-description">{t.api.apiKeyDescription} ({t.common.optional})</Label>
                  <Textarea
                    id="key-description"
                    value={newKeyDescription}
                    onChange={(e) => setNewKeyDescription(e.target.value)}
                    placeholder="Beskrivelse av hva denne API-nøkkelen brukes til..."
                    rows={2}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">{t.api.permissions}</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {useResourcePermissions ? t.api.customizePermissions : t.api.useBasicPermissions}
                      </p>
                    </div>
                    <Switch
                      checked={useResourcePermissions}
                      onCheckedChange={setUseResourcePermissions}
                    />
                  </div>

                  {!useResourcePermissions ? (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                      {(['read', 'write', 'delete', 'admin'] as ApiKeyPermission[]).map((permission) => (
                        <div key={permission} className="flex items-center gap-2">
                          <Checkbox
                            id={permission}
                            checked={newKeyPermissions.includes(permission)}
                            onCheckedChange={() => togglePermission(permission)}
                          />
                          <Label htmlFor={permission} className="cursor-pointer text-sm">
                            {getPermissionLabel(permission)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        {t.api.resourcePermissions}
                      </div>
                      <div className="border rounded-lg divide-y">
                        {RESOURCES.map((resource) => (
                          <div key={resource} className="p-3">
                            <div className="font-medium text-sm mb-2 flex items-center gap-2">
                              <LockKey size={16} weight="duotone" className="text-primary" />
                              {getResourceLabel(resource)}
                            </div>
                            <div className="flex gap-3 pl-6">
                              {PERMISSIONS.map((action) => (
                                <div key={action} className="flex items-center gap-1.5">
                                  <Checkbox
                                    id={`${resource}-${action}`}
                                    checked={hasResourcePermission(resource, action)}
                                    onCheckedChange={() => toggleResourcePermission(resource, action)}
                                  />
                                  <Label
                                    htmlFor={`${resource}-${action}`}
                                    className="cursor-pointer text-xs"
                                  >
                                    {getPermissionLabel(action)}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors w-full">
                    {showAdvanced ? <CaretDown size={16} /> : <CaretRight size={16} />}
                    {t.api.advancedSettings}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">{t.api.expiresAt} ({t.common.optional})</Label>
                      <Input
                        id="expiry"
                        type="date"
                        value={newKeyExpiry}
                        onChange={(e) => setNewKeyExpiry(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate-limit">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} weight="duotone" />
                          {t.api.rateLimit}
                        </div>
                      </Label>
                      <Input
                        id="rate-limit"
                        type="number"
                        value={rateLimit}
                        onChange={(e) => setRateLimit(e.target.value)}
                        min="100"
                        max="10000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ip-whitelist">
                        <div className="flex items-center gap-2">
                          <Globe size={16} weight="duotone" />
                          {t.api.ipWhitelist}
                        </div>
                      </Label>
                      <Input
                        id="ip-whitelist"
                        value={ipWhitelist}
                        onChange={(e) => setIpWhitelist(e.target.value)}
                        placeholder="192.168.1.1, 10.0.0.1"
                      />
                      <p className="text-xs text-muted-foreground">{t.api.ipWhitelistHelp}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleCreateKey} className="flex-1">
                    <Key size={18} weight="bold" className="mr-2" />
                    {t.common.save}
                  </Button>
                  <Button variant="outline" onClick={closeDialog}>
                    {t.common.cancel}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card className="p-12 text-center">
          <Key size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t.common.noResults}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Opprett din første API-nøkkel for å begynne å integrere med eksterne systemer
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((apiKey) => {
            const expired = isExpired(apiKey.expiresAt)
            const isInactive = !apiKey.isActive || expired

            return (
              <Card key={apiKey.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Key size={20} weight="duotone" className="text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-foreground truncate">{apiKey.name}</h3>
                        {isInactive ? (
                          <Badge variant="outline" className="border-destructive text-destructive">
                            <XCircle size={14} weight="fill" className="mr-1" />
                            {expired ? 'Utløpt' : t.api.inactive}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-accent text-accent">
                            <CheckCircle size={14} weight="fill" className="mr-1" />
                            {t.api.active}
                          </Badge>
                        )}
                      </div>

                      {apiKey.description && (
                        <p className="text-sm text-muted-foreground mb-3">{apiKey.description}</p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                          {apiKey.key.substring(0, 24)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy size={16} />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            {t.api.permissions}:
                          </div>
                          {apiKey.resourcePermissions && apiKey.resourcePermissions.length > 0 ? (
                            <div className="space-y-2">
                              {apiKey.resourcePermissions.map((rp) => (
                                <div key={rp.resource} className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="secondary" className="font-medium">
                                    {getResourceLabel(rp.resource)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">→</span>
                                  {rp.actions.map((action) => (
                                    <Badge key={action} variant="outline" className="text-xs">
                                      {getPermissionLabel(action)}
                                    </Badge>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {apiKey.permissions.map((permission) => (
                                <Badge key={permission} variant="secondary">
                                  {getPermissionLabel(permission)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{t.api.expiresAt}: {formatDate(apiKey.expiresAt)}</span>
                          </div>
                          {apiKey.rateLimit && (
                            <div className="flex items-center gap-1">
                              <ShieldCheck size={14} />
                              <span>{apiKey.rateLimit}/h</span>
                            </div>
                          )}
                          {apiKey.ipWhitelist && apiKey.ipWhitelist.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Globe size={14} />
                              <span>{apiKey.ipWhitelist.length} IP(s)</span>
                            </div>
                          )}
                          {apiKey.lastUsedAt && (
                            <div className="flex items-center gap-1">
                              <span>{t.api.lastUsed}: {formatDate(apiKey.lastUsedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {apiKey.isActive && !expired && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeKey(apiKey.id)}
                        >
                          {t.api.revokeKey}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteKey(apiKey.id)}
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
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
