import { useState } from 'react'
import { 
  EnvelopeSimple, 
  Tag, 
  Trash, 
  ArrowsClockwise, 
  X,
  CheckCircle,
  Warning
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/language-context'
import type { Contact, ContactStatus, Deal } from '@/lib/types'

interface BulkActionsToolbarProps {
  type: 'contacts' | 'deals'
  selectedIds: string[]
  allItems: Contact[] | Deal[]
  onClearSelection: () => void
  onBulkEmail: (ids: string[], subject: string, body: string) => void
  onBulkStatusUpdate: (ids: string[], status: ContactStatus | string) => void
  onBulkTagAssignment: (ids: string[], tags: string[]) => void
  onBulkDelete: (ids: string[]) => void
  stages?: Array<{ id: string; name: string }>
}

export default function BulkActionsToolbar({
  type,
  selectedIds,
  allItems,
  onClearSelection,
  onBulkEmail,
  onBulkStatusUpdate,
  onBulkTagAssignment,
  onBulkDelete,
  stages = []
}: BulkActionsToolbarProps) {
  const { t } = useLanguage()
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ContactStatus | string>('')
  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const selectedCount = selectedIds.length

  const handleBulkEmail = () => {
    if (!emailSubject || !emailBody) {
      toast.error('Fyll ut emne og melding')
      return
    }
    onBulkEmail(selectedIds, emailSubject, emailBody)
    setShowEmailDialog(false)
    setEmailSubject('')
    setEmailBody('')
    toast.success(`E-post sendt til ${selectedCount} ${type === 'contacts' ? 'kontakter' : 'avtaler'}`)
  }

  const handleBulkStatusUpdate = () => {
    if (!selectedStatus) {
      toast.error('Velg en status')
      return
    }
    onBulkStatusUpdate(selectedIds, selectedStatus)
    setShowStatusDialog(false)
    setSelectedStatus('')
    toast.success(`Status oppdatert for ${selectedCount} ${type === 'contacts' ? 'kontakter' : 'avtaler'}`)
  }

  const handleBulkTagAssignment = () => {
    if (selectedTags.length === 0) {
      toast.error('Legg til minst én tag')
      return
    }
    onBulkTagAssignment(selectedIds, selectedTags)
    setShowTagDialog(false)
    setSelectedTags([])
    toast.success(`Tags lagt til ${selectedCount} ${type === 'contacts' ? 'kontakter' : 'avtaler'}`)
  }

  const handleBulkDelete = () => {
    onBulkDelete(selectedIds)
    setShowDeleteDialog(false)
    toast.success(`${selectedCount} ${type === 'contacts' ? 'kontakter' : 'avtaler'} slettet`)
  }

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  if (selectedCount === 0) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-primary text-primary-foreground rounded-xl shadow-2xl border-2 border-primary-foreground/20 p-4 min-w-[600px]">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} weight="duotone" />
                <div>
                  <p className="font-semibold text-sm">
                    {selectedCount} {type === 'contacts' ? 'kontakter' : 'avtaler'} valgt
                  </p>
                  <p className="text-xs opacity-80">Velg en handling nedenfor</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEmailDialog(true)}
                  className="gap-2"
                >
                  <EnvelopeSimple size={16} weight="bold" />
                  Send e-post
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowStatusDialog(true)}
                  className="gap-2"
                >
                  <ArrowsClockwise size={16} weight="bold" />
                  Endre status
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTagDialog(true)}
                  className="gap-2"
                >
                  <Tag size={16} weight="bold" />
                  Legg til tags
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <Trash size={16} weight="bold" />
                  Slett
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="gap-2 hover:bg-primary-foreground/20"
                >
                  <X size={16} weight="bold" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send e-post til {selectedCount} {type === 'contacts' ? 'kontakter' : 'avtaler'}</DialogTitle>
            <DialogDescription>
              E-posten vil bli sendt til alle valgte {type === 'contacts' ? 'kontakter' : 'avtaler'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Emne *</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Skriv inn e-postens emne"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Melding *</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Skriv e-postmeldingen din her..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Avbryt
            </Button>
            <Button onClick={handleBulkEmail}>
              <EnvelopeSimple size={16} weight="bold" />
              Send til {selectedCount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Oppdater status for {selectedCount} {type === 'contacts' ? 'kontakter' : 'avtaler'}
            </DialogTitle>
            <DialogDescription>
              Velg ny status som skal brukes for alle valgte elementer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-status">Ny status *</Label>
              {type === 'contacts' ? (
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="bulk-status">
                    <SelectValue placeholder="Velg status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">{t.status.lead}</SelectItem>
                    <SelectItem value="prospect">{t.status.prospect}</SelectItem>
                    <SelectItem value="customer">{t.status.customer}</SelectItem>
                    <SelectItem value="lost">{t.status.lost}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="bulk-status">
                    <SelectValue placeholder="Velg fase" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Avbryt
            </Button>
            <Button onClick={handleBulkStatusUpdate}>
              <ArrowsClockwise size={16} weight="bold" />
              Oppdater {selectedCount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Legg til tags til {selectedCount} {type === 'contacts' ? 'kontakter' : 'avtaler'}
            </DialogTitle>
            <DialogDescription>
              Tags vil bli lagt til i tillegg til eksisterende tags
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-input">Legg til tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Skriv inn tag og trykk Enter"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Tag size={16} />
                </Button>
              </div>
            </div>
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <Label>Valgte tags ({selectedTags.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} <X size={12} className="ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Avbryt
            </Button>
            <Button onClick={handleBulkTagAssignment} disabled={selectedTags.length === 0}>
              <Tag size={16} weight="bold" />
              Legg til tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Warning size={24} weight="duotone" />
              Bekreft sletting
            </DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette {selectedCount} {type === 'contacts' ? 'kontakter' : 'avtaler'}?
              Denne handlingen kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash size={16} weight="bold" />
              Slett {selectedCount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
