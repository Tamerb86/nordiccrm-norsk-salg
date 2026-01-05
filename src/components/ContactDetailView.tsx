import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  X, 
  User, 
  Phone, 
  EnvelopeSimple,
  Buildings,
  Tag,
  ClockCounterClockwise,
  Target,
  Plus
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { norwegianTranslations as t, statusLabels } from '@/lib/norwegian'
import { 
  formatDate, 
  formatRelativeDate, 
  getFullName, 
  getInitials,
  getStatusColor,
  formatCurrency
} from '@/lib/helpers'
import type { Contact, Deal } from '@/lib/types'
import ActivityTimeline from '@/components/ActivityTimeline'
import ActivityLogger from '@/components/ActivityLogger'
import { cn } from '@/lib/utils'

interface ContactDetailViewProps {
  contactId: string | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export default function ContactDetailView({ contactId, isOpen, onClose, onUpdate }: ContactDetailViewProps) {
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [deals] = useKV<Deal[]>('deals', [])

  const safeContacts = contacts || []
  const safeDeals = deals || []

  const contact = safeContacts.find(c => c.id === contactId)

  const contactDeals = safeDeals
    .filter(d => d.contactId === contactId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const openDeals = contactDeals.filter(d => !d.actualCloseDate)
  const totalDealValue = contactDeals.reduce((sum, d) => sum + d.value, 0)

  if (!contact) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b">
          <DialogHeader className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-2xl flex-shrink-0">
                  {getInitials(contact.firstName, contact.lastName)}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold mb-1">
                    {getFullName(contact.firstName, contact.lastName)}
                  </DialogTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(contact.status)}>
                      {statusLabels[contact.status]}
                    </Badge>
                    {contact.company && (
                      <Badge variant="outline">
                        <Buildings size={14} className="mr-1" />
                        {contact.company}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} weight="duotone" />
                    Kontaktinformasjon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contact.email && (
                    <div className="flex items-start gap-3">
                      <EnvelopeSimple size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" weight="duotone" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">E-post</div>
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" weight="duotone" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Telefon</div>
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-sm text-primary hover:underline font-mono"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.company && (
                    <div className="flex items-start gap-3">
                      <Buildings size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" weight="duotone" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Selskap</div>
                        <p className="text-sm">{contact.company}</p>
                      </div>
                    </div>
                  )}

                  {contact.source && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Kilde</div>
                        <p className="text-sm">{contact.source}</p>
                      </div>
                    </>
                  )}

                  {contact.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Tag size={14} />
                          Tagger
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {contact.notes && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Notater</div>
                        <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {contactDeals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target size={20} weight="duotone" />
                      Avtaler ({contactDeals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Åpne avtaler</div>
                        <div className="text-lg font-bold">{openDeals.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Total verdi</div>
                        <div className="text-lg font-bold font-mono">{formatCurrency(totalDealValue)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {contactDeals.slice(0, 5).map((deal) => (
                        <div
                          key={deal.id}
                          className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{deal.title}</h4>
                            <span className="text-sm font-mono whitespace-nowrap">
                              {formatCurrency(deal.value)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(deal.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Opprettet</span>
                    <span className="font-medium">{formatDate(contact.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sist oppdatert</span>
                    <span className="font-medium">{formatRelativeDate(contact.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {contactId && contactDeals.length > 0 && contactDeals[0] && (
                <ActivityLogger 
                  dealId={contactDeals[0].id} 
                  contactId={contactId} 
                />
              )}
              
              {contactId && (
                <ActivityTimeline 
                  contactId={contactId} 
                  showFilters={true}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
