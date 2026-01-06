import { useState, useEffect } from 'react'
import { EnvelopeSimple, CheckCircle } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import type { TeamMember } from '@/lib/types'

interface EmailVerificationProps {
  token: string
  onSuccess: () => void
}

export default function EmailVerification({ token, onSuccess }: EmailVerificationProps) {
  const { t } = useLanguage()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('team-members', [])

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const member = (teamMembers || []).find(
          m => m.emailVerificationToken === token && 
          m.emailVerificationExpires && 
          new Date(m.emailVerificationExpires) > new Date()
        )

        if (member) {
          const updatedMembers = (teamMembers || []).map(m =>
            m.id === member.id
              ? { 
                  ...m, 
                  emailVerified: true,
                  emailVerificationToken: undefined, 
                  emailVerificationExpires: undefined,
                }
              : m
          )

          setTeamMembers(updatedMembers)
          setIsValid(true)
          toast.success(t.auth?.verificationSuccess || 'Email verified successfully')
          
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else {
          setIsValid(false)
          toast.error(t.auth?.invalidVerificationToken || 'Invalid or expired verification link')
        }
      } catch (error) {
        setIsValid(false)
        toast.error(t.auth?.verificationError || 'Could not verify email')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token, teamMembers, setTeamMembers, t, onSuccess])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {t.auth?.verifying || 'Verifying...'}
            </CardTitle>
            <CardDescription>
              Please wait while we verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-destructive">
              {t.auth?.invalidVerificationToken || 'Invalid or expired verification link'}
            </CardTitle>
            <CardDescription>
              The email verification link is no longer valid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onSuccess} className="w-full">
              {t.auth?.backToLogin || 'Back to login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-accent" weight="fill" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t.auth?.verificationSuccess || 'Email verified successfully'}
          </CardTitle>
          <CardDescription>
            Your email address has been verified. You can now access all features.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
