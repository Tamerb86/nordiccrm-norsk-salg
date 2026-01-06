import type { UserRole, RolePermissions } from './types'

export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    contacts: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      viewAll: true,
      exportData: true,
      importData: true,
    },
    deals: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      viewAll: true,
      reassign: true,
    },
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      viewAll: true,
      reassign: true,
    },
    emails: {
      view: true,
      send: true,
      viewAll: true,
      manageTemplates: true,
    },
    reports: {
      view: true,
      viewAll: true,
      export: true,
    },
    api: {
      view: true,
      manage: true,
    },
    team: {
      view: true,
      invite: true,
      edit: true,
      remove: true,
      changeRoles: true,
    },
  },
  manager: {
    contacts: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      viewAll: true,
      exportData: true,
      importData: true,
    },
    deals: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      viewAll: true,
      reassign: true,
    },
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      viewAll: true,
      reassign: true,
    },
    emails: {
      view: true,
      send: true,
      viewAll: true,
      manageTemplates: true,
    },
    reports: {
      view: true,
      viewAll: true,
      export: true,
    },
    api: {
      view: true,
      manage: false,
    },
    team: {
      view: true,
      invite: true,
      edit: false,
      remove: false,
      changeRoles: false,
    },
  },
  sales: {
    contacts: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      viewAll: false,
      exportData: false,
      importData: false,
    },
    deals: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      viewAll: false,
      reassign: false,
    },
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      viewAll: false,
      reassign: false,
    },
    emails: {
      view: true,
      send: true,
      viewAll: false,
      manageTemplates: false,
    },
    reports: {
      view: true,
      viewAll: false,
      export: false,
    },
    api: {
      view: false,
      manage: false,
    },
    team: {
      view: true,
      invite: false,
      edit: false,
      remove: false,
      changeRoles: false,
    },
  },
}

export function hasPermission(
  role: UserRole,
  resource: keyof RolePermissions,
  action: string
): boolean {
  const permissions = rolePermissions[role]
  const resourcePermissions = permissions[resource] as Record<string, boolean>
  return resourcePermissions[action] || false
}

export function canAccessResource(role: UserRole, resource: keyof RolePermissions): boolean {
  const permissions = rolePermissions[role]
  const resourcePermissions = permissions[resource] as Record<string, boolean>
  return Object.values(resourcePermissions).some((permission) => permission)
}
