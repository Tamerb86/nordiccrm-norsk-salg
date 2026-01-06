import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { useDemoAccounts } from './use-demo-accounts'
import type { UserRole, TeamMember } from './types'

interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (resource: string, action: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  useDemoAccounts()
  
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useKV<string | null>('current-user-id', null)
  const [teamMembers] = useKV<TeamMember[]>('team-members', [])

  useEffect(() => {
    const initAuth = async () => {
      if (currentUserId) {
        const member = (teamMembers || []).find(m => m.id === currentUserId)
        if (member && member.isActive) {
          setUser({
            id: member.id,
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
            role: member.role,
            avatar: member.avatar,
          })
        } else {
          setCurrentUserId(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [currentUserId, teamMembers, setCurrentUserId])

  const login = async (email: string, password: string): Promise<boolean> => {
    const member = (teamMembers || []).find(
      m => m.email.toLowerCase() === email.toLowerCase() && m.isActive
    )

    if (member) {
      setUser({
        id: member.id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        avatar: member.avatar,
      })
      setCurrentUserId(member.id)
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    setCurrentUserId(null)
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    
    const { rolePermissions } = require('./role-permissions')
    const permissions = rolePermissions[user.role]
    const resourcePermissions = permissions[resource] as Record<string, boolean> | undefined
    
    if (!resourcePermissions) return false
    return resourcePermissions[action] || false
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
