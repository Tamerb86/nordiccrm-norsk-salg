import { Check, X } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { rolePermissions } from '@/lib/role-permissions'
import type { UserRole } from '@/lib/types'

interface RolePermissionsViewProps {
  role: UserRole
}

export default function RolePermissionsView({ role }: RolePermissionsViewProps) {
  const { t } = useLanguage()
  const permissions = rolePermissions[role]

  const PermissionIcon = ({ allowed }: { allowed: boolean }) =>
    allowed ? (
      <Check size={18} className="text-accent" weight="bold" />
    ) : (
      <X size={18} className="text-muted-foreground" />
    )

  const resourceSections = [
    {
      key: 'contacts' as const,
      title: t.permissions.contacts,
      permissions: permissions.contacts,
    },
    {
      key: 'deals' as const,
      title: t.permissions.deals,
      permissions: permissions.deals,
    },
    {
      key: 'tasks' as const,
      title: t.permissions.tasks,
      permissions: permissions.tasks,
    },
    {
      key: 'emails' as const,
      title: t.permissions.emails,
      permissions: permissions.emails,
    },
    {
      key: 'reports' as const,
      title: t.permissions.reports,
      permissions: permissions.reports,
    },
    {
      key: 'api' as const,
      title: t.permissions.api,
      permissions: permissions.api,
    },
    {
      key: 'team' as const,
      title: t.permissions.team,
      permissions: permissions.team,
    },
  ]

  const getPermissionLabel = (key: string): string => {
    const labels: Record<string, string> = {
      view: t.permissions.view,
      create: t.permissions.create,
      edit: t.permissions.edit,
      delete: t.permissions.delete,
      viewAll: t.permissions.viewAll,
      exportData: t.permissions.exportData,
      importData: t.permissions.importData,
      reassign: t.permissions.reassign,
      send: t.permissions.send,
      manageTemplates: t.permissions.manageTemplates,
      export: t.permissions.export,
      manage: t.permissions.manage,
      invite: t.permissions.invite,
      remove: t.permissions.remove,
      changeRoles: t.permissions.changeRoles,
    }
    return labels[key] || key
  }

  return (
    <div className="space-y-4">
      {resourceSections.map((section) => (
        <Card key={section.key}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(section.permissions).map(([key, allowed]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <span className="text-sm">{getPermissionLabel(key)}</span>
                  <PermissionIcon allowed={allowed as boolean} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
