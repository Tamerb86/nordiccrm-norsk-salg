import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Key, Copy, Plus, Trash, Clock, CheckCircle, XCircle } from '@phosphor-icons/react'
import { norwegianTranslations as t } from '@/lib/norwegian'
import type { ApiKey, ApiKeyPermission } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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

export default function ApiKeysManager() {
  const [apiKeys = [], setApiKeys] = useKV<ApiKey[]>('api-keys', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPermissions, setNewKeyPermissions] = useState<ApiKeyPermission[]>(['read'])
  const [newKeyExpiry, setNewKeyExpiry] = useState<string>('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Vennligst angi et navn for API-nøkkelen')
      return
    }

    const apiKey = generateApiKey()
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: apiKey,
      permissions: newKeyPermissions,
      expiresAt: newKeyExpiry || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setApiKeys((current = []) => [...current, newKey])
    setCreatedKey(apiKey)
    toast.success(t.api.keyCreated)
    
    setNewKeyName('')
    setNewKeyPermissions(['read'])
    setNewKeyExpiry('')
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

  const closeDialog = () => {
    setIsDialogOpen(false)
    setCreatedKey(null)
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
              <div className="space-y-4">
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
                  <Label>{t.api.permissions}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['read', 'write', 'delete', 'admin'] as ApiKeyPermission[]).map((permission) => (
                      <div key={permission} className="flex items-center gap-2">
                        <Checkbox
                          id={permission}
                          checked={newKeyPermissions.includes(permission)}
                          onCheckedChange={() => togglePermission(permission)}
                        />
                        <Label htmlFor={permission} className="cursor-pointer">
                          {t.api[`permission${permission.charAt(0).toUpperCase() + permission.slice(1)}` as keyof typeof t.api]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

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

                <div className="flex gap-2">
                  <Button onClick={handleCreateKey} className="flex-1">
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
              <Card key={apiKey.id} className="p-5">
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

                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {apiKey.key.substring(0, 20)}...
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {apiKey.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary">
                          {t.api[`permission${permission.charAt(0).toUpperCase() + permission.slice(1)}` as keyof typeof t.api]}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{t.api.expiresAt}: {formatDate(apiKey.expiresAt)}</span>
                      </div>
                      {apiKey.lastUsedAt && (
                        <div className="flex items-center gap-1">
                          <span>{t.api.lastUsed}: {formatDate(apiKey.lastUsedAt)}</span>
                        </div>
                      )}
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
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
