import { useState } from 'react'
import { Warning, EnvelopeSimple } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import type { TeamMember } from '@/lib/types'

interface EmailVerificationBannerProps {
  userId: string
}

export default function EmailVerificationBanner({ userId }: EmailVerificationBannerProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('team-members', [])

  const member = (teamMembers || []).find(m => m.id === userId)

  if (!member || member.emailVerified) {
    return null
  }

  const generateVerificationToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const verificationToken = generateVerificationToken()
      const verificationExpires = new Date(Date.now() + 86400000).toISOString()

      const updatedMembers = (teamMembers || []).map(m =>
        m.id === userId
          ? { ...m, emailVerificationToken: verificationToken, emailVerificationExpires: verificationExpires }
          : m
      )

      setTeamMembers(updatedMembers)

      const verificationUrl = `${window.location.origin}?verify=${verificationToken}`
      console.log('Email verification link:', verificationUrl)

      toast.success(t.auth?.verificationSent || 'Verification email sent')
    } catch (error) {
      toast.error(t.auth?.verificationError || 'Could not send verification email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Alert variant="default" className="mb-6 border-accent bg-accent/5">
      <Warning size={20} className="text-accent" />
      <AlertTitle className="text-accent font-semibold">
        {t.auth?.emailNotVerified || 'Your email is not verified'}
      </AlertTitle>
      <AlertDescription>
        <p className="text-sm text-muted-foreground mb-3">
          {t.auth?.emailNotVerifiedDescription || 'Check your inbox for the verification email'}
        </p>
        <Button
          onClick={handleResendVerification}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <EnvelopeSimple size={16} className="mr-2" />
          {isLoading 
            ? (t.common?.loading || 'Loading...') 
            : (t.auth?.resendVerification || 'Resend verification email')}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
