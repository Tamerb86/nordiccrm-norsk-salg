import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Phone, 
  EnvelopeSimple, 
  Users, 
  PencilSimple,
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { norwegianTranslations as t, activityTypeLabels } from '@/lib/norwegian'
import { formatDateTime, formatRelativeDate } from '@/lib/helpers'
import type { Activity, ActivityType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ActivityLoggerProps {
  dealId: string
  contactId: string
  className?: string
}

export default function ActivityLogger({ dealId, contactId, className }: ActivityLoggerProps) {
  const [activities, setActivities] = useKV<Activity[]>('activities', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'call' as ActivityType,
    subject: '',
    notes: '',
    duration: '',
    outcome: '',
  })

  const safeActivities = activities || []
  
  const dealActivities = safeActivities
    .filter(a => a.dealId === dealId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject.trim()) {
      toast.error('Emne er påkrevd')
      return
    }

    const newActivity: Activity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: formData.type,
      contactId,
      dealId,
      subject: formData.subject,
      notes: formData.notes || undefined,
      duration: formData.duration ? Number(formData.duration) : undefined,
      outcome: formData.outcome || undefined,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
    }

    setActivities((current) => [...(current || []), newActivity])
    
    toast.success(`${activityTypeLabels[formData.type]} registrert`)
    
    setFormData({
      type: 'call',
      subject: '',
      notes: '',
      duration: '',
      outcome: '',
    })
    
    setIsDialogOpen(false)
  }

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'call':
        return <Phone size={18} weight="duotone" />
      case 'email':
        return <EnvelopeSimple size={18} weight="duotone" />
      case 'meeting':
        return <Users size={18} weight="duotone" />
      case 'note':
        return <PencilSimple size={18} weight="duotone" />
      default:
        return <PencilSimple size={18} weight="duotone" />
    }
  }

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'call':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'email':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'meeting':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'note':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} weight="duotone" />
            Aktivitetslogg ({dealActivities.length})
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                Logg aktivitet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus size={20} weight="duotone" />
                  Logg ny aktivitet
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-type">Type aktivitet *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value as ActivityType })}
                  >
                    <SelectTrigger id="activity-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">
                        <div className="flex items-center gap-2">
                          <Phone size={16} weight="duotone" />
                          {activityTypeLabels.call}
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <EnvelopeSimple size={16} weight="duotone" />
                          {activityTypeLabels.email}
                        </div>
                      </SelectItem>
                      <SelectItem value="meeting">
                        <div className="flex items-center gap-2">
                          <Users size={16} weight="duotone" />
                          {activityTypeLabels.meeting}
                        </div>
                      </SelectItem>
                      <SelectItem value="note">
                        <div className="flex items-center gap-2">
                          <PencilSimple size={16} weight="duotone" />
                          {activityTypeLabels.note}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-subject">Emne *</Label>
                  <Input
                    id="activity-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="F.eks: Introduksjonssamtale, Oppfølging på tilbud..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity-duration">Varighet (minutter)</Label>
                    <Input
                      id="activity-duration"
                      type="number"
                      min="0"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-outcome">Resultat</Label>
                    <Select 
                      value={formData.outcome} 
                      onValueChange={(value) => setFormData({ ...formData, outcome: value })}
                    >
                      <SelectTrigger id="activity-outcome">
                        <SelectValue placeholder="Velg resultat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="successful">Vellykket</SelectItem>
                        <SelectItem value="follow-up-needed">Krever oppfølging</SelectItem>
                        <SelectItem value="no-answer">Ikke svar</SelectItem>
                        <SelectItem value="voicemail">Telefonsvarer</SelectItem>
                        <SelectItem value="scheduled-meeting">Møte planlagt</SelectItem>
                        <SelectItem value="not-interested">Ikke interessert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-notes">Notater</Label>
                  <Textarea
                    id="activity-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Legg til detaljer om samtalen, møtet eller e-posten..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button type="submit">
                    <CheckCircle size={16} className="mr-2" />
                    Lagre aktivitet
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {dealActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock size={48} weight="duotone" className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Ingen aktiviteter registrert ennå</p>
            <p className="text-xs mt-1">Logg samtaler, e-poster og møter for å holde oversikten</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {dealActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0",
                      getActivityColor(activity.type)
                    )}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {activityTypeLabels[activity.type]}
                          </Badge>
                          {activity.outcome && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.outcome === 'successful' && '✓ Vellykket'}
                              {activity.outcome === 'follow-up-needed' && '→ Krever oppfølging'}
                              {activity.outcome === 'no-answer' && '○ Ikke svar'}
                              {activity.outcome === 'voicemail' && '◉ Telefonsvarer'}
                              {activity.outcome === 'scheduled-meeting' && '◷ Møte planlagt'}
                              {activity.outcome === 'not-interested' && '✗ Ikke interessert'}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeDate(activity.createdAt)}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-sm mb-1">{activity.subject}</h4>
                      
                      {activity.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {activity.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {activity.duration && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {activity.duration} min
                          </span>
                        )}
                        <span>{formatDateTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
