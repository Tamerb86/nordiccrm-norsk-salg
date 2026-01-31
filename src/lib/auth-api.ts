import type { UserRole } from './types'

  email: string
  lastName: 
  email: string
  firstName: string
  lastName: string
  role: UserRole
export interface 
  token?: string
 

  success: boolean
}
export interface
  user?: AuthUser
}
e




 

  return hashArray.map(b => b.toString

  const header = 
    userId,
 

  const signature = btoa(`${header}.${pa
}
function verifyT
 

    

    
      userId: payload.userId,
      role: payload.role
  } catch {
  }

 

      const usersData = await kv.get<Record<string, any>>('auth-users')
      if (!usersData) {
      }
      const
        re
      
        return { suc
      
     
        return { success: false, error: 'Invalid
      
 

      
       
        createdAt: new Date().toIS
      })
    
        email: user.email,
    
        avatar: user.avatar,
      }
     
    
    }

    email: string,
    firstName: string,
    r
    try {
      
   
 

      
      const userId = `user-${Date.now()}-${Math.random().toString(36).su
      con
        email,
      
        passwordHash: hashedPassword,
      
        updatedAt: new 
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
      
      await spark.kv.set(`auth-session-${user.id}`, {
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
      const usersData = await spark.kv.get<Record<string, any>>('auth-users') || {}
      
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
      const usersData = await kv.get<Record
      }
      
      usersData[userId] = newUser
      await spark.kv.set('auth-users', usersData)
      
      const teamMembers = await spark.kv.get<any[]>('team-members') || []
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
    } ca
      return { success: false, error: 'Password chang
  },
  async requestPasswordReset(e
      const usersData
      if (!usersData) {
      }
     
    

        return { success: true }
      
      const resetExpires = Date.now() + 
      
      
      
      c
      
        await kv.set('team-members', teamMembers)
      
    } catch (error) {
      return { success: false, error: 'Password reset request
  },
  asyn
      const usersData = await kv.get<Record<string, any>>('a
      if (!usersDat
      }
      co
      
      })
      if (!userKey) {
      
      const newHash = await hashPass
      usersData[userKey].passwordResetToken = undefined
      u
      
      const teamMembers = await kv
      if (memberInde
        teamMembers[member
      }
      return { success: true }
      console.error('Pas
    }

    try
      
        return { success: false, error: 'Inval
      
        const user = usersData[key]
               user.emailVerificationExpires > Date.now()
     
    

      usersData[userKey].emailVerificationToken
      use
      await kv.set('auth-users', usersData)
      const teamMembe
      if (memberIndex !== -1) {
     
    

    } catch (error) {
      ret
  }


















































































































































