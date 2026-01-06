import { useState } from 'react'
import { SignIn, Eye, EyeSlash } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface LoginFormProps {
  onForgotPassword: () => void
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const { t } = useLanguage()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error(t.auth?.fillAllFields || 'Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast.success(t.auth?.loginSuccess || 'Login successful')
      } else {
        toast.error(t.auth?.invalidCredentials || 'Invalid email or password')
      }
    } catch (error) {
      toast.error(t.auth?.loginError || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t.auth?.login || 'Login'}
          </CardTitle>
          <CardDescription className="text-center">
            {t.auth?.loginDescription || 'Enter your credentials to access the CRM'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth?.email || 'Email'}</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t.auth?.password || 'Password'}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end mb-4">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary hover:underline"
              >
                {t.auth?.forgotPassword || 'Forgot password?'}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <SignIn size={20} className="mr-2" />
              {isLoading ? (t.auth?.loggingIn || 'Logging in...') : (t.auth?.login || 'Login')}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground font-medium mb-2">
              {t.auth?.demoAccounts || 'Demo Accounts:'}
            </p>
            <div className="space-y-1 text-xs text-muted-foreground font-mono">
              <p>Admin: admin@crm.no</p>
              <p>Manager: manager@crm.no</p>
              <p>Sales: sales@crm.no</p>
              <p className="mt-2 italic">{t.auth?.anyPassword || 'Password: any value'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
