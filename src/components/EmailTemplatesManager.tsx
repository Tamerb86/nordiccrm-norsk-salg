import { useState, useRef, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Plus,
  Trash,
  Pencil,
  Copy,
  FileText,
  Sparkle
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { norwegianTranslations as t } from '@/lib/norwegian'
import { formatRelativeDate, replaceTemplateVariables } from '@/lib/helpers'
import TemplateVariableInserter from '@/components/TemplateVariableInserter'
import type { EmailTemplate, CustomTemplateVariable } from '@/lib/types'

interface EmailTemplatesManagerProps {
  onSelectTemplate?: (template: EmailTemplate) => void
}

export default function EmailTemplatesManager({ onSelectTemplate }: EmailTemplatesManagerProps) {
  const [templates, setTemplates] = useKV<EmailTemplate[]>('email-templates', [])
  const [customVariables] = useKV<CustomTemplateVariable[]>('custom-template-variables', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateSubject, setTemplateSubject] = useState('')
  const [templateBody, setTemplateBody] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const subjectInputRef = useRef<HTMLInputElement>(null)
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null)

  const safeTemplates = templates || []

  const customPreviewValues = useMemo(() => {
    const values: Record<string, string> = {}
    if (customVariables) {
      customVariables.forEach((v) => {
        values[v.key] = v.example
      })
    }
    return values
  }, [customVariables])

  const previewContact = {
    firstName: 'Ola',
    lastName: 'Nordmann',
    email: 'ola@eksempel.no',
    phone: '+47 123 45 678',
    company: 'Eksempel AS',
    status: 'Kunde',
    value: 50000
  }

  const previewSubject = replaceTemplateVariables(templateSubject, previewContact, customPreviewValues)
  const previewBody = replaceTemplateVariables(templateBody, previewContact, customPreviewValues)

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setTemplateName(template.name)
      setTemplateSubject(template.subject)
      setTemplateBody(template.body)
      setTemplateCategory(template.category || '')
    } else {
      setEditingTemplate(null)
      setTemplateName('')
      setTemplateSubject('')
      setTemplateBody('')
      setTemplateCategory('')
    }
    setShowPreview(false)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Vennligst fyll inn malnavn')
      return
    }

    if (!templateSubject.trim()) {
      toast.error('Vennligst fyll inn emne')
      return
    }

    if (!templateBody.trim()) {
      toast.error('Vennligst fyll inn meldingstekst')
      return
    }

    const now = new Date().toISOString()

    if (editingTemplate) {
      await setTemplates((current) =>
        (current || []).map(t =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: templateName.trim(),
                subject: templateSubject.trim(),
                body: templateBody.trim(),
                category: templateCategory.trim() || undefined,
                updatedAt: now
              }
            : t
        )
      )
      toast.success('Mal oppdatert')
    } else {
      const newTemplate: EmailTemplate = {
        id: crypto.randomUUID(),
        name: templateName.trim(),
        subject: templateSubject.trim(),
        body: templateBody.trim(),
        category: templateCategory.trim() || undefined,
        createdAt: now,
        updatedAt: now
      }
      await setTemplates((current) => [...(current || []), newTemplate])
      toast.success(t.email.templateSaved)
    }

    setIsDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    await setTemplates((current) => (current || []).filter(t => t.id !== id))
    toast.success('Mal slettet')
  }

  const handleDuplicate = async (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (kopi)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await setTemplates((current) => [...(current || []), newTemplate])
    toast.success('Mal duplisert')
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
      toast.success('Mal lastet inn')
    }
  }

  const handleInsertVariable = (variable: string) => {
    const textarea = bodyTextareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newBody = templateBody.substring(0, start) + variable + templateBody.substring(end)
      setTemplateBody(newBody)
      
      setTimeout(() => {
        textarea.focus()
        const newPos = start + variable.length
        textarea.setSelectionRange(newPos, newPos)
      }, 0)
    } else {
      setTemplateBody(templateBody + variable)
    }
  }

  const handleInsertVariableInSubject = (variable: string) => {
    const input = subjectInputRef.current
    if (input) {
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0
      const newSubject = templateSubject.substring(0, start) + variable + templateSubject.substring(end)
      setTemplateSubject(newSubject)
      
      setTimeout(() => {
        input.focus()
        const newPos = start + variable.length
        input.setSelectionRange(newPos, newPos)
      }, 0)
    } else {
      setTemplateSubject(templateSubject + variable)
    }
  }

  const categories = Array.from(new Set(safeTemplates.map(t => t.category).filter(Boolean)))

  if (safeTemplates.length === 0 && !isDialogOpen) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-muted-foreground" weight="thin" />
          <p className="text-muted-foreground mb-4">Ingen e-postmaler opprettet ennå</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus size={18} />
            {t.email.newTemplate}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t.email.templates}</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={18} />
          {t.email.newTemplate}
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {safeTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText size={24} weight="duotone" className="text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {template.subject}
                          </p>
                        </div>
                        {template.category && (
                          <Badge variant="secondary">{template.category}</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {template.body}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Opprettet {formatRelativeDate(template.createdAt)}
                        </span>

                        <div className="flex items-center gap-2">
                          {onSelectTemplate && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUseTemplate(template)}
                            >
                              Bruk
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicate(template)}
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(template)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Rediger mal' : t.email.newTemplate}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">{t.email.templateName}</Label>
                <Input
                  id="template-name"
                  placeholder="Oppfølging etter møte"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="template-category">{t.email.category}</Label>
                <Input
                  id="template-category"
                  placeholder="Oppfølging"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="template-subject">{t.email.subject}</Label>
                <TemplateVariableInserter onInsert={handleInsertVariableInSubject} />
              </div>
              <Input
                ref={subjectInputRef}
                id="template-subject"
                placeholder="Takk for møtet i dag"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="template-body">{t.email.body}</Label>
                <div className="flex items-center gap-2">
                  <TemplateVariableInserter onInsert={handleInsertVariable} />
                  {(templateSubject.includes('{') || templateBody.includes('{')) && (
                    <Button
                      variant={showPreview ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="gap-2"
                    >
                      <Sparkle size={16} weight={showPreview ? 'fill' : 'regular'} />
                      {showPreview ? 'Skjul' : 'Forhåndsvisning'}
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                ref={bodyTextareaRef}
                id="template-body"
                placeholder="Hei {firstName},&#10;&#10;Takk for et hyggelig møte i dag..."
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                className="min-h-[200px]"
              />
              
              <AnimatePresence>
                {showPreview && (templateSubject.includes('{') || templateBody.includes('{')) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-lg space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkle size={18} weight="duotone" className="text-accent" />
                        <h4 className="font-semibold text-sm">Forhåndsvisning med eksempeldata</h4>
                      </div>
                      
                      {templateSubject.includes('{') && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Emne:</Label>
                          <p className="text-sm font-medium mt-1">{previewSubject}</p>
                        </div>
                      )}
                      
                      {templateBody.includes('{') && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Melding:</Label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{previewBody}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {t.common.save}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.common.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
