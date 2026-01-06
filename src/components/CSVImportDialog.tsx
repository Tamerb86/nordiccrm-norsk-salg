import { useState, useRef } from 'react'
import { Upload, FileArrowDown, Warning, CheckCircle, X, DownloadSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/lib/language-context'
import { generateCSVTemplate } from '@/lib/csv-import'
import type { ImportResult, ImportError } from '@/lib/csv-import'

interface CSVImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'contacts' | 'deals'
  onImport: (file: File) => Promise<ImportResult<any>>
  title: string
  description: string
}

export default function CSVImportDialog({
  open,
  onOpenChange,
  type,
  onImport,
  title,
  description,
}: CSVImportDialogProps) {
  const { t } = useLanguage()
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult<any> | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setImportResult({
        success: false,
        data: [],
        errors: [{ row: 0, message: t.import.invalidFileType }],
        skipped: 0,
        imported: 0,
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const result = await onImport(file)
      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        data: [],
        errors: [{ row: 0, message: t.import.importFailed }],
        skipped: 0,
        imported: 0,
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate(type)
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${type}-template.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    setImportResult(null)
    setIsImporting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload size={24} weight="duotone" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <p className="text-sm text-muted-foreground">{description}</p>

          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full justify-center"
          >
            <DownloadSimple size={20} weight="bold" />
            {t.import.downloadTemplate}
          </Button>

          <Separator />

          {!importResult && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
                ${isImporting ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                disabled={isImporting}
              />

              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-primary/10">
                  <FileArrowDown size={32} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {isImporting ? t.import.importing : t.import.dragDrop}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.import.csvOnly}
                  </p>
                </div>
                {!isImporting && (
                  <Button variant="secondary" size="sm" onClick={(e) => e.stopPropagation()}>
                    {t.import.browseFiles}
                  </Button>
                )}
              </div>
            </div>
          )}

          {importResult && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {importResult.success ? (
                  <Alert className="bg-accent/10 border-accent">
                    <CheckCircle size={20} weight="fill" className="text-accent" />
                    <AlertDescription>
                      <div className="font-medium mb-2">{t.import.importSuccess}</div>
                      <div className="text-sm space-y-1">
                        <div>{t.import.imported}: <strong>{importResult.imported}</strong></div>
                        {importResult.skipped > 0 && (
                          <div>{t.import.skipped}: <strong>{importResult.skipped}</strong></div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-destructive/10 border-destructive">
                    <Warning size={20} weight="fill" className="text-destructive" />
                    <AlertDescription>
                      <div className="font-medium mb-2">{t.import.importFailed}</div>
                      <div className="text-sm">
                        {t.import.imported}: <strong>{importResult.imported}</strong>
                        {' '}/{' '}
                        {t.import.skipped}: <strong>{importResult.skipped}</strong>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{t.import.errors}</h4>
                      <Badge variant="destructive">{importResult.errors.length}</Badge>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <div
                          key={index}
                          className="p-3 border border-destructive/20 rounded-md bg-destructive/5 text-sm"
                        >
                          <div className="flex items-start gap-2">
                            <Warning size={16} weight="fill" className="text-destructive mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">
                                {t.import.row} {error.row}
                                {error.field && ` - ${error.field}`}
                              </div>
                              <div className="text-muted-foreground mt-1">{error.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {importResult ? (
            <div className="flex gap-2 w-full sm:w-auto">
              {importResult.imported > 0 && (
                <Button onClick={handleClose} className="flex-1 sm:flex-initial">
                  <CheckCircle size={20} weight="bold" />
                  {t.common.done}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setImportResult(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="flex-1 sm:flex-initial"
              >
                {t.import.importAnother}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              {t.common.cancel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
