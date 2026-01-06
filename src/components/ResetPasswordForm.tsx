import { useState, useEffect } from 'react'
import { LockKey, Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import type { TeamMember } from '@/lib/types'

interface ResetPasswordFormProps {
  token: string
  onSuccess: () => void
  onBack: () => void
}

export default function ResetPasswordForm({ token, onSuccess, onBack }: ResetPasswordFormProps) {
  const { t } = useLanguage()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('team-members', [])

  useEffect(() => {
    const validateToken = () => {
      const member = (teamMembers || []).find(
        m => m.passwordResetToken === token && 
        m.passwordResetExpires && 
        new Date(m.passwordResetExpires) > new Date()
      )

      setIsValidToken(!!member)
    }

    validateToken()
  }, [token, teamMembers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error(t.auth?.fillAllFields || 'Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.auth?.passwordsDoNotMatch || 'Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      const member = (teamMembers || []).find(
        m => m.passwordResetToken === token
      )

      if (!member) {
        toast.error(t.auth?.invalidResetToken || 'Invalid or expired reset link')
        return
      }

      const updatedMembers = (teamMembers || []).map(m =>
        m.id === member.id
          ? { 
              ...m, 
              passwordResetToken: undefined, 
              passwordResetExpires: undefined,
            }
          : m
      )

      setTeamMembers(updatedMembers)
      setResetSuccess(true)
      toast.success(t.auth?.passwordResetSuccess || 'Password reset successfully')
      
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      toast.error(t.auth?.passwordResetError || 'Could not reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t.auth?.verifying || 'Verifying...'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-destructive">
              {t.auth?.invalidResetToken || 'Invalid or expired reset link'}
            </CardTitle>
            <CardDescription>
              The password reset link is no longer valid. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full">
              {t.auth?.backToLogin || 'Back to login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-accent" weight="fill" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t.auth?.passwordResetSuccess || 'Password reset successfully'}
            </CardTitle>
            <CardDescription>
              You can now log in with your new password
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t.auth?.resetPassword || 'Reset password'}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t.auth?.newPassword || 'New password'}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t.auth?.confirmPassword || 'Confirm password'}</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <LockKey size={20} className="mr-2" />
              {isLoading 
                ? (t.auth?.resetting || 'Resetting...') 
                : (t.auth?.resetPassword || 'Reset password')}
            </Button>

            <Button 
              type="button" 
              onClick={onBack} 
              variant="ghost" 
              className="w-full"
              disabled={isLoading}
            >
              {t.auth?.backToLogin || 'Back to login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
