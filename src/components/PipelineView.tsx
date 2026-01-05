import { useState, DragEvent, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, Eye, EyeSlash, FunnelSimple, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { norwegianTranslations as t, defaultPipelineStages } from '@/lib/norwegian'
import { generateId, formatCurrency, getFullName } from '@/lib/helpers'
import { cn } from '@/lib/utils'
import type { Deal, Contact, PipelineStage } from '@/lib/types'
import DealDetailView from '@/components/DealDetailView'

interface DealFilters {
  minValue: string
  maxValue: string
  startDate: string
  endDate: string
  contactId: string
  searchText: string
}

export default function PipelineView() {
  const [deals, setDeals] = useKV<Deal[]>('deals', [])
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [stages] = useKV<PipelineStage[]>('pipeline-stages', defaultPipelineStages)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string>('')
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [showClosedDeals, setShowClosedDeals] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const [filters, setFilters] = useState<DealFilters>({
    minValue: '',
    maxValue: '',
    startDate: '',
    endDate: '',
    contactId: '',
    searchText: '',
  })

  const safeDeals = deals || []
  const safeContacts = contacts || []
  const safeStages = stages || defaultPipelineStages

  const activePipelineStages = safeStages.filter(s => s.id !== 'won' && s.id !== 'lost')
  const closedStages = safeStages.filter(s => s.id === 'won' || s.id === 'lost')
  
  const openDeals = safeDeals.filter(d => !d.actualCloseDate)
  const closedDeals = safeDeals.filter(d => d.actualCloseDate)

  const getContactName = (contactId: string): string => {
    const contact = safeContacts.find(c => c.id === contactId)
    return contact ? getFullName(contact.firstName, contact.lastName) : 'Ukjent kontakt'
  }
  
  const filteredDeals = useMemo(() => {
    let filtered = safeDeals

    if (filters.minValue) {
      const min = parseFloat(filters.minValue)
      filtered = filtered.filter(d => d.value >= min)
    }

    if (filters.maxValue) {
      const max = parseFloat(filters.maxValue)
      filtered = filtered.filter(d => d.value <= max)
    }

    if (filters.startDate) {
      filtered = filtered.filter(d => {
        const dealDate = d.expectedCloseDate || d.createdAt
        return dealDate >= filters.startDate
      })
    }

    if (filters.endDate) {
      filtered = filtered.filter(d => {
        const dealDate = d.expectedCloseDate || d.createdAt
        return dealDate <= filters.endDate
      })
    }

    if (filters.contactId) {
      filtered = filtered.filter(d => d.contactId === filters.contactId)
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase()
      filtered = filtered.filter(d => {
        const contactName = getContactName(d.contactId).toLowerCase()
        return d.title.toLowerCase().includes(search) || 
               contactName.includes(search) ||
               (d.description?.toLowerCase().includes(search))
      })
    }

    return filtered
  }, [safeDeals, safeContacts, filters])

  const filteredOpenDeals = filteredDeals.filter(d => !d.actualCloseDate)
  const filteredClosedDeals = filteredDeals.filter(d => d.actualCloseDate)
  
  const displayStages = showClosedDeals 
    ? [...activePipelineStages, ...closedStages]
    : activePipelineStages

  const activeFilterCount = [
    filters.minValue,
    filters.maxValue,
    filters.startDate,
    filters.endDate,
    filters.contactId,
    filters.searchText,
  ].filter(Boolean).length

  const clearFilters = () => {
    setFilters({
      minValue: '',
      maxValue: '',
      startDate: '',
      endDate: '',
      contactId: '',
      searchText: '',
    })
    toast.success('Filtre fjernet')
  }

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
    const oldStage = safeDeals.find(d => d.id === dealId)?.stage
    
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
    
    const oldStageName = safeStages.find(s => s.id === oldStage)?.name || ''
    const newStageName = safeStages.find(s => s.id === newStage)?.name || ''
    toast.success(`Avtale flyttet fra ${oldStageName} til ${newStageName}`)
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, dealId: string) => {
    setDraggedDeal(dealId)
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.style.opacity = '0.5'
    
    e.currentTarget.setAttribute('data-dragging', 'true')
  }

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    setDraggedDeal(null)
    setDragOverStage(null)
    e.currentTarget.style.opacity = '1'
    
    setTimeout(() => {
      e.currentTarget.removeAttribute('data-dragging')
    }, 100)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (stageId: string) => {
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStageId: string) => {
    e.preventDefault()
    setDragOverStage(null)
    
    if (!draggedDeal) return

    const deal = safeDeals.find(d => d.id === draggedDeal)
    if (!deal || deal.stage === targetStageId) {
      setDraggedDeal(null)
      return
    }

    handleStageChange(draggedDeal, targetStageId)
    setDraggedDeal(null)
  }

  const openNewDealDialog = (stageId: string) => {
    setSelectedStage(stageId)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.pipeline.title}</h2>
          <p className="text-muted-foreground mt-1">
            {filteredOpenDeals.length} {t.deal.open.toLowerCase()}
            {filteredClosedDeals.length > 0 && ` • ${filteredClosedDeals.length} lukket`}
            {activeFilterCount > 0 && ` • ${activeFilterCount} filter aktiv`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <FunnelSimple size={20} weight={showFilters ? 'fill' : 'regular'} />
              Filtrer
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Switch
              id="show-closed"
              checked={showClosedDeals}
              onCheckedChange={setShowClosedDeals}
            />
            <Label 
              htmlFor="show-closed" 
              className="cursor-pointer text-sm font-medium flex items-center gap-2"
            >
              {showClosedDeals ? (
                <Eye size={18} weight="duotone" />
              ) : (
                <EyeSlash size={18} weight="duotone" />
              )}
              Vis lukkede
            </Label>
          </motion.div>
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
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FunnelSimple size={20} weight="duotone" />
                    Filtreringsalternativer
                  </h3>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={16} />
                      Fjern alle filtre
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-text">Søk etter navn eller beskrivelse</Label>
                    <Input
                      id="search-text"
                      placeholder="Søk..."
                      value={filters.searchText}
                      onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-filter">Filtrer etter kontakt</Label>
                    <Select 
                      value={filters.contactId} 
                      onValueChange={(value) => setFilters({ ...filters, contactId: value })}
                    >
                      <SelectTrigger id="contact-filter">
                        <SelectValue placeholder="Alle kontakter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle kontakter</SelectItem>
                        {safeContacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {getFullName(contact.firstName, contact.lastName)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-value">Min verdi (NOK)</Label>
                    <Input
                      id="min-value"
                      type="number"
                      placeholder="0"
                      value={filters.minValue}
                      onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-value">Maks verdi (NOK)</Label>
                    <Input
                      id="max-value"
                      type="number"
                      placeholder="Ingen grense"
                      value={filters.maxValue}
                      onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-date">Fra dato</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">Til dato</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex flex-wrap gap-2"
                  >
                    {filters.searchText && (
                      <Badge variant="secondary" className="gap-1">
                        Søk: {filters.searchText}
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-destructive" 
                          onClick={() => setFilters({ ...filters, searchText: '' })}
                        />
                      </Badge>
                    )}
                    {filters.contactId && (
                      <Badge variant="secondary" className="gap-1">
                        Kontakt: {getContactName(filters.contactId)}
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-destructive" 
                          onClick={() => setFilters({ ...filters, contactId: '' })}
                        />
                      </Badge>
                    )}
                    {filters.minValue && (
                      <Badge variant="secondary" className="gap-1">
                        Min: {formatCurrency(parseFloat(filters.minValue))}
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-destructive" 
                          onClick={() => setFilters({ ...filters, minValue: '' })}
                        />
                      </Badge>
                    )}
                    {filters.maxValue && (
                      <Badge variant="secondary" className="gap-1">
                        Maks: {formatCurrency(parseFloat(filters.maxValue))}
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-destructive" 
                          onClick={() => setFilters({ ...filters, maxValue: '' })}
                        />
                      </Badge>
                    )}
                    {filters.startDate && (
                      <Badge variant="secondary" className="gap-1">
                        Fra: {new Date(filters.startDate).toLocaleDateString('nb-NO')}
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-destructive" 
                          onClick={() => setFilters({ ...filters, startDate: '' })}
                        />
                      </Badge>
                    )}
                    {filters.endDate && (
                      <Badge variant="secondary" className="gap-1">
                        Til: {new Date(filters.endDate).toLocaleDateString('nb-NO')}
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-destructive" 
                          onClick={() => setFilters({ ...filters, endDate: '' })}
                        />
                      </Badge>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredOpenDeals.length === 0 && activeFilterCount === 0 && (
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

      {filteredOpenDeals.length === 0 && activeFilterCount > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-dashed">
          <CardContent className="py-12 text-center">
            <FunnelSimple size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">Ingen avtaler matcher filtrene</h3>
            <p className="text-muted-foreground mb-4">
              Prøv å endre eller fjerne noen filtreringsalternativer
            </p>
            <Button variant="outline" onClick={clearFilters}>
              <X size={20} />
              Fjern alle filtre
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {displayStages.map((stage) => {
            const isClosedStage = stage.id === 'won' || stage.id === 'lost'
            const stageDeals = isClosedStage 
              ? filteredClosedDeals.filter(d => d.stage === stage.id)
              : filteredOpenDeals.filter(d => d.stage === stage.id)
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
            const isDropTarget = dragOverStage === stage.id
            
            return (
              <motion.div 
                key={stage.id} 
                className={cn(
                  "space-y-3 p-3 rounded-lg transition-all",
                  isDropTarget && "bg-accent/20 ring-2 ring-accent"
                )}
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  scale: isDropTarget ? 1.02 : 1,
                  x: 0,
                  backgroundColor: isDropTarget ? 'oklch(0.65 0.15 160 / 0.1)' : 'transparent'
                }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  opacity: { duration: 0.3 }
                }}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>{stage.name}</span>
                      <motion.span 
                        key={`count-${stage.id}-${stageDeals.length}`}
                        initial={{ scale: 1.5, color: 'oklch(0.65 0.15 160)' }}
                        animate={{ scale: 1, color: 'oklch(0.556 0 0)' }}
                        transition={{ duration: 0.3 }}
                        className="text-xs font-mono text-muted-foreground"
                      >
                        {stageDeals.length}
                      </motion.span>
                    </CardTitle>
                    <motion.p 
                      key={`value-${stage.id}-${stageValue}`}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-muted-foreground font-mono"
                    >
                      {formatCurrency(stageValue)}
                    </motion.p>
                  </CardHeader>
                </Card>
              </motion.div>

              <div className="space-y-2 min-h-[100px]">
                <AnimatePresence mode="popLayout">
                  {stageDeals.map((deal) => (
                    <motion.div
                      key={deal.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ 
                        opacity: draggedDeal === deal.id ? 0.5 : 1, 
                        scale: 1, 
                        y: 0 
                      }}
                      exit={{ opacity: 0, scale: 0.8, x: 100 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        opacity: { duration: 0.2 }
                      }}
                    >
                      <Card 
                        className={cn(
                          "hover:shadow-md transition-shadow cursor-pointer",
                          !isClosedStage && "active:cursor-grabbing",
                          draggedDeal === deal.id && "shadow-lg",
                          isClosedStage && "opacity-80"
                        )}
                        draggable={!isClosedStage}
                        onDragStart={(e) => !isClosedStage && handleDragStart(e, deal.id)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                          const target = e.currentTarget
                          if (!target.hasAttribute('data-dragging')) {
                            setSelectedDealId(deal.id)
                          }
                        }}
                      >
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
                          {!isClosedStage && (
                            <div onClick={(e) => e.stopPropagation()}>
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
                            </div>
                          )}
                          {isClosedStage && deal.actualCloseDate && (
                            <p className="text-xs text-muted-foreground">
                              Lukket: {new Date(deal.actualCloseDate).toLocaleDateString('nb-NO')}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {!isClosedStage && (
                  <motion.div
                    animate={{
                      scale: isDropTarget ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: isDropTarget ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openNewDealDialog(stage.id)}
                    >
                      <Plus size={16} />
                      Ny avtale
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
        </AnimatePresence>
      </div>

      <DealDetailView
        dealId={selectedDealId}
        isOpen={selectedDealId !== null}
        onClose={() => setSelectedDealId(null)}
        onUpdate={() => {
          // Refresh is automatic due to useKV reactivity
        }}
      />
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
