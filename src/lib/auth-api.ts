import type { UserRole } from './types'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  emailVerified: boolean
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: AuthUser
  error?: string
}

export interface RegisterResponse {
  success: boolean
  error?: string
}

export interface VerifyTokenResponse {
  success: boolean
  user?: AuthUser
  error?: string
}

export interface ResetPasswordResponse {
  success: boolean
  error?: string
}

const API_BASE = '/api/auth'

const kv = window.spark.kv

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateToken(userId: string, email: string, role: UserRole): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    userId,
    email,
    role,
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
  }))
  const signature = btoa(`${header}.${payload}`)
  return `${header}.${payload}.${signature}`
}

function verifyToken(token: string): { userId: string; email: string; role: UserRole } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    
    if (payload.exp < Date.now()) {
      return null
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    }
  } catch {
    return null
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const hashedPassword = await hashPassword(password)
      
      const usersData = await kv.get<Record<string, any>>('auth-users')
      
      if (!usersData) {
        return { success: false, error: 'Invalid credentials' }
      }
      
      const userKey = Object.keys(usersData).find(key => {
        const user = usersData[key]
        return user.email.toLowerCase() === email.toLowerCase()
      })
      
      if (!userKey) {
        return { success: false, error: 'Invalid credentials' }
      }
      
      const user = usersData[userKey]
      
      if (user.passwordHash !== hashedPassword) {
        return { success: false, error: 'Invalid credentials' }
      }
      
      if (!user.isActive) {
        return { success: false, error: 'Account is deactivated' }
      }
      
      const token = generateToken(user.id, user.email, user.role)
      
      await kv.set(`auth-session-${user.id}`, {
        token,
        userId: user.id,
        createdAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString()
      })
      
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified || false
      }
      
      return { success: true, token, user: authUser }
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
      const usersData = await kv.get<Record<string, any>>('auth-users') || {}
      
      const existingUser = Object.values(usersData).find(
        (user: any) => user.email.toLowerCase() === email.toLowerCase()
      )
      
      if (existingUser) {
        return { success: false, error: 'Email already exists' }
      }
      
      const hashedPassword = await hashPassword(password)
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newUser = {
        id: userId,
        email,
        firstName,
        lastName,
        role,
        passwordHash: hashedPassword,
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      usersData[userId] = newUser
      await kv.set('auth-users', usersData)
      
      const teamMembers = await kv.get<any[]>('team-members') || []
      teamMembers.push({
        id: userId,
        firstName,
        lastName,
        email,
        role,
        isActive: true,
        emailVerified: false,
        invitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      await kv.set('team-members', teamMembers)
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  },

  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    try {
      const decoded = verifyToken(token)
      
      if (!decoded) {
        return { success: false, error: 'Invalid or expired token' }
      }
      
      const session = await kv.get<any>(`auth-session-${decoded.userId}`)
      
      if (!session || session.token !== token) {
        return { success: false, error: 'Session not found' }
      }
      
      await kv.set(`auth-session-${decoded.userId}`, {
        ...session,
        lastAccessAt: new Date().toISOString()
      })
      
      const usersData = await kv.get<Record<string, any>>('auth-users')
      const user = usersData?.[decoded.userId]
      
      if (!user || !user.isActive) {
        return { success: false, error: 'User not found or inactive' }
      }
      
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified || false
      }
      
      return { success: true, user: authUser }
    } catch (error) {
      console.error('Token verification error:', error)
      return { success: false, error: 'Token verification failed' }
    }
  },

  async logout(userId: string): Promise<void> {
    try {
      await kv.delete(`auth-session-${userId}`)
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const usersData = await kv.get<Record<string, any>>('auth-users')
      
      if (!usersData || !usersData[userId]) {
        return { success: false, error: 'User not found' }
      }
      
      const currentHash = await hashPassword(currentPassword)
      
      if (usersData[userId].passwordHash !== currentHash) {
        return { success: false, error: 'Current password is incorrect' }
      }
      
      const newHash = await hashPassword(newPassword)
      usersData[userId].passwordHash = newHash
      usersData[userId].updatedAt = new Date().toISOString()
      
      await kv.set('auth-users', usersData)
      
      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, error: 'Password change failed' }
    }
  },

  async requestPasswordReset(email: string): Promise<ResetPasswordResponse> {
    try {
      const usersData = await kv.get<Record<string, any>>('auth-users')
      
      if (!usersData) {
        return { success: true }
      }
      
      const userKey = Object.keys(usersData).find(key => {
        const user = usersData[key]
        return user.email.toLowerCase() === email.toLowerCase()
      })
      
      if (!userKey) {
        return { success: true }
      }
      
      const resetToken = `reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const resetExpires = Date.now() + (60 * 60 * 1000)
      
      usersData[userKey].passwordResetToken = resetToken
      usersData[userKey].passwordResetExpires = resetExpires
      
      await kv.set('auth-users', usersData)
      
      const teamMembers = await kv.get<any[]>('team-members') || []
      const memberIndex = teamMembers.findIndex(m => m.id === userKey)
      if (memberIndex !== -1) {
        teamMembers[memberIndex].passwordResetToken = resetToken
        teamMembers[memberIndex].passwordResetExpires = new Date(resetExpires).toISOString()
        await kv.set('team-members', teamMembers)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Password reset request error:', error)
      return { success: false, error: 'Password reset request failed' }
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const usersData = await kv.get<Record<string, any>>('auth-users')
      
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
      usersData[userKey].passwordResetToken = undefined
      usersData[userKey].passwordResetExpires = undefined
      usersData[userKey].updatedAt = new Date().toISOString()
      
      await kv.set('auth-users', usersData)
      
      const teamMembers = await kv.get<any[]>('team-members') || []
      const memberIndex = teamMembers.findIndex(m => m.id === userKey)
      if (memberIndex !== -1) {
        teamMembers[memberIndex].passwordResetToken = undefined
        teamMembers[memberIndex].passwordResetExpires = undefined
        await kv.set('team-members', teamMembers)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Password reset failed' }
    }
  },

  async verifyEmail(token: string): Promise<VerifyTokenResponse> {
    try {
      const usersData = await kv.get<Record<string, any>>('auth-users')
      
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
      usersData[userKey].emailVerificationToken = undefined
      usersData[userKey].emailVerificationExpires = undefined
      usersData[userKey].updatedAt = new Date().toISOString()
      
      await kv.set('auth-users', usersData)
      
      const teamMembers = await kv.get<any[]>('team-members') || []
      const memberIndex = teamMembers.findIndex(m => m.id === userKey)
      if (memberIndex !== -1) {
        teamMembers[memberIndex].emailVerified = true
        teamMembers[memberIndex].emailVerificationToken = undefined
        teamMembers[memberIndex].emailVerificationExpires = undefined
        await kv.set('team-members', teamMembers)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Email verification error:', error)
      return { success: false, error: 'Email verification failed' }
    }
  }
}
