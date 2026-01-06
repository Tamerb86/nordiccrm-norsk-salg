import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, CheckCircle, Circle, Clock } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/language-context'
import { generateId, getFullName, formatDate, isOverdue, isDueToday, getPriorityColor } from '@/lib/helpers'
import type { Task, Contact, TaskType, TaskPriority } from '@/lib/types'

export default function TasksView() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [contacts] = useKV<Contact[]>('contacts', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const safeTasks = tasks || []
  const safeContacts = contacts || []

  const pendingTasks = safeTasks.filter(t => !t.completed)
  const completedTasks = safeTasks.filter(t => t.completed)
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueDate))
  const todayTasks = pendingTasks.filter(t => isDueToday(t.dueDate))

  const handleSaveTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((current) => [...(current || []), newTask])
    toast.success(t.task.created)
    setIsDialogOpen(false)
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks((current) =>
      (current || []).map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    )
    const task = safeTasks.find(task => task.id === taskId)
    toast.success(task?.completed ? t.task.markedIncomplete : t.task.markedComplete)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((current) => (current || []).filter((task) => task.id !== taskId))
    toast.success(t.task.deleted)
  }

  const getContactName = (contactId: string | undefined): string => {
    if (!contactId) return ''
    const contact = safeContacts.find(c => c.id === contactId)
    return contact ? getFullName(contact.firstName, contact.lastName) : ''
  }

  const renderTaskList = (taskList: Task[], showOverdueIndicator: boolean = false) => (
    <div className="space-y-3">
      {taskList.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t.task.noTasks}
          </CardContent>
        </Card>
      )}
      {taskList.map((task) => {
        const isTaskOverdue = !task.completed && isOverdue(task.dueDate)
        const isTaskToday = !task.completed && isDueToday(task.dueDate)
        const contactName = getContactName(task.contactId)

        return (
          <Card
            key={task.id}
            className={`hover:shadow-md transition-all ${
              task.completed ? 'opacity-60' : ''
            } ${isTaskOverdue ? 'border-destructive' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle size={24} weight="fill" className="text-accent" />
                  ) : (
                    <Circle size={24} className="text-muted-foreground hover:text-primary" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4
                        className={`font-semibold ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      {contactName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          → {contactName}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {t.taskType[task.type]}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {t.priority[task.priority]}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={14} />
                      <span className={isTaskOverdue ? 'text-destructive font-semibold' : ''}>
                        {formatDate(task.dueDate)}
                        {isTaskOverdue && ` (${t.task.overdue})`}
                        {isTaskToday && ` (${t.task.today})`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.task.title}</h2>
          <p className="text-muted-foreground mt-1">
            {pendingTasks.length} ventende • {overdueTasks.length} forfalte
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus size={20} weight="bold" />
              {t.task.addNew}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.task.addNew}</DialogTitle>
            </DialogHeader>
            <TaskForm
              contacts={safeContacts}
              onSave={handleSaveTask}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {overdueTasks.length > 0 && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <Clock size={20} weight="bold" />
              <span>{overdueTasks.length} forfalte oppgaver</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Ventende ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="today">
            I dag ({todayTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Fullført ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {renderTaskList(pendingTasks, true)}
        </TabsContent>

        <TabsContent value="today">
          {renderTaskList(todayTasks, false)}
        </TabsContent>

        <TabsContent value="completed">
          {renderTaskList(completedTasks, false)}
        </TabsContent>
      </Tabs>

      {safeTasks.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-dashed">
          <CardContent className="py-12 text-center">
            <Plus size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">Ingen oppgaver enda</h3>
            <p className="text-muted-foreground mb-4">
              Begynn med å legge til din første oppgave
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus size={20} weight="bold" />
              {t.task.addNew}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface TaskFormProps {
  contacts: Contact[]
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'>) => void
  onCancel: () => void
}

function TaskForm({ contacts, onSave, onCancel }: TaskFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contactId: '',
    dealId: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as TaskPriority,
    type: 'other' as TaskType,
    assignedTo: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      contactId: formData.contactId || undefined,
      dealId: formData.dealId || undefined,
      assignedTo: formData.dealId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t.task.taskTitle} *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t.task.description}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactId">{t.deal.contact}</Label>
        <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
          <SelectTrigger id="contactId">
            <SelectValue placeholder={t.contact.selectContact} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t.contact.noContact}</SelectItem>
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
          <Label htmlFor="type">{t.task.type}</Label>
          <Select value={formData.type} onValueChange={(value: TaskType) => setFormData({ ...formData, type: value })}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['call', 'email', 'meeting', 'follow-up', 'other'] as const).map((type) => (
                <SelectItem key={type} value={type}>
                  {t.taskType[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">{t.task.priority}</Label>
          <Select value={formData.priority} onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {t.priority[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">{t.task.dueDate} *</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
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
