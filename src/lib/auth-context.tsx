import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { useDemoAccounts } from './use-demo-accounts'
import { authAPI, type AuthUser } from './auth-api'
import { rolePermissions } from './role-permissions'

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
  const [authToken, setAuthToken] = useKV<string | null>('auth-token', null)

  useEffect(() => {
    const initAuth = async () => {
      if (authToken) {
        const response = await authAPI.validateSession(authToken)
        
        if (response.success && response.user) {
          setUser(response.user)
        } else {
          setAuthToken(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [authToken, setAuthToken])

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await authAPI.login(email, password)
    
    if (response.success && response.token && response.user) {
      setUser(response.user)
      setAuthToken(response.token)
      return true
    }
    
    return false
  }

  const logout = async () => {
    if (user) {
      await authAPI.logout(user.id)
    }
    setUser(null)
    setAuthToken(null)
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    
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
