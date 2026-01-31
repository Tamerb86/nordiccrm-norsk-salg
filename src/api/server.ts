const MOCK_API_KEY = 'test_key_12345'

interface ApiKeyData {
  id: string
  name: string
  key: string
  permissions: string[]
  resourcePermissions?: Array<{
    resource: string
    actions: string[]
  }>
  createdAt: string
  isActive?: boolean
  lastUsed?: string
}

export class ApiServer {
  private normalizeMethod(method: string) {
    return (method || '').toUpperCase()
  }

  private makeId() {
    // أفضل من Date.now() لتجنب تكرار IDs
    return (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`)
  }

  private async validateApiKey(apiKey: string): Promise<boolean> {
    if (apiKey === MOCK_API_KEY) return true

    const keys = (await window.spark.kv.get<ApiKeyData[]>('api-keys')) || []
    const key = keys.find(k => k.key === apiKey && k.isActive !== false)

    if (!key) return false

    // تحديث lastUsed
    const updatedKeys = keys.map(k =>
      k.key === apiKey ? { ...k, lastUsed: new Date().toISOString() } : k
    )
    await window.spark.kv.set('api-keys', updatedKeys)
    return true
  }

  private async checkPermission(apiKey: string, resource: string, action: string): Promise<boolean> {
    if (apiKey === MOCK_API_KEY) return true

    const keys = (await window.spark.kv.get<ApiKeyData[]>('api-keys')) || []
    const key = keys.find(k => k.key === apiKey && k.isActive !== false)
    if (!key) return false

    // wildcard
    if (key.permissions.includes('*') || key.permissions.includes(`${resource}:*`)) return true
    if (key.permissions.includes(`${resource}:${action}`)) return true

    // resourcePermissions
    const resourcePerm = key.resourcePermissions?.find(rp => rp.resource === resource)
    if (resourcePerm && (resourcePerm.actions.includes('*') || resourcePerm.actions.includes(action))) {
      return true
    }

    return false
  }

  private async triggerWebhooks(event: string, payload: any): Promise<void> {
    const webhooks = (await window.spark.kv.get<any[]>('webhooks')) || []

    for (const webhook of webhooks) {
      if (webhook.isActive && webhook.events?.includes(event)) {
        try {
          // هذا ليس signature أمني — مجرد marker
          const marker = btoa(unescape(encodeURIComponent(JSON.stringify({ event, ts: Date.now() }))))

          await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json
