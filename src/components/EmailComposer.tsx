import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  PaperPlaneRight,
  X,
  Paperclip,
  Clock,
  Eye,
  FloppyDisk,
  ListBullets,
  File,
  Trash,
  Info
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { norwegianTranslations as t } from '@/lib/norwegian'
import type { Email, EmailTemplate, Contact, Activity, EmailAttachment } from '@/lib/types'

interface EmailComposerProps {
  isOpen: boolean
  onClose: () => void
  contactId?: string
  dealId?: string
  initialTo?: string
  initialSubject?: string
}

export default function EmailComposer({
  isOpen,
  onClose,
  contactId,
  dealId,
  initialTo = '',
  initialSubject = ''
}: EmailComposerProps) {
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [emails, setEmails] = useKV<Email[]>('emails', [])
  const [templates, setTemplates] = useKV<EmailTemplate[]>('email-templates', [])
  const [activities, setActivities] = useKV<Activity[]>('activities', [])

  const [to, setTo] = useState(initialTo)
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState('')
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [attachments, setAttachments] = useState<EmailAttachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const safeContacts = contacts || []
  const safeEmails = emails || []
  const safeTemplates = templates || []
  const safeActivities = activities || []

  useEffect(() => {
    if (initialTo) setTo(initialTo)
    if (initialSubject) setSubject(initialSubject)
  }, [initialTo, initialSubject])

  const handleUseTemplate = (templateId: string) => {
    const template = safeTemplates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setBody(template.body)
      setSelectedTemplateId(templateId)
      toast.success(t.email.templateSaved)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Vennligst skriv inn malnavn')
      return
    }

    const newTemplate: EmailTemplate = {
      id: crypto.randomUUID(),
      name: templateName,
      subject,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await setTemplates((current) => [...(current || []), newTemplate])
    toast.success(t.email.templateSaved)
    setTemplateName('')
    setSaveAsTemplate(false)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024
  const MAX_TOTAL_SIZE = 25 * 1024 * 1024
  const MAX_ATTACHMENTS = 10

  const ALLOWED_FILE_TYPES = {
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ],
    images: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    archives: [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],
  }

  const ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.svg', '.zip', '.rar', '.7z'
  ]

  const isFileTypeAllowed = (file: File): boolean => {
    const allAllowedTypes = [
      ...ALLOWED_FILE_TYPES.documents,
      ...ALLOWED_FILE_TYPES.images,
      ...ALLOWED_FILE_TYPES.archives,
    ]
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const mimeTypeAllowed = allAllowedTypes.includes(file.type)
    const extensionAllowed = ALLOWED_EXTENSIONS.includes(fileExtension)
    
    return mimeTypeAllowed || extensionAllowed
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getTotalAttachmentsSize = (): number => {
    return attachments.reduce((sum, att) => sum + att.size, 0)
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error(`Maksimalt ${MAX_ATTACHMENTS} vedlegg tillatt`)
      return
    }

    const filesArray = Array.from(files)
    const remainingSlots = MAX_ATTACHMENTS - attachments.length
    const filesToProcess = filesArray.slice(0, remainingSlots)
    
    if (filesArray.length > remainingSlots) {
      toast.warning(`Kun ${remainingSlots} fil(er) ble lagt til. Maks ${MAX_ATTACHMENTS} vedlegg tillatt.`)
    }

    const newAttachments: EmailAttachment[] = []
    const errors: string[] = []

    for (const file of filesToProcess) {
      if (!isFileTypeAllowed(file)) {
        errors.push(`${file.name}: Filtype ikke tillatt`)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: For stor (maks ${formatFileSize(MAX_FILE_SIZE)})`)
        continue
      }

      const currentTotalSize = getTotalAttachmentsSize()
      const potentialTotalSize = currentTotalSize + file.size + newAttachments.reduce((sum, att) => sum + att.size, 0)
      
      if (potentialTotalSize > MAX_TOTAL_SIZE) {
        errors.push(`${file.name}: Total størrelse ville overstige ${formatFileSize(MAX_TOTAL_SIZE)}`)
        continue
      }

      try {
        const dataUrl = await readFileAsDataURL(file)
        const attachment: EmailAttachment = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: dataUrl
        }
        newAttachments.push(attachment)
      } catch (error) {
        errors.push(`${file.name}: Feil ved lesing av fil`)
      }
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments])
      toast.success(`${newAttachments.length} fil(er) lagt til`)
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }
  }

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('File read error'))
      reader.readAsDataURL(file)
    })
  }

  const getFileTypeCategory = (type: string, name: string): string => {
    const extension = '.' + name.split('.').pop()?.toLowerCase()
    
    if (ALLOWED_FILE_TYPES.images.includes(type) || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(extension)) {
      return 'Bilde'
    }
    if (ALLOWED_FILE_TYPES.archives.includes(type) || ['.zip', '.rar', '.7z'].includes(extension)) {
      return 'Arkiv'
    }
    if (type.includes('pdf') || extension === '.pdf') {
      return 'PDF'
    }
    if (type.includes('word') || ['.doc', '.docx'].includes(extension)) {
      return 'Word'
    }
    if (type.includes('excel') || type.includes('spreadsheet') || ['.xls', '.xlsx'].includes(extension)) {
      return 'Excel'
    }
    if (type.includes('powerpoint') || type.includes('presentation') || ['.ppt', '.pptx'].includes(extension)) {
      return 'PowerPoint'
    }
    if (type.includes('text') || ['.txt', '.csv'].includes(extension)) {
      return 'Tekst'
    }
    return 'Dokument'
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
    toast.info('Vedlegg fjernet')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error('Vennligst fyll inn mottaker')
      return
    }

    if (!validateEmail(to)) {
      toast.error('Ugyldig e-postadresse')
      return
    }

    if (!subject.trim()) {
      toast.error('Vennligst fyll inn emne')
      return
    }

    if (!body.trim()) {
      toast.error('Vennligst skriv en melding')
      return
    }

    setIsSending(true)

    try {
      const emailId = crypto.randomUUID()
      const now = new Date().toISOString()

      const newEmail: Email = {
        id: emailId,
        contactId: contactId || '',
        dealId,
        from: 'deg@bedrift.no',
        to: to.trim(),
        cc: cc ? cc.split(',').map(e => e.trim()) : undefined,
        bcc: bcc ? bcc.split(',').map(e => e.trim()) : undefined,
        subject: subject.trim(),
        body: body.trim(),
        status: 'sent',
        trackingEnabled,
        openCount: 0,
        clickCount: 0,
        attachments: attachments.length > 0 ? attachments : undefined,
        sentAt: now,
        createdAt: now,
        updatedAt: now
      }

      await setEmails((current) => [...(current || []), newEmail])

      const activity: Activity = {
        id: crypto.randomUUID(),
        type: 'email-sent',
        contactId: contactId || '',
        dealId,
        subject: `E-post sendt: ${subject}`,
        notes: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
        createdBy: 'Deg',
        createdAt: now,
        metadata: {
          emailId,
          to: to.trim(),
          trackingEnabled
        }
      }

      await setActivities((current) => [...(current || []), activity])

      if (trackingEnabled) {
        simulateEmailTracking(emailId)
      }

      toast.success(t.email.sendSuccess)
      handleClose()
    } catch (error) {
      toast.error(t.email.sendError)
      console.error('Email send error:', error)
    } finally {
      setIsSending(false)
    }
  }

  const simulateEmailTracking = async (emailId: string) => {
    setTimeout(async () => {
      await setEmails((current) => {
        const updated = (current || []).map(email =>
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
        return updated
      })

      const email = safeEmails.find(e => e.id === emailId)
      if (email) {
        const activity: Activity = {
          id: crypto.randomUUID(),
          type: 'email-opened',
          contactId: email.contactId,
          dealId: email.dealId,
          subject: `E-post åpnet: ${email.subject}`,
          createdBy: 'System',
          createdAt: new Date().toISOString()
        }
        await setActivities((current) => [...(current || []), activity])
      }

      toast.info('📬 E-post åpnet av mottaker')
    }, 8000)

    setTimeout(async () => {
      await setEmails((current) => {
        const updated = (current || []).map(email =>
          email.id === emailId
            ? {
                ...email,
                status: 'clicked' as const,
                clickedAt: new Date().toISOString(),
                clickCount: email.clickCount + 1,
                updatedAt: new Date().toISOString()
              }
            : email
        )
        return updated
      })

      const email = safeEmails.find(e => e.id === emailId)
      if (email) {
        const activity: Activity = {
          id: crypto.randomUUID(),
          type: 'email-clicked',
          contactId: email.contactId,
          dealId: email.dealId,
          subject: `Lenke klikket i e-post: ${email.subject}`,
          createdBy: 'System',
          createdAt: new Date().toISOString()
        }
        await setActivities((current) => [...(current || []), activity])
      }

      toast.success('🎯 Mottaker klikket på lenke i e-posten!')
    }, 15000)
  }

  const handleClose = () => {
    setTo(initialTo)
    setCc('')
    setBcc('')
    setSubject(initialSubject)
    setBody('')
    setShowCc(false)
    setShowBcc(false)
    setShowTemplates(false)
    setSelectedTemplateId('')
    setSaveAsTemplate(false)
    setTemplateName('')
    setAttachments([])
    setIsDragging(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <PaperPlaneRight size={28} weight="duotone" />
            {t.email.compose}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTemplates(!showTemplates)}
              className="gap-2"
            >
              <ListBullets size={16} />
              {t.email.useTemplate}
            </Button>
            {!showCc && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCc(true)}
              >
                + Cc
              </Button>
            )}
            {!showBcc && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowBcc(true)}
              >
                + Bcc
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <Label>{t.email.selectTemplate}</Label>
                  <Select value={selectedTemplateId} onValueChange={handleUseTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg en mal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {safeTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                      {safeTemplates.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground">
                          Ingen maler funnet
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <div>
              <Label htmlFor="to">{t.email.to}</Label>
              <Input
                id="to"
                type="email"
                placeholder="mottaker@eksempel.no"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <AnimatePresence>
              {showCc && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label htmlFor="cc">{t.email.cc}</Label>
                  <Input
                    id="cc"
                    type="email"
                    placeholder="kopi@eksempel.no"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="mt-1.5"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showBcc && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label htmlFor="bcc">{t.email.bcc}</Label>
                  <Input
                    id="bcc"
                    type="email"
                    placeholder="blindkopi@eksempel.no"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="mt-1.5"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="subject">{t.email.subject}</Label>
              <Input
                id="subject"
                placeholder="Skriv inn emne..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="body">{t.email.body}</Label>
              <Textarea
                id="body"
                placeholder="Skriv din melding her..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1.5 min-h-[200px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Label>{t.email.attachments}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Info size={14} className="text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Vedleggsrestriksjoner</h4>
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-foreground">📏 Størrelse:</span>
                              <div>
                                <p>Maks {formatFileSize(MAX_FILE_SIZE)} per fil</p>
                                <p>Maks {formatFileSize(MAX_TOTAL_SIZE)} totalt</p>
                                <p>Maks {MAX_ATTACHMENTS} filer</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-foreground">📄 Tillatte typer:</span>
                              <div>
                                <p>• Dokumenter: PDF, Word, Excel, PowerPoint, TXT, CSV</p>
                                <p>• Bilder: JPG, PNG, GIF, WebP, SVG</p>
                                <p>• Arkiver: ZIP, RAR, 7Z</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="text-xs text-muted-foreground">
                  {attachments.length}/{MAX_ATTACHMENTS} filer • {formatFileSize(getTotalAttachmentsSize())}/{formatFileSize(MAX_TOTAL_SIZE)}
                </span>
              </div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg,.zip,.rar,.7z"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center py-6 px-4 cursor-pointer"
                >
                  <Paperclip size={32} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-foreground">Klikk for å velge filer</span>
                    {' '}eller dra og slipp her
                  </p>
                  <div className="mt-2 space-y-0.5 text-center">
                    <p className="text-xs text-muted-foreground">
                      Maks {formatFileSize(MAX_FILE_SIZE)} per fil • {formatFileSize(MAX_TOTAL_SIZE)} totalt
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tillatte typer: PDF, Word, Excel, PowerPoint, bilder, ZIP
                    </p>
                  </div>
                </label>
              </div>

              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {getTotalAttachmentsSize() > MAX_TOTAL_SIZE * 0.8 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                      >
                        <p className="text-xs text-destructive font-medium">
                          ⚠️ Du nærmer deg maksimal total størrelse ({formatFileSize(MAX_TOTAL_SIZE)})
                        </p>
                      </motion.div>
                    )}
                    {attachments.map((attachment) => (
                      <motion.div
                        key={attachment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg group hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <File size={24} className="text-primary" weight="duotone" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {attachment.name}
                              </p>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                                {getFileTypeCategory(attachment.type, attachment.name)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </motion.div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        {attachments.length} vedlegg • {formatFileSize(getTotalAttachmentsSize())} av {formatFileSize(MAX_TOTAL_SIZE)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAttachments([])}
                        className="text-xs h-7"
                      >
                        Fjern alle
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="tracking"
                  checked={trackingEnabled}
                  onCheckedChange={setTrackingEnabled}
                />
                <Label htmlFor="tracking" className="cursor-pointer">
                  {t.email.trackingEnabled}
                </Label>
              </div>
              {trackingEnabled && (
                <Badge variant="secondary" className="gap-1">
                  <Eye size={14} />
                  Sporing aktivert
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="save-template"
                  checked={saveAsTemplate}
                  onCheckedChange={setSaveAsTemplate}
                />
                <Label htmlFor="save-template" className="cursor-pointer">
                  {t.email.saveAsTemplate}
                </Label>
              </div>
            </div>

            <AnimatePresence>
              {saveAsTemplate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.email.templateName}
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={handleSaveTemplate}
                      disabled={!templateName.trim()}
                    >
                      <FloppyDisk size={16} />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 gap-2"
            >
              {isSending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <PaperPlaneRight size={18} />
                  </motion.div>
                  Sender...
                </>
              ) : (
                <>
                  <PaperPlaneRight size={18} weight="fill" />
                  {t.email.send}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
