import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { Webhook, WebhookEvent, WebhookLog } from '@/lib/types'

export function useWebhookTrigger() {
  const [webhooks = []] = useKV<Webhook[]>('webhooks', [])
  const [, setWebhookLogs] = useKV<WebhookLog[]>('webhook-logs', [])

  const triggerWebhook = async (event: WebhookEvent, data: any) => {
    const activeWebhooks = webhooks.filter(
      (webhook) => webhook.isActive && webhook.events.includes(event)
    )

    for (const webhook of activeWebhooks) {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      }

      const startTime = Date.now()
      let success = true
      let statusCode: number | undefined
      let errorMessage: string | undefined

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': webhook.secret,
            'X-Webhook-Event': event,
          },
          body: JSON.stringify(payload),
        })

        statusCode = response.status
        success = response.ok
        
        if (!response.ok) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (error) {
        success = false
        statusCode = 0
        errorMessage = error instanceof Error ? error.message : 'Unknown error'
      }

      const responseTime = Date.now() - startTime

      const log: WebhookLog = {
        id: Date.now().toString() + Math.random(),
        webhookId: webhook.id,
        event,
        payload,
        statusCode,
        responseTime,
        success,
        errorMessage,
        createdAt: new Date().toISOString(),
      }

      setWebhookLogs((current = []) => [log, ...current.slice(0, 99)])
    }
  }

  return { triggerWebhook }
}
