import { useState, useEffect, lazy, Suspense } from 'react'
import { Users, ChartBar, Target, ListChecks, House, EnvelopeSimple, PlugsConnected, UserCircleGear } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { canAccessResource } from '@/lib/role-permissions'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'
import UserMenu from '@/components/UserMenu'
import Footer from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'
import ScheduledEmailsManager from '@/components/ScheduledEmailsManager'
import { ViewLoadingSkeleton, AuthLoadingSkeleton } from '@/components/LoadingSkeleton'

const Dashboard = lazy(() => import('@/components/Dashboard'))
const ContactsView = lazy(() => import('@/components/ContactsView'))
const PipelineView = lazy(() => import('@/components/PipelineView'))
const TasksView = lazy(() => import('@/components/TasksView'))
const EmailsView = lazy(() => import('@/components/EmailsView'))
const ApiIntegrationsView = lazy(() => import('@/components/ApiIntegrationsView'))
const TeamManagementView = lazy(() => import('@/components/TeamManagementView'))
const LoginForm = lazy(() => import('@/components/LoginForm'))
const ForgotPasswordForm = lazy(() => import('@/components/ForgotPasswordForm'))
const ResetPasswordForm = lazy(() => import('@/components/ResetPasswordForm'))
const EmailVerification = lazy(() => import('@/components/EmailVerification'))

type View = 'dashboard' | 'contacts' | 'pipeline' | 'tasks' | 'emails' | 'api' | 'team'
type AuthView = 'login' | 'forgot-password' | 'reset-password' | 'verify-email'

function App() {
  const { t } = useLanguage()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [authView, setAuthView] = useState<AuthView>('login')
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [verifyToken, setVerifyToken] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reset = params.get('reset')
    const verify = params.get('verify')

    if (reset) {
      setResetToken(reset)
      setAuthView('reset-password')
      window.history.replaceState({}, '', window.location.pathname)
    } else if (verify) {
      setVerifyToken(verify)
      setAuthView('verify-email')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<AuthLoadingSkeleton />}>
        {authView === 'forgot-password' && (
          <ForgotPasswordForm onBack={() => setAuthView('login')} />
        )}

        {authView === 'reset-password' && resetToken && (
          <ResetPasswordForm
            token={resetToken}
            onSuccess={() => {
              setAuthView('login')
              setResetToken(null)
            }}
            onBack={() => {
              setAuthView('login')
              setResetToken(null)
            }}
          />
        )}

        {authView === 'verify-email' && verifyToken && (
          <EmailVerification
            token={verifyToken}
            onSuccess={() => {
              setAuthView('login')
              setVerifyToken(null)
            }}
          />
        )}

        {authView === 'login' && (
          <LoginForm onForgotPassword={() => setAuthView('forgot-password')} />
        )}
      </Suspense>
    )
  }

  const allNavItems = [
    { id: 'dashboard' as View, label: t.nav.dashboard, icon: House, resource: 'contacts' as const },
    { id: 'contacts' as View, label: t.nav.contacts, icon: Users, resource: 'contacts' as const },
    { id: 'pipeline' as View, label: t.nav.pipeline, icon: Target, resource: 'deals' as const },
    { id: 'tasks' as View, label: t.nav.tasks, icon: ListChecks, resource: 'tasks' as const },
    { id: 'emails' as View, label: t.email.title, icon: EnvelopeSimple, resource: 'emails' as const },
    { id: 'api' as View, label: t.api.title, icon: PlugsConnected, resource: 'api' as const },
    { id: 'team' as View, label: t.team.title, icon: UserCircleGear, resource: 'team' as const },
  ]

  const navItems = allNavItems.filter(item => 
    user ? canAccessResource(user.role as any, item.resource) : false
  )

  const preloadView = (viewId: View) => {
    switch (viewId) {
      case 'dashboard':
        import('@/components/Dashboard')
        break
      case 'contacts':
        import('@/components/ContactsView')
        break
      case 'pipeline':
        import('@/components/PipelineView')
        break
      case 'tasks':
        import('@/components/TasksView')
        break
      case 'emails':
        import('@/components/EmailsView')
        break
      case 'api':
        import('@/components/ApiIntegrationsView')
        break
      case 'team':
        import('@/components/TeamManagementView')
        break
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <ChartBar size={32} weight="duotone" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">{t.app.title}</h1>
                <p className="text-xs opacity-90">{t.app.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <UserMenu />
            </div>

            <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    onMouseEnter={() => preloadView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === item.id
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`}
                  >
                    <Icon size={20} weight={currentView === item.id ? 'fill' : 'regular'} />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            <div className="md:hidden flex items-center gap-2">
              <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value as View)}
                className="bg-primary-foreground/20 text-primary-foreground px-3 py-2 rounded-md text-sm font-medium border-0 focus:ring-2 focus:ring-primary-foreground/30"
              >
                {navItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex-1">
        {user && <EmailVerificationBanner userId={user.id} />}
        
        <Suspense fallback={<ViewLoadingSkeleton />}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'contacts' && <ContactsView />}
          {currentView === 'pipeline' && <PipelineView />}
          {currentView === 'tasks' && <TasksView />}
          {currentView === 'emails' && <EmailsView />}
          {currentView === 'api' && <ApiIntegrationsView />}
          {currentView === 'team' && <TeamManagementView />}
        </Suspense>
      </main>

      <Footer />

      <Toaster position="top-right" />
      <ScheduledEmailsManager />
    </div>
  )
}

export default App