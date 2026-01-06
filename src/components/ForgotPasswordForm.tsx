import { useState } from 'react'
import { EnvelopeSimple, ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import type { TeamMember } from '@/lib/types'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('team-members', [])

  const generateResetToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error(t.auth?.fillAllFields || 'Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const member = (teamMembers || []).find(
        m => m.email.toLowerCase() === email.toLowerCase()
      )

      if (member) {
        const resetToken = generateResetToken()
        const resetExpires = new Date(Date.now() + 3600000).toISOString()

        const updatedMembers = (teamMembers || []).map(m =>
          m.id === member.id
            ? { ...m, passwordResetToken: resetToken, passwordResetExpires: resetExpires }
            : m
        )

        setTeamMembers(updatedMembers)

        const resetUrl = `${window.location.origin}?reset=${resetToken}`
        console.log('Password reset link:', resetUrl)
      }

      setLinkSent(true)
      toast.success(t.auth?.resetLinkSent || 'Reset link sent to your email')
    } catch (error) {
      toast.error(t.auth?.loginError || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (linkSent) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-accent" weight="fill" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t.auth?.resetLinkSent || 'Reset link sent'}
            </CardTitle>
            <CardDescription>
              {t.auth?.resetLinkSentDescription || 'Check your email for instructions on how to reset your password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} variant="outline" className="w-full">
              <ArrowLeft size={20} className="mr-2" />
              {t.auth?.backToLogin || 'Back to login'}
            </Button>
            
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Demo Mode:</strong> Password reset link logged to console
              </p>
            </div>
          </CardContent>
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
            {t.auth?.resetPasswordDescription || 'Enter your email address and we\'ll send you a reset link'}
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
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <EnvelopeSimple size={20} className="mr-2" />
              {isLoading 
                ? (t.common?.loading || 'Loading...') 
                : (t.auth?.sendResetLink || 'Send reset link')}
            </Button>

            <Button 
              type="button" 
              onClick={onBack} 
              variant="ghost" 
              className="w-full"
              disabled={isLoading}
            >
              <ArrowLeft size={20} className="mr-2" />
              {t.auth?.backToLogin || 'Back to login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
