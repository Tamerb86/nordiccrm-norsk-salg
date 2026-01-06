import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, MagnifyingGlass, Shield, UserCircle, Trash, PencilSimple, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { rolePermissions } from '@/lib/role-permissions'
import type { TeamMember, UserRole } from '@/lib/types'
import RolePermissionsView from './RolePermissionsView'
import PermissionGuard from './PermissionGuard'

export default function TeamManagementView() {
  const { t } = useLanguage()
  const { hasPermission } = useAuth()
  const [members, setMembers] = useKV<TeamMember[]>('team-members', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [viewPermissionsRole, setViewPermissionsRole] = useState<UserRole | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'sales' as UserRole,
    phone: '',
    department: '',
    title: '',
  })

  const filteredMembers = (members || []).filter((member) => {
    const query = searchQuery.toLowerCase()
    return (
      member.firstName.toLowerCase().includes(query) ||
      member.lastName.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.department?.toLowerCase().includes(query) ||
      member.title?.toLowerCase().includes(query)
    )
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error(t.common.error)
      return
    }

    if (editingMember) {
      setMembers((current) =>
        (current || []).map((member) =>
          member.id === editingMember.id
            ? {
                ...member,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : member
        )
      )
      toast.success(t.team.memberUpdated)
    } else {
      const emailExists = (members || []).some((m) => m.email === formData.email)
      if (emailExists) {
        toast.error('Email already exists')
        return
      }

      const verificationToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      const verificationExpires = new Date(Date.now() + 86400000).toISOString()

      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        ...formData,
        isActive: true,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        invitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setMembers((current) => [...(current || []), newMember])
      
      const verificationUrl = `${window.location.origin}?verify=${verificationToken}`
      console.log('Email verification link for new member:', verificationUrl)
      
      toast.success(t.team.memberCreated)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'sales',
      phone: '',
      department: '',
      title: '',
    })
    setIsAddDialogOpen(false)
    setEditingMember(null)
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role,
      phone: member.phone || '',
      department: member.department || '',
      title: member.title || '',
    })
    setIsAddDialogOpen(true)
  }

  const handleRemove = (memberId: string) => {
    if (confirm(t.team.removeConfirm)) {
      setMembers((current) => (current || []).filter((m) => m.id !== memberId))
      toast.success(t.team.memberRemoved)
    }
  }

  const toggleActive = (member: TeamMember) => {
    setMembers((current) =>
      (current || []).map((m) =>
        m.id === member.id
          ? {
              ...m,
              isActive: !m.isActive,
              updatedAt: new Date().toISOString(),
              lastActiveAt: !m.isActive ? new Date().toISOString() : m.lastActiveAt,
            }
          : m
      )
    )
    toast.success(member.isActive ? t.team.accountDeactivated : t.team.accountActivated)
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground'
      case 'manager':
        return 'bg-accent text-accent-foreground'
      case 'sales':
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.team.title}</h2>
          <p className="text-muted-foreground">{t.team.manageTeam}</p>
        </div>

        {hasPermission('team', 'invite') && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2" />
            {t.team.addMember}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCircle size={64} className="text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? t.common.noResults : t.team.noMembers}
            </h3>
            {!searchQuery && (
              <>
                <p className="text-muted-foreground mb-4">{t.team.addFirstMember}</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2" />
                  {t.team.addMember}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {member.firstName} {member.lastName}
                      </CardTitle>
                      <CardDescription className="text-xs">{member.email}</CardDescription>
                    </div>
                  </div>
                  {member.isActive ? (
                    <CheckCircle size={20} className="text-accent" weight="fill" />
                  ) : (
                    <XCircle size={20} className="text-muted-foreground" weight="fill" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.team.role}</span>
                  <Badge className={getRoleColor(member.role)}>{t.roles[member.role]}</Badge>
                </div>

                {member.title && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.team.jobTitle}</span>
                    <span className="text-sm font-medium">{member.title}</span>
                  </div>
                )}

                {member.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.team.department}</span>
                    <span className="text-sm font-medium">{member.department}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.team.status}</span>
                  <span className="text-sm font-medium">
                    {member.isActive ? t.team.active : t.team.inactive}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.auth.emailVerified}</span>
                  {member.emailVerified ? (
                    <CheckCircle size={16} className="text-accent" weight="fill" />
                  ) : (
                    <XCircle size={16} className="text-muted-foreground" weight="fill" />
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewPermissionsRole(member.role)}
                  >
                    <Shield size={16} className="mr-1" />
                    {t.team.permissions}
                  </Button>
                  {hasPermission('team', 'edit') && (
                    <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                      <PencilSimple size={16} />
                    </Button>
                  )}
                  {hasPermission('team', 'edit') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(member)}
                    >
                      {member.isActive ? (
                        <XCircle size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                    </Button>
                  )}
                  {hasPermission('team', 'remove') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? t.team.editMember : t.team.addMember}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? t.team.editMember : t.team.inviteMember}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t.contact.firstName}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t.contact.lastName}</Label>
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
                  required
                  disabled={!!editingMember}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t.team.role}</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  disabled={!hasPermission('team', 'changeRoles')}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div>
                        <div className="font-medium">{t.roles.admin}</div>
                        <div className="text-xs text-muted-foreground">{t.roleDescriptions.admin}</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div>
                        <div className="font-medium">{t.roles.manager}</div>
                        <div className="text-xs text-muted-foreground">{t.roleDescriptions.manager}</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="sales">
                      <div>
                        <div className="font-medium">{t.roles.sales}</div>
                        <div className="text-xs text-muted-foreground">{t.roleDescriptions.sales}</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="title">{t.team.jobTitle}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">{t.team.department}</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                {t.common.cancel}
              </Button>
              <Button type="submit">{t.common.save}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewPermissionsRole} onOpenChange={(open) => !open && setViewPermissionsRole(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.team.rolePermissions}</DialogTitle>
            <DialogDescription>
              {viewPermissionsRole && t.roles[viewPermissionsRole]} - {viewPermissionsRole && t.roleDescriptions[viewPermissionsRole]}
            </DialogDescription>
          </DialogHeader>
          {viewPermissionsRole && <RolePermissionsView role={viewPermissionsRole} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
