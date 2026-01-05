import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { calculateNextScheduledDate, shouldSendRecurringEmail } from '@/lib/helpers'
import type { Email, Activity } from '@/lib/types'

export default function ScheduledEmailsManager() {
  const [emails, setEmails] = useKV<Email[]>('emails', [])
  const [activities, setActivities] = useKV<Activity[]>('activities', [])

  useEffect(() => {
    const checkScheduledEmails = async () => {
      const now = new Date()
      const safeEmails = emails || []

      for (const email of safeEmails) {
        if (email.status === 'scheduled' && email.scheduledAt) {
          const scheduledTime = new Date(email.scheduledAt)

          if (scheduledTime <= now) {
            await sendScheduledEmail(email)
          }
        }
      }
    }

    const sendScheduledEmail = async (email: Email) => {
      const now = new Date().toISOString()

      if (email.recurrence && email.recurrence.pattern !== 'none') {
        const occurrenceCount = (email.recurrence.occurrenceCount || 0) + 1
        const shouldContinue = shouldSendRecurringEmail(email.recurrence, occurrenceCount)

        const sentEmail: Email = {
          ...email,
          id: crypto.randomUUID(),
          status: 'sent',
          sentAt: now,
          updatedAt: now,
          recurrence: {
            ...email.recurrence,
            occurrenceCount,
            parentEmailId: email.id
          }
        }

        await setEmails((current) => {
          const updated = [...(current || [])]
          const emailIndex = updated.findIndex(e => e.id === email.id)
          
          updated.push(sentEmail)

          if (shouldContinue && email.scheduledAt) {
            const nextScheduledAt = calculateNextScheduledDate(
              email.scheduledAt,
              email.recurrence!.pattern,
              email.recurrence!.interval
            ).toISOString()

            updated[emailIndex] = {
              ...email,
              recurrence: {
                ...email.recurrence!,
                occurrenceCount,
                nextScheduledAt
              },
              scheduledAt: nextScheduledAt,
              updatedAt: now
            }
          } else {
            updated.splice(emailIndex, 1)
          }

          return updated
        })

        const activity: Activity = {
          id: crypto.randomUUID(),
          type: 'email-sent',
          contactId: email.contactId,
          dealId: email.dealId,
          subject: `Gjentakende e-post sendt: ${email.subject}`,
          notes: email.body.substring(0, 200) + (email.body.length > 200 ? '...' : ''),
          createdBy: 'System',
          createdAt: now,
          metadata: {
            emailId: sentEmail.id,
            recurring: true,
            occurrenceCount
          }
        }

        await setActivities((current) => [...(current || []), activity])

        if (shouldContinue) {
          toast.success(`📧 Gjentakende e-post sendt: ${email.subject}`)
        } else {
          toast.info(`✅ Siste gjentakende e-post sendt: ${email.subject}`)
        }

        if (email.trackingEnabled) {
          simulateEmailTracking(sentEmail.id)
        }
      } else {
        await setEmails((current) => {
          return (current || []).map(e =>
            e.id === email.id
              ? {
                  ...e,
                  status: 'sent' as const,
                  sentAt: now,
                  updatedAt: now
                }
              : e
          )
        })

        const activity: Activity = {
          id: crypto.randomUUID(),
          type: 'email-sent',
          contactId: email.contactId,
          dealId: email.dealId,
          subject: `Planlagt e-post sendt: ${email.subject}`,
          notes: email.body.substring(0, 200) + (email.body.length > 200 ? '...' : ''),
          createdBy: 'System',
          createdAt: now,
          metadata: {
            emailId: email.id,
            scheduled: true
          }
        }

        await setActivities((current) => [...(current || []), activity])

        toast.success(`📧 Planlagt e-post sendt: ${email.subject}`)

        if (email.trackingEnabled) {
          simulateEmailTracking(email.id)
        }
      }
    }

    const simulateEmailTracking = async (emailId: string) => {
      setTimeout(async () => {
        await setEmails((current) => {
          return (current || []).map(email =>
            email.id === emailId
              ? {
                  ...email,
                  status: 'opened' as const,
                  openedAt: new Date().toISOString(),
                  openCount: email.openCount + 1,
                  updatedAt: new Date().toISOString()
                }
              : email
          )
        })
      }, 8000)
    }

    const interval = setInterval(checkScheduledEmails, 30000)
    checkScheduledEmails()

    return () => clearInterval(interval)
  }, [emails, setEmails, activities, setActivities])

  return null
}
