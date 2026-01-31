import type { UserRole } from './types'

declare global {
  interface Window {
    spark: {
      kv: {
        get: <T>(key: string) => Promise<T | undefined>
        set: <T>(key: string, value: T) => Promise<void>
        delete: (key: string) => Promise<void>
      }
    }
  }
}

const spark = window.spark

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  emailVerified?: boolean
}

interface LoginResponse {
  success: boolean
  token?: string
  user?: AuthUser
  error?: string
}

interface RegisterResponse {
  success: boolean
  token?: string
  user?: AuthUser
  error?: string
}

interface PasswordResetResponse {
  success: boolean
  error?: string
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateToken(userId: string, userRole: UserRole): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ 
    userId, 
    role: userRole,
    exp: Date.now() + 24 * 60 * 60 * 1000
  }))
  const signature = btoa(`${header}.${payload}`)
  return `${header}.${payload}.${signature}`
}

function verifyToken(token: string): { userId: string; role: UserRole } | null {
  try {
    const [, payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64))
    
    if (payload.exp < Date.now()) {
      return null
    }
    
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}

export const authAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const hashedPassword = await hashPassword(password)
      const usersData = await spark.kv.get<Record<string, any>>('auth-users') || {}
      
      const userKey = Object.keys(usersData).find(key => {
        const user = usersData[key]
        return user.email === email && user.passwordHash === hashedPassword
      })

      if (!userKey) {
        return { success: false, error: 'Invalid email or password' }
      }

      const user = usersData[userKey]

      if (!user.isActive) {
        return { success: false, error: 'Account is inactive' }
      }

      const token = generateToken(user.id, user.role)

      await spark.kv.set(`auth-session-${user.id}`, {
        token,
        userId: user.id,
        role: user.role,
        lastAccessAt: new Date().toISOString()
      })

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified || false
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  },

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = 'sales'
  ): Promise<RegisterResponse> {
    try {
      const usersData = await spark.kv.get<Record<string, any>>('auth-users') || {}
      
      const existingUser = Object.values(usersData).find(
        (user: any) => user.email === email
      )

      if (existingUser) {
        return { success: false, error: 'Email already registered' }
      }

      const hashedPassword = await hashPassword(password)
      const userId = `user-${Date.now()}`
      
      usersData[userId] = {
        id: userId,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role,
        avatar: undefined,
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await spark.kv.set('auth-users', usersData)

      const teamMembers = await spark.kv.get<any[]>('team-members') || []
      teamMembers.push({
        id: userId,
        email,
        firstName,
        lastName,
        role,
        isActive: true,
        emailVerified: false,
        invitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })
      await spark.kv.set('team-members', teamMembers)

      const token = generateToken(userId, role)
      await spark.kv.set(`auth-session-${userId}`, {
        token,
        userId,
        role,
        lastAccessAt: new Date().toISOString()
      })

      return {
        success: true,
        token,
        user: {
          id: userId,
          email,
          firstName,
          lastName,
          role,
          emailVerified: false
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  },

  async validateSession(token: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const payload = verifyToken(token)
      if (!payload) return { success: false, error: 'Invalid token' }

      const usersData = await spark.kv.get<Record<string, any>>('auth-users') || {}
      if (!usersData[payload.userId]) {
        return { success: false, error: 'User not found' }
      }

      const user = usersData[payload.userId]
      const session = await spark.kv.get<any>(`auth-session-${payload.userId}`)

      await spark.kv.set(`auth-session-${payload.userId}`, {
        ...session,
        lastAccessAt: new Date().toISOString()
      })

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified || false
        }
      }
    } catch (error) {
      console.error('Session validation error:', error)
      return { success: false, error: 'Session validation failed' }
    }
  },

  async logout(userId: string): Promise<{ success: boolean }> {
    try {
      await spark.kv.delete(`auth-session-${userId}`)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false }
    }
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      const usersData = await spark.kv.get<Record<string, any>>('auth-users')
      if (!usersData) {
        return { success: false, error: 'User not found' }
      }

      const userKey = Object.keys(usersData).find(key => usersData[key].email === email)
      if (!userKey) {
        return { success: false, error: 'User not found' }
      }

      const resetToken = btoa(`${email}-${Date.now()}`)
      const resetExpires = Date.now() + 60 * 60 * 1000

      usersData[userKey].passwordResetToken = resetToken
      usersData[userKey].passwordResetExpires = resetExpires
      usersData[userKey].updatedAt = new Date().toISOString()

      await spark.kv.set('auth-users', usersData)
      console.log(`Password reset token: ${resetToken}`)

      return { success: true }
    } catch (error) {
      console.error('Password reset request error:', error)
      return { success: false, error: 'Password reset request failed' }
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    try {
      const usersData = await spark.kv.get<Record<string, any>>('auth-users')
      if (!usersData) {
        return { success: false, error: 'Invalid reset token' }
      }

      const userKey = Object.keys(usersData).find(key => {
        const user = usersData[key]
        return user.passwordResetToken === token && 
               user.passwordResetExpires > Date.now()
      })

      if (!userKey) {
        return { success: false, error: 'Invalid or expired reset token' }
      }

      const newHash = await hashPassword(newPassword)

      usersData[userKey].passwordHash = newHash
      delete usersData[userKey].passwordResetToken
      delete usersData[userKey].passwordResetExpires
      usersData[userKey].updatedAt = new Date().toISOString()

      await spark.kv.set('auth-users', usersData)

      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Password reset failed' }
    }
  },

  async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const usersData = await spark.kv.get<Record<string, any>>('auth-users')
      if (!usersData) {
        return { success: false, error: 'Invalid verification token' }
      }

      const userKey = Object.keys(usersData).find(key => {
        const user = usersData[key]
        return user.emailVerificationToken === token && 
               user.emailVerificationExpires > Date.now()
      })

      if (!userKey) {
        return { success: false, error: 'Invalid or expired verification token' }
      }

      usersData[userKey].emailVerified = true
      delete usersData[userKey].emailVerificationToken
      delete usersData[userKey].emailVerificationExpires
      usersData[userKey].updatedAt = new Date().toISOString()

      await spark.kv.set('auth-users', usersData)

      const teamMembers = await spark.kv.get<any[]>('team-members') || []
      const memberIndex = teamMembers.findIndex(m => m.id === usersData[userKey].id)
      if (memberIndex !== -1) {
        teamMembers[memberIndex].emailVerified = true
        await spark.kv.set('team-members', teamMembers)
      }

      return { success: true }
    } catch (error) {
      console.error('Email verification error:', error)
      return { success: false, error: 'Email verification failed' }
    }
  }
}
