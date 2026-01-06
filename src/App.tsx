import { useState, useEffect } from 'react'
import { Users, ChartBar, Target, ListChecks, House, EnvelopeSimple, PlugsConnected, UserCircleGear } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { canAccessResource } from '@/lib/role-permissions'
import Dashboard from '@/components/Dashboard'
import ContactsView from '@/components/ContactsView'
import PipelineView from '@/components/PipelineView'
import TasksView from '@/components/TasksView'
import EmailsView from '@/components/EmailsView'
import ApiIntegrationsView from '@/components/ApiIntegrationsView'
import TeamManagementView from '@/components/TeamManagementView'
import ScheduledEmailsManager from '@/components/ScheduledEmailsManager'
import LoginForm from '@/components/LoginForm'
import ForgotPasswordForm from '@/components/ForgotPasswordForm'
import ResetPasswordForm from '@/components/ResetPasswordForm'
import EmailVerification from '@/components/EmailVerification'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'
import UserMenu from '@/components/UserMenu'
import Footer from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'

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
    if (authView === 'forgot-password') {
      return <ForgotPasswordForm onBack={() => setAuthView('login')} />
    }

    if (authView === 'reset-password' && resetToken) {
      return (
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
      )
    }

    if (authView === 'verify-email' && verifyToken) {
      return (
        <EmailVerification
          token={verifyToken}
          onSuccess={() => {
            setAuthView('login')
            setVerifyToken(null)
          }}
        />
      )
    }

    return <LoginForm onForgotPassword={() => setAuthView('forgot-password')} />
  }

  const allNavItems = [
    { id: 'dashboard' as View, label: t.nav.dashboard, icon: House, resource: 'contacts' },
    { id: 'contacts' as View, label: t.nav.contacts, icon: Users, resource: 'contacts' },
    { id: 'pipeline' as View, label: t.nav.pipeline, icon: Target, resource: 'deals' },
    { id: 'tasks' as View, label: t.nav.tasks, icon: ListChecks, resource: 'tasks' },
    { id: 'emails' as View, label: t.email.title, icon: EnvelopeSimple, resource: 'emails' },
    { id: 'api' as View, label: t.api.title, icon: PlugsConnected, resource: 'api' },
    { id: 'team' as View, label: t.team.title, icon: UserCircleGear, resource: 'team' },
  ]

  const navItems = allNavItems.filter(item => 
    user ? canAccessResource(user.role, item.resource as any) : false
  )

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
        
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'contacts' && <ContactsView />}
        {currentView === 'pipeline' && <PipelineView />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'emails' && <EmailsView />}
        {currentView === 'api' && <ApiIntegrationsView />}
        {currentView === 'team' && <TeamManagementView />}
      </main>

      <Footer />

      <Toaster position="top-right" />
      <ScheduledEmailsManager />
    </div>
  )
}

export default App