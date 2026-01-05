import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  EnvelopeSimple,
  EnvelopeOpen,
  Eye,
  CursorClick,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  MagnifyingGlass
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { norwegianTranslations as t } from '@/lib/norwegian'
import { formatDate, formatRelativeDate, formatDateTime } from '@/lib/helpers'
import type { Email, Contact, EmailStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EmailHistoryProps {
  contactId?: string
  dealId?: string
  limit?: number
}

const statusConfig: Record<EmailStatus, { label: string; icon: any; color: string }> = {
  draft: { label: 'Utkast', icon: EnvelopeSimple, color: 'bg-muted text-muted-foreground' },
  sending: { label: 'Sender...', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Sendt', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  delivered: { label: 'Levert', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  opened: { label: 'Åpnet', icon: EnvelopeOpen, color: 'bg-purple-100 text-purple-700' },
  clicked: { label: 'Klikket', icon: CursorClick, color: 'bg-accent text-accent-foreground' },
  failed: { label: 'Feilet', icon: XCircle, color: 'bg-destructive/20 text-destructive' },
  bounced: { label: 'Returnert', icon: XCircle, color: 'bg-destructive/20 text-destructive' }
}

export default function EmailHistory({ contactId, dealId, limit }: EmailHistoryProps) {
  const [emails] = useKV<Email[]>('emails', [])
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)

  const safeEmails = emails || []
  const safeContacts = contacts || []

  let filteredEmails = safeEmails
    .filter(email => {
      if (contactId && email.contactId !== contactId) return false
      if (dealId && email.dealId !== dealId) return false
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (searchQuery) {
    filteredEmails = filteredEmails.filter(email =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.to.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  if (limit) {
    filteredEmails = filteredEmails.slice(0, limit)
  }

  const selectedEmail = selectedEmailId
    ? safeEmails.find(e => e.id === selectedEmailId)
    : null

  const getContact = (contactId: string) => {
    return safeContacts.find(c => c.id === contactId)
  }

  if (filteredEmails.length === 0 && !searchQuery) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <EnvelopeSimple size={48} className="mx-auto mb-4 text-muted-foreground" weight="thin" />
          <p className="text-muted-foreground">{t.email.noEmails}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Søk i e-poster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredEmails.map((email, index) => {
            const status = statusConfig[email.status]
            const StatusIcon = status.icon
            const contact = getContact(email.contactId)
            const isSelected = selectedEmailId === email.id

            return (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'ring-2 ring-primary'
                  )}
                  onClick={() => setSelectedEmailId(isSelected ? null : email.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg', status.color)}>
                        <StatusIcon size={20} weight="duotone" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{email.subject}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span className="truncate">Til: {email.to}</span>
                              {contact && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{contact.firstName} {contact.lastName}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatRelativeDate(email.sentAt || email.createdAt)}
                          </div>
                          {email.trackingEnabled && (
                            <>
                              {email.openCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <Eye size={14} />
                                  {email.openCount}x åpnet
                                </div>
                              )}
                              {email.clickCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <CursorClick size={14} />
                                  {email.clickCount}x klikket
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <Separator className="my-3" />
                              <div className="space-y-3">
                                <div className="text-sm">
                                  <p className="text-muted-foreground mb-1">Melding:</p>
                                  <p className="whitespace-pre-wrap">{email.body}</p>
                                </div>

                                {email.trackingEnabled && (
                                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg text-sm">
                                    <div>
                                      <p className="text-muted-foreground mb-1">Sendt</p>
                                      <p className="font-medium">
                                        {email.sentAt ? formatDateTime(email.sentAt) : '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground mb-1">Åpnet</p>
                                      <p className="font-medium">
                                        {email.openedAt ? formatDateTime(email.openedAt) : 'Ikke åpnet'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground mb-1">Klikket</p>
                                      <p className="font-medium">
                                        {email.clickedAt ? formatDateTime(email.clickedAt) : 'Ikke klikket'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground mb-1">Status</p>
                                      <Badge className={status.color}>
                                        {status.label}
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                {email.cc && email.cc.length > 0 && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Kopi: </span>
                                    <span>{email.cc.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredEmails.length === 0 && searchQuery && (
          <Card>
            <CardContent className="py-8 text-center">
              <MagnifyingGlass size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">{t.common.noResults}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
