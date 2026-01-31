import type { UserRole } from './types'

  email: string
  lastName: 
  email: string
  firstName: string
  lastName: string
  role: UserRole
  error?: string

 

}
  success: boolean
  error?: string

  error?: string
}

  const data = encoder.encode(passw
  const hashArray 
}
function generate
  const payload 
 

  return `${header}.${payload}.${signatu

  try {
 

    }
    return { userI
    return null
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
         
      const hashedPassword = await hashPassword(password)
      const usersData = await spark.kv.get<Record<string, any>>('auth-users') || {}
      
      const userKey = Object.keys(usersData).find(key => {
        const user = usersData[key]
        return user.email === email && user.passwordHash === hashedPassword
      })

      if (!userKey) {
    lastName: string,
      }

      const user = usersData[userKey]

      if (!user.isActive) {

      }

      const token = generateToken(user.id, user.role)

      await spark.kv.set(`auth-session-${user.id}`, {
        token,
        userId: user.id,
        role: user.role,
        lastAccessAt: new Date().toISOString()
        

      return {
        success: true,
      await wi
        user: {
      teamMembers.push
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        createdAt: new Date().toISOString()
        }

    } catch (error) {
        token,
      return { success: false, error: 'Login failed' }
     
  },

  async register(
        user: {
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = 'user'
  ): Promise<RegisterResponse> {
    try {
      const usersData = await spark.kv.get<Record<string, any>>('auth-users') || {}
    }
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
      return {
        firstName,
        lastName,
        role,
          lastName: user.lastName,
        isActive: true,
          emailVerified: user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await spark.kv.set('auth-users', usersData)

      const teamMembers = await spark.kv.get<any[]>('team-members') || []
      return { success: 
        id: userId,
        email,
        firstName,
        lastName,
        role,
        isActive: true,
        emailVerified: false,
      }
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
      if (!users
          firstName,
          lastName,
          role,
        return user.passwordRe
        }

    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
     
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

        user: {
      }
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,

          avatar: user.avatar,
          emailVerified: user.emailVerified || false
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

  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {

      const usersData = await spark.kv.get<Record<string, any>>('auth-users')
      if (!usersData) {
        return { success: false, error: 'User not found' }


      const userKey = Object.keys(usersData).find(key => usersData[key].email === email)
      if (!userKey) {

      }

      const resetToken = btoa(`${email}-${Date.now()}`)


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




























































