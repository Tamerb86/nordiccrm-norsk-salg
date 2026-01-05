import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, MagnifyingGlass, Pencil, Trash, Eye } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { norwegianTranslations as t, statusLabels } from '@/lib/norwegian'
import { generateId, getFullName, getInitials, getStatusColor, formatDate, filterBySearch } from '@/lib/helpers'
import type { Contact, ContactStatus } from '@/lib/types'
import ContactDetailView from '@/components/ContactDetailView'

export default function ContactsView() {
  const [contacts, setContacts] = useKV<Contact[]>('contacts', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [viewingContactId, setViewingContactId] = useState<string | null>(null)

  const safeContacts = contacts || []
  const filteredContacts = filterBySearch(safeContacts, searchTerm, ['firstName', 'lastName', 'email', 'company', 'tags'])

  const handleSaveContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingContact) {
      setContacts((current) =>
        (current || []).map((c) =>
          c.id === editingContact.id
            ? { ...c, ...contact, updatedAt: new Date().toISOString() }
            : c
        )
      )
      toast.success('Kontakt oppdatert')
    } else {
      const newContact: Contact = {
        ...contact,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setContacts((current) => [...(current || []), newContact])
      toast.success('Kontakt opprettet')
    }
    setIsDialogOpen(false)
    setEditingContact(null)
  }

  const handleDeleteContact = (id: string) => {
    setContacts((current) => (current || []).filter((c) => c.id !== id))
    toast.success('Kontakt slettet')
  }

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact)
    setIsDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingContact(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.contact.title}</h2>
          <p className="text-muted-foreground mt-1">{t.contact.all}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="lg">
              <Plus size={20} weight="bold" />
              {t.contact.addNew}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? t.contact.edit : t.contact.addNew}
              </DialogTitle>
            </DialogHeader>
            <ContactForm
              contact={editingContact}
              onSave={handleSaveContact}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingContact(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <MagnifyingGlass
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder={t.common.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredContacts.length === 0 && searchTerm === '' && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-dashed">
          <CardContent className="py-12 text-center">
            <Plus size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">Ingen kontakter enda</h3>
            <p className="text-muted-foreground mb-4">
              Begynn med å legge til din første kontakt
            </p>
            <Button onClick={openNewDialog}>
              <Plus size={20} weight="bold" />
              {t.contact.addNew}
            </Button>
          </CardContent>
        </Card>
      )}

      {filteredContacts.length === 0 && searchTerm !== '' && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t.common.noResults}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                    {getInitials(contact.firstName, contact.lastName)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">
                      {getFullName(contact.firstName, contact.lastName)}
                    </h3>
                    {contact.company && (
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {contact.email && (
                  <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                )}
                {contact.phone && (
                  <p className="text-sm text-muted-foreground font-mono">{contact.phone}</p>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={getStatusColor(contact.status)}>
                  {statusLabels[contact.status]}
                </Badge>
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingContactId(contact.id)}
                  className="flex-1"
                >
                  <Eye size={16} />
                  Vis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(contact)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteContact(contact.id)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash size={16} />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Opprettet: {formatDate(contact.createdAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ContactDetailView
        contactId={viewingContactId}
        isOpen={viewingContactId !== null}
        onClose={() => setViewingContactId(null)}
      />
    </div>
  )
}

interface ContactFormProps {
  contact: Contact | null
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    status: contact?.status || 'lead' as ContactStatus,
    tags: contact?.tags || [] as string[],
    value: contact?.value || 0,
    source: contact?.source || '',
    notes: contact?.notes || '',
  })

  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t.contact.firstName} *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t.contact.lastName} *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t.contact.email}</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t.contact.phone}</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">{t.contact.company}</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">{t.contact.status}</Label>
        <Select value={formData.status} onValueChange={(value: ContactStatus) => setFormData({ ...formData, status: value })}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">{t.contact.value} (NOK)</Label>
        <Input
          id="value"
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">{t.contact.source}</Label>
        <Input
          id="source"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>{t.contact.tags}</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder={t.common.addTag}
          />
          <Button type="button" onClick={addTag} variant="outline">
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t.contact.notes}</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
