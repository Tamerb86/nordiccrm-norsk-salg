import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Phone, 
  EnvelopeSimple, 
  Users, 
  PencilSimple,
  Clock,
  MagnifyingGlass,
  Funnel,
  Calendar
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { activityTypeLabels } from '@/lib/norwegian'
import { formatDateTime, formatRelativeDate, getFullName, filterBySearch } from '@/lib/helpers'
import type { Activity, ActivityType, Contact } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ActivityTimelineProps {
  contactId?: string
  dealId?: string
  limit?: number
  showFilters?: boolean
  className?: string
}

export default function ActivityTimeline({ 
  contactId, 
  dealId, 
  limit, 
  showFilters = true,
  className 
}: ActivityTimelineProps) {
  const [activities] = useKV<Activity[]>('activities', [])
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all')

  const safeActivities = activities || []
  const safeContacts = contacts || []

  let filteredActivities = safeActivities

  if (contactId) {
    filteredActivities = filteredActivities.filter(a => a.contactId === contactId)
  }

  if (dealId) {
    filteredActivities = filteredActivities.filter(a => a.dealId === dealId)
  }

  if (filterType !== 'all') {
    filteredActivities = filteredActivities.filter(a => a.type === filterType)
  }

  if (searchTerm) {
    filteredActivities = filterBySearch(filteredActivities, searchTerm, ['subject', 'notes', 'outcome'])
  }

  filteredActivities = filteredActivities
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (limit) {
    filteredActivities = filteredActivities.slice(0, limit)
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

  const getContactName = (contactId: string) => {
    const contact = safeContacts.find(c => c.id === contactId)
    if (!contact) return 'Ukjent kontakt'
    return getFullName(contact.firstName, contact.lastName)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="space-y-4">
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} weight="duotone" />
            Aktivitetstidslinje ({filteredActivities.length})
          </CardTitle>
          
          {showFilters && (
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Søk i aktiviteter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as ActivityType | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Funnel size={16} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle typer</SelectItem>
                  <SelectItem value="call">{activityTypeLabels.call}</SelectItem>
                  <SelectItem value="email">{activityTypeLabels.email}</SelectItem>
                  <SelectItem value="meeting">{activityTypeLabels.meeting}</SelectItem>
                  <SelectItem value="note">{activityTypeLabels.note}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock size={48} weight="duotone" className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm || filterType !== 'all' 
                ? 'Ingen aktiviteter matcher filteret' 
                : 'Ingen aktiviteter registrert ennå'}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative flex gap-4"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg border-2 flex items-center justify-center flex-shrink-0 relative z-10",
                      getActivityColor(activity.type)
                    )}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {activityTypeLabels[activity.type]}
                            </Badge>
                            {!contactId && (
                              <Badge variant="secondary" className="text-xs">
                                {getContactName(activity.contactId)}
                              </Badge>
                            )}
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
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatRelativeDate(activity.createdAt)}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDateTime(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-base mb-2">{activity.subject}</h4>
                        
                        {activity.notes && (
                          <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                            {activity.notes}
                          </p>
                        )}
                        
                        {activity.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={14} />
                            Varighet: {activity.duration} minutter
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
