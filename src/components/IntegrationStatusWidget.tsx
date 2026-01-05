import { useKV } from '@github/spark/hooks'
import { CheckCircle, XCircle, Warning } from '@phosphor-icons/react'
import type { Integration } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function IntegrationStatusWidget() {
  const [integrations = []] = useKV<Integration[]>('integrations', [])

  const activeIntegrations = integrations.filter((i) => i.isActive)
  const failedIntegrations = integrations.filter(
    (i) => i.isActive && i.lastSyncStatus === 'failed'
  )

  if (integrations.length === 0) return null

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {failedIntegrations.length > 0 ? (
            <>
              <Warning size={20} weight="fill" className="text-destructive" />
              <span className="text-sm font-medium">Integrasjoner</span>
            </>
          ) : activeIntegrations.length > 0 ? (
            <>
              <CheckCircle size={20} weight="fill" className="text-accent" />
              <span className="text-sm font-medium">Integrasjoner</span>
            </>
          ) : (
            <>
              <XCircle size={20} weight="fill" className="text-muted-foreground" />
              <span className="text-sm font-medium">Integrasjoner</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary">
            {activeIntegrations.length} aktive
          </Badge>
          {failedIntegrations.length > 0 && (
            <Badge variant="destructive">
              {failedIntegrations.length} feilet
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
