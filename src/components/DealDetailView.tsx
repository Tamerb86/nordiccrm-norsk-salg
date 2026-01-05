import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  X, 
  Pencil, 
  Trash, 
  Calendar, 
  CurrencyCircleDollar, 
  Percent, 
  User, 
  Phone, 
  EnvelopeSimple,
  Buildings,
  Target,
  ClockCounterClockwise,
  ChatCircleText,
  CheckCircle,
  XCircle,
  TrendUp,
  ArrowRight
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { norwegianTranslations as t, activityTypeLabels } from '@/lib/norwegian'
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime,
  formatRelativeDate, 
  getFullName, 
  getInitials 
} from '@/lib/helpers'
import type { Deal, Contact, PipelineStage, Activity, Task } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DealDetailViewProps {
  dealId: string | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export default function DealDetailView({ dealId, isOpen, onClose, onUpdate }: DealDetailViewProps) {
  const [deals, setDeals] = useKV<Deal[]>('deals', [])
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [stages] = useKV<PipelineStage[]>('pipeline-stages', [])
  const [activities] = useKV<Activity[]>('activities', [])
  const [tasks] = useKV<Task[]>('tasks', [])
  const [isEditing, setIsEditing] = useState(false)

  const safeDeals = deals || []
  const safeContacts = contacts || []
  const safeStages = stages || []
  const safeActivities = activities || []
  const safeTasks = tasks || []

  const deal = safeDeals.find(d => d.id === dealId)
  const contact = deal ? safeContacts.find(c => c.id === deal.contactId) : null
  const stage = deal ? safeStages.find(s => s.id === deal.stage) : null

  const dealActivities = safeActivities
    .filter(a => a.dealId === dealId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const dealTasks = safeTasks
    .filter(t => t.dealId === dealId)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  const handleDelete = () => {
    if (!deal) return
    if (window.confirm(`Er du sikker på at du vil slette "${deal.title}"?`)) {
      setDeals((current) => (current || []).filter(d => d.id !== dealId))
      toast.success('Avtale slettet')
      onClose()
      onUpdate?.()
    }
  }

  const handleSave = (updatedDeal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!deal) return
    
    const isClosing = 
      (updatedDeal.stage === 'won' || updatedDeal.stage === 'lost') && 
      deal.stage !== 'won' && 
      deal.stage !== 'lost'
    
    setDeals((current) =>
      (current || []).map((d) =>
        d.id === dealId
          ? {
              ...d,
              ...updatedDeal,
              actualCloseDate: isClosing ? new Date().toISOString() : d.actualCloseDate,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    )
    
    toast.success('Avtale oppdatert')
    setIsEditing(false)
    onUpdate?.()
  }

  if (!deal || !contact) {
    return null
  }

  const isClosedDeal = deal.stage === 'won' || deal.stage === 'lost'
  const probabilityWeightedValue = (deal.value * deal.probability) / 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b">
          <DialogHeader className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-1">{deal.title}</DialogTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  {stage && (
                    <Badge 
                      className="font-medium"
                      style={{ 
                        backgroundColor: stage.color,
                        color: 'white'
                      }}
                    >
                      {stage.name}
                    </Badge>
                  )}
                  {isClosedDeal && deal.actualCloseDate && (
                    <Badge variant="outline" className="gap-1">
                      {deal.stage === 'won' ? (
                        <CheckCircle size={14} weight="fill" className="text-accent" />
                      ) : (
                        <XCircle size={14} weight="fill" className="text-destructive" />
                      )}
                      Lukket {formatDate(deal.actualCloseDate)}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Opprettet {formatDate(deal.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isClosedDeal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil size={16} />
                    Rediger
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CurrencyCircleDollar size={20} weight="duotone" />
                    Avtaleinformasjon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Verdi</div>
                      <div className="text-2xl font-bold font-mono">
                        {formatCurrency(deal.value)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Sannsynlighet</div>
                      <div className="text-2xl font-bold font-mono flex items-center gap-2">
                        {deal.probability}%
                        <Percent size={20} className="text-muted-foreground" weight="duotone" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendUp size={16} weight="duotone" />
                      Vektet verdi
                    </div>
                    <div className="text-xl font-bold font-mono text-accent">
                      {formatCurrency(probabilityWeightedValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Beregnet som: {formatCurrency(deal.value)} × {deal.probability}%
                    </p>
                  </div>

                  {deal.expectedCloseDate && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar size={16} weight="duotone" />
                          Forventet lukkedato
                        </div>
                        <div className="text-base font-semibold">
                          {formatDate(deal.expectedCloseDate)}
                        </div>
                      </div>
                    </>
                  )}

                  {deal.description && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <ChatCircleText size={16} weight="duotone" />
                          Beskrivelse
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{deal.description}</p>
                      </div>
                    </>
                  )}

                  {deal.lostReason && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-sm text-destructive flex items-center gap-2">
                          <XCircle size={16} weight="duotone" />
                          Årsak til tap
                        </div>
                        <p className="text-sm">{deal.lostReason}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {dealActivities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClockCounterClockwise size={20} weight="duotone" />
                      Nylig aktivitet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dealActivities.map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3 pb-3 border-b last:border-0 last:pb-0"
                        >
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activityTypeLabels[activity.type]}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.subject}</p>
                            {activity.notes && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {activity.notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeDate(activity.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {dealTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target size={20} weight="duotone" />
                      Tilknyttede oppgaver ({dealTasks.filter(t => !t.completed).length} aktive)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dealTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            task.completed && "opacity-60"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            task.completed && "bg-accent border-accent"
                          )}>
                            {task.completed && <CheckCircle size={14} weight="fill" className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              task.completed && "line-through"
                            )}>
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(task.dueDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} weight="duotone" />
                    Kontaktinformasjon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg flex-shrink-0">
                      {getInitials(contact.firstName, contact.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight">
                        {getFullName(contact.firstName, contact.lastName)}
                      </h3>
                      {contact.company && (
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

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

                  {contact.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Tagger</div>
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
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Opprettet</span>
                    <span className="font-medium">{formatDate(deal.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sist oppdatert</span>
                    <span className="font-medium">{formatRelativeDate(deal.updatedAt)}</span>
                  </div>
                  {deal.actualCloseDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lukkedato</span>
                      <span className="font-medium">{formatDate(deal.actualCloseDate)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {isEditing && (
          <EditDealDialog
            deal={deal}
            contacts={safeContacts}
            stages={safeStages}
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            onSave={handleSave}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface EditDealDialogProps {
  deal: Deal
  contacts: Contact[]
  stages: PipelineStage[]
  isOpen: boolean
  onClose: () => void
  onSave: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void
}

function EditDealDialog({ deal, contacts, stages, isOpen, onClose, onSave }: EditDealDialogProps) {
  const [formData, setFormData] = useState({
    title: deal.title,
    contactId: deal.contactId,
    stage: deal.stage,
    value: deal.value,
    probability: deal.probability,
    expectedCloseDate: deal.expectedCloseDate || '',
    description: deal.description || '',
    assignedTo: deal.assignedTo || '',
    actualCloseDate: deal.actualCloseDate,
    lostReason: deal.lostReason || '',
  })

  useEffect(() => {
    setFormData({
      title: deal.title,
      contactId: deal.contactId,
      stage: deal.stage,
      value: deal.value,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate || '',
      description: deal.description || '',
      assignedTo: deal.assignedTo || '',
      actualCloseDate: deal.actualCloseDate,
      lostReason: deal.lostReason || '',
    })
  }, [deal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleStageChange = (newStage: string) => {
    const stage = stages.find(s => s.id === newStage)
    setFormData({
      ...formData,
      stage: newStage,
      probability: stage?.probability || formData.probability,
    })
  }

  const isLostStage = formData.stage === 'lost'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil size={20} weight="duotone" />
            Rediger avtale
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t.deal.dealTitle} *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-contactId">Kontakt *</Label>
            <Select 
              value={formData.contactId} 
              onValueChange={(value) => setFormData({ ...formData, contactId: value })}
            >
              <SelectTrigger id="edit-contactId">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {getFullName(contact.firstName, contact.lastName)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-value">{t.deal.value} *</Label>
              <Input
                id="edit-value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-probability">{t.deal.probability} (%)</Label>
              <Input
                id="edit-probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-stage">{t.deal.stage}</Label>
            <Select value={formData.stage} onValueChange={handleStageChange}>
              <SelectTrigger id="edit-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLostStage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="edit-lostReason">Årsak til tap</Label>
              <Textarea
                id="edit-lostReason"
                value={formData.lostReason}
                onChange={(e) => setFormData({ ...formData, lostReason: e.target.value })}
                placeholder="Beskriv hvorfor avtalen ble tapt..."
                rows={3}
              />
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-expectedCloseDate">{t.deal.expectedCloseDate}</Label>
            <Input
              id="edit-expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{t.deal.description}</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button type="submit">
              {t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
