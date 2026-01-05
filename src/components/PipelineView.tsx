import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { norwegianTranslations as t, defaultPipelineStages } from '@/lib/norwegian'
import { generateId, formatCurrency, getFullName } from '@/lib/helpers'
import type { Deal, Contact, PipelineStage } from '@/lib/types'

export default function PipelineView() {
  const [deals, setDeals] = useKV<Deal[]>('deals', [])
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [stages] = useKV<PipelineStage[]>('pipeline-stages', defaultPipelineStages)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string>('')

  const safeDeals = deals || []
  const safeContacts = contacts || []
  const safeStages = stages || defaultPipelineStages

  const activePipelineStages = safeStages.filter(s => s.id !== 'won' && s.id !== 'lost')
  const openDeals = safeDeals.filter(d => !d.actualCloseDate)

  const handleSaveDeal = (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDeal: Deal = {
      ...deal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setDeals((current) => [...(current || []), newDeal])
    toast.success('Avtale opprettet')
    setIsDialogOpen(false)
  }

  const handleStageChange = (dealId: string, newStage: string) => {
    setDeals((current) =>
      (current || []).map((d) =>
        d.id === dealId
          ? { 
              ...d, 
              stage: newStage, 
              updatedAt: new Date().toISOString(),
              probability: safeStages.find(s => s.id === newStage)?.probability || d.probability
            }
          : d
      )
    )
    toast.success('Avtale flyttet')
  }

  const getContactName = (contactId: string): string => {
    const contact = safeContacts.find(c => c.id === contactId)
    return contact ? getFullName(contact.firstName, contact.lastName) : 'Ukjent kontakt'
  }

  const openNewDealDialog = (stageId: string) => {
    setSelectedStage(stageId)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.pipeline.title}</h2>
          <p className="text-muted-foreground mt-1">
            {openDeals.length} {t.deal.open.toLowerCase()}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openNewDealDialog(activePipelineStages[0]?.id || '')} size="lg">
              <Plus size={20} weight="bold" />
              {t.deal.addNew}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.deal.addNew}</DialogTitle>
            </DialogHeader>
            <DealForm
              contacts={safeContacts}
              stages={safeStages}
              initialStage={selectedStage}
              onSave={handleSaveDeal}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {openDeals.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-dashed">
          <CardContent className="py-12 text-center">
            <Plus size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">Ingen avtaler enda</h3>
            <p className="text-muted-foreground mb-4">
              Begynn med å legge til din første avtale
            </p>
            <Button onClick={() => openNewDealDialog(activePipelineStages[0]?.id || '')}>
              <Plus size={20} weight="bold" />
              {t.deal.addNew}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {activePipelineStages.map((stage) => {
          const stageDeals = openDeals.filter(d => d.stage === stage.id)
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
          
          return (
            <div key={stage.id} className="space-y-3">
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>{stage.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {stageDeals.length}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatCurrency(stageValue)}
                  </p>
                </CardHeader>
              </Card>

              <div className="space-y-2">
                {stageDeals.map((deal) => (
                  <Card key={deal.id} className="hover:shadow-md transition-all cursor-move">
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-semibold text-sm">{deal.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {getContactName(deal.contactId)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold">
                          {formatCurrency(deal.value)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {deal.probability}%
                        </span>
                      </div>
                      <Select
                        value={deal.stage}
                        onValueChange={(value) => handleStageChange(deal.id, value)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {safeStages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openNewDealDialog(stage.id)}
                >
                  <Plus size={16} />
                  Ny avtale
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface DealFormProps {
  contacts: Contact[]
  stages: PipelineStage[]
  initialStage: string
  onSave: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function DealForm({ contacts, stages, initialStage, onSave, onCancel }: DealFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    contactId: '',
    stage: initialStage || stages[0]?.id || '',
    value: 0,
    probability: stages.find(s => s.id === initialStage)?.probability || 20,
    expectedCloseDate: '',
    description: '',
    assignedTo: '',
    actualCloseDate: undefined as string | undefined,
    lostReason: undefined as string | undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.contactId) {
      toast.error('Velg en kontakt')
      return
    }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t.deal.dealTitle} *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactId">Kontakt *</Label>
        <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
          <SelectTrigger id="contactId">
            <SelectValue placeholder="Velg kontakt" />
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
          <Label htmlFor="value">{t.deal.value}</Label>
          <Input
            id="value"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="probability">{t.deal.probability} (%)</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stage">{t.deal.stage}</Label>
        <Select value={formData.stage} onValueChange={handleStageChange}>
          <SelectTrigger id="stage">
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

      <div className="space-y-2">
        <Label htmlFor="expectedCloseDate">{t.deal.expectedCloseDate}</Label>
        <Input
          id="expectedCloseDate"
          type="date"
          value={formData.expectedCloseDate}
          onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t.deal.description}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button type="submit">
          {t.common.save}
        </Button>
      </div>
    </form>
  )
}
