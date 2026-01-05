import { useState, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Plus,
  Trash,
  Pencil,
  BracketsCurly,
  Warning,
  Download,
  Upload,
  FileArrowDown,
  FileArrowUp
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { CustomTemplateVariable } from '@/lib/types'

export default function CustomTemplateVariablesManager() {
  const [customVariables, setCustomVariables] = useKV<CustomTemplateVariable[]>('custom-template-variables', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<CustomTemplateVariable | null>(null)
  const [variableKey, setVariableKey] = useState('')
  const [variableLabel, setVariableLabel] = useState('')
  const [variableDescription, setVariableDescription] = useState('')
  const [variableExample, setVariableExample] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const safeCustomVariables = customVariables || []

  const handleOpenDialog = (variable?: CustomTemplateVariable) => {
    if (variable) {
      setEditingVariable(variable)
      setVariableKey(variable.key)
      setVariableLabel(variable.label)
      setVariableDescription(variable.description)
      setVariableExample(variable.example)
    } else {
      setEditingVariable(null)
      setVariableKey('')
      setVariableLabel('')
      setVariableDescription('')
      setVariableExample('')
    }
    setIsDialogOpen(true)
  }

  const validateVariableKey = (key: string): boolean => {
    if (!key.trim()) return false
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) return false
    
    const systemVariables = [
      'firstName', 'lastName', 'fullName', 'email', 'phone',
      'company', 'status', 'value', 'today'
    ]
    
    if (systemVariables.includes(key)) {
      toast.error('Denne variabelen er reservert for systemet')
      return false
    }

    const existingVariable = safeCustomVariables.find(v => v.key === key && v.id !== editingVariable?.id)
    if (existingVariable) {
      toast.error('En variabel med denne nøkkelen finnes allerede')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!variableKey.trim()) {
      toast.error('Vennligst fyll inn variabelnøkkel')
      return
    }

    if (!validateVariableKey(variableKey.trim())) {
      return
    }

    if (!variableLabel.trim()) {
      toast.error('Vennligst fyll inn variabelnavn')
      return
    }

    if (!variableDescription.trim()) {
      toast.error('Vennligst fyll inn beskrivelse')
      return
    }

    if (!variableExample.trim()) {
      toast.error('Vennligst fyll inn eksempel')
      return
    }

    const now = new Date().toISOString()

    if (editingVariable) {
      await setCustomVariables((current) =>
        (current || []).map(v =>
          v.id === editingVariable.id
            ? {
                ...v,
                key: variableKey.trim(),
                label: variableLabel.trim(),
                description: variableDescription.trim(),
                example: variableExample.trim(),
                updatedAt: now
              }
            : v
        )
      )
      toast.success('Variabel oppdatert')
    } else {
      const newVariable: CustomTemplateVariable = {
        id: crypto.randomUUID(),
        key: variableKey.trim(),
        label: variableLabel.trim(),
        description: variableDescription.trim(),
        example: variableExample.trim(),
        createdAt: now,
        updatedAt: now
      }
      await setCustomVariables((current) => [...(current || []), newVariable])
      toast.success('Variabel opprettet')
    }

    setIsDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    await setCustomVariables((current) => (current || []).filter(v => v.id !== id))
    toast.success('Variabel slettet')
  }

  const handleExport = () => {
    if (safeCustomVariables.length === 0) {
      toast.error('Ingen variabler å eksportere')
      return
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      variables: safeCustomVariables
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `custom-template-variables-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`${safeCustomVariables.length} variabel${safeCustomVariables.length !== 1 ? 'er' : ''} eksportert`)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/json') {
      toast.error('Vennligst last opp en JSON-fil')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        if (!data.variables || !Array.isArray(data.variables)) {
          toast.error('Ugyldig filformat')
          return
        }

        const validVariables = data.variables.filter((v: any) => {
          return v.id && v.key && v.label && v.description && v.example
        })

        if (validVariables.length === 0) {
          toast.error('Ingen gyldige variabler funnet i filen')
          return
        }

        const existingKeys = safeCustomVariables.map(v => v.key)
        const newVariables: CustomTemplateVariable[] = []
        const skippedVariables: string[] = []

        validVariables.forEach((v: CustomTemplateVariable) => {
          if (existingKeys.includes(v.key) || newVariables.some(nv => nv.key === v.key)) {
            skippedVariables.push(v.key)
          } else {
            newVariables.push({
              ...v,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
          }
        })

        if (newVariables.length > 0) {
          await setCustomVariables((current) => [...(current || []), ...newVariables])
          
          let message = `${newVariables.length} variabel${newVariables.length !== 1 ? 'er' : ''} importert`
          if (skippedVariables.length > 0) {
            message += ` (${skippedVariables.length} hoppet over pga. duplikater)`
          }
          toast.success(message)
        } else {
          toast.error('Alle variabler eksisterer allerede')
        }
      } catch (error) {
        toast.error('Kunne ikke lese filen. Sjekk at den er gyldig JSON.')
      }
    }

    reader.onerror = () => {
      toast.error('Kunne ikke lese filen')
    }

    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BracketsCurly size={24} weight="duotone" className="text-primary" />
                Egendefinerte variabler
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Opprett dine egne variabler for bruk i e-postmaler
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileArrowDown size={18} />
                    Importer/Eksporter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExport} disabled={safeCustomVariables.length === 0}>
                    <Download size={16} className="mr-2" />
                    Eksporter variabler
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={triggerFileInput}>
                    <Upload size={16} className="mr-2" />
                    Importer variabler
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => handleOpenDialog()}>
                <Plus size={18} />
                Ny variabel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {safeCustomVariables.length === 0 ? (
            <div className="py-8 text-center">
              <BracketsCurly size={48} className="mx-auto mb-4 text-muted-foreground" weight="thin" />
              <p className="text-muted-foreground mb-4">
                Ingen egendefinerte variabler opprettet ennå
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Opprett variabler som f.eks. {'{'}prosjektnavn{'}'}, {'{'}referansenummer{'}'} eller {'{'}kontaktperson{'}'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {safeCustomVariables.map((variable, index) => (
                  <motion.div
                    key={variable.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BracketsCurly size={20} weight="duotone" className="text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold">{variable.label}</h4>
                            <Badge variant="secondary" className="text-xs font-mono mt-1">
                              {'{'}
                              {variable.key}
                              {'}'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenDialog(variable)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(variable.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {variable.description}
                        </p>

                        <p className="text-sm">
                          <span className="font-medium text-muted-foreground">Eksempel:</span>{' '}
                          <span className="text-foreground">{variable.example}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVariable ? 'Rediger variabel' : 'Ny egendefinert variabel'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-muted-foreground/20">
              <div className="flex items-start gap-2 text-sm">
                <Warning size={18} className="text-primary shrink-0 mt-0.5" weight="bold" />
                <div className="space-y-1">
                  <p className="font-medium">Viktig informasjon</p>
                  <p className="text-muted-foreground text-xs">
                    Egendefinerte variabler vises i e-postmaler som <code className="px-1 py-0.5 bg-background rounded">{'{'}variabelnøkkel{'}'}</code>. 
                    Når du sender e-post, må du manuelt erstatte disse verdiene siden de ikke er koblet til kontaktdata.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="variable-key">
                Variabelnøkkel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variable-key"
                placeholder="prosjektnavn"
                value={variableKey}
                onChange={(e) => setVariableKey(e.target.value)}
                className="mt-1.5 font-mono"
                disabled={!!editingVariable}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Kun bokstaver, tall og understrek. Må starte med en bokstav.
              </p>
            </div>

            <div>
              <Label htmlFor="variable-label">
                Variabelnavn <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variable-label"
                placeholder="Prosjektnavn"
                value={variableLabel}
                onChange={(e) => setVariableLabel(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Et lesbart navn som vises i variabellisten
              </p>
            </div>

            <div>
              <Label htmlFor="variable-description">
                Beskrivelse <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="variable-description"
                placeholder="Navnet på prosjektet kunden er interessert i"
                value={variableDescription}
                onChange={(e) => setVariableDescription(e.target.value)}
                className="mt-1.5 min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="variable-example">
                Eksempel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variable-example"
                placeholder="Nettsideredesign 2024"
                value={variableExample}
                onChange={(e) => setVariableExample(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Et eksempel på hvordan variabelen kan brukes
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Lagre variabel
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  )
}
