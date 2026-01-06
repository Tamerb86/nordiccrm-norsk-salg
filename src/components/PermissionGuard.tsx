import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Shield } from '@phosphor-icons/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useLanguage } from '@/lib/language-context'

interface PermissionGuardProps {
  resource: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  hideOnDenied?: boolean
}

export default function PermissionGuard({ 
  resource, 
  action, 
  children, 
  fallback,
  hideOnDenied = false 
}: PermissionGuardProps) {
  const { hasPermission } = useAuth()
  const { t } = useLanguage()
  const hasAccess = hasPermission(resource, action)

  if (!hasAccess) {
    if (hideOnDenied) {
      return null
    }
    
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Alert variant="destructive">
        <Shield size={20} />
        <AlertTitle>{t.auth?.accessDenied || 'Access Denied'}</AlertTitle>
        <AlertDescription>
          {t.auth?.noPermission || 'You do not have permission to access this feature.'}
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
