import { BracketsCurly, MagnifyingGlass, Question } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { availableTemplateVariables, type TemplateVariable } from '@/lib/helpers'
import type { CustomTemplateVariable } from '@/lib/types'

interface TemplateVariableInserterProps {
  onInsert: (variable: string) => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export default function TemplateVariableInserter({
  onInsert,
  variant = 'outline',
  size = 'sm'
}: TemplateVariableInserterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [customVariables] = useKV<CustomTemplateVariable[]>('custom-template-variables', [])

  const allVariables = useMemo(() => {
    const systemVars = availableTemplateVariables.map(v => ({ ...v, isCustom: false }))
    const customVars = (customVariables || []).map(v => ({ ...v, isCustom: true }))
    return [...systemVars, ...customVars]
  }, [customVariables])

  const filteredVariables = allVariables.filter((variable) =>
    variable.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const systemVariables = filteredVariables.filter(v => !(v as any).isCustom)
  const customFilteredVariables = filteredVariables.filter(v => (v as any).isCustom)

  const handleInsert = (variable: TemplateVariable) => {
    onInsert(`{${variable.key}}`)
    setOpen(false)
    setSearchTerm('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <BracketsCurly size={16} weight="bold" />
          Variabler
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <BracketsCurly size={20} weight="duotone" className="text-primary" />
            <h4 className="font-semibold">Malvariabler</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Sett inn variabler som automatisk erstattes med kontaktinformasjon
          </p>
          <div className="relative">
            <MagnifyingGlass 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Søk variabler..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {filteredVariables.length > 0 ? (
              <div className="space-y-3">
                {systemVariables.length > 0 && (
                  <div>
                    <div className="px-3 py-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Systemvariabler
                      </h4>
                    </div>
                    <div className="space-y-1">
                      {systemVariables.map((variable) => (
                        <button
                          key={variable.key}
                          onClick={() => handleInsert(variable)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-medium text-sm">{variable.label}</span>
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-mono shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            >
                              {`{${variable.key}}`}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {variable.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Eksempel:</span> {variable.example}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {systemVariables.length > 0 && customFilteredVariables.length > 0 && (
                  <Separator className="my-2" />
                )}

                {customFilteredVariables.length > 0 && (
                  <div>
                    <div className="px-3 py-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Egendefinerte variabler
                      </h4>
                    </div>
                    <div className="space-y-1">
                      {customFilteredVariables.map((variable) => (
                        <button
                          key={variable.key}
                          onClick={() => handleInsert(variable)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-medium text-sm">{variable.label}</span>
                            <Badge 
                              variant="outline" 
                              className="text-xs font-mono shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                            >
                              {`{${variable.key}}`}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {variable.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Eksempel:</span> {variable.example}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <MagnifyingGlass size={32} className="mx-auto mb-2 opacity-50" />
                Ingen variabler funnet
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-muted/30">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Question size={14} className="mt-0.5 shrink-0" weight="bold" />
            <p>
              Variabler skrives med krøllparenteser, for eksempel <code className="px-1 py-0.5 bg-muted rounded font-mono text-foreground">{'{firstName}'}</code>. 
              De vil bli erstattet med faktiske verdier når e-posten sendes.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
