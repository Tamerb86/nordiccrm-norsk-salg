import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { TeamMember } from './types'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function useDemoAccounts() {
  const [members, setMembers] = useKV<TeamMember[]>('team-members', [])
  const [authUsersInitialized, setAuthUsersInitialized] = useKV<boolean>('auth-users-initialized', false)

  useEffect(() => {
    const initDemoAccounts = async () => {
      if (!members || members.length === 0) {
        const demoAccounts: TeamMember[] = [
          {
            id: 'demo-admin-001',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@crm.no',
            role: 'admin',
            isActive: true,
            phone: '+47 123 45 678',
            department: 'Management',
            title: 'System Administrator',
            invitedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailVerified: true,
          },
          {
            id: 'demo-manager-001',
            firstName: 'Manager',
            lastName: 'User',
            email: 'manager@crm.no',
            role: 'manager',
            isActive: true,
            phone: '+47 234 56 789',
            department: 'Sales',
            title: 'Sales Manager',
            invitedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailVerified: true,
          },
          {
            id: 'demo-sales-001',
            firstName: 'Sales',
            lastName: 'User',
            email: 'sales@crm.no',
            role: 'sales',
            isActive: true,
            phone: '+47 345 67 890',
            department: 'Sales',
            title: 'Sales Representative',
            invitedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailVerified: false,
          },
        ]
        
        setMembers(demoAccounts)
      }

      if (!authUsersInitialized) {
        const kv = window.spark.kv
        const existingAuthUsers = await kv.get<Record<string, any>>('auth-users')
        
        if (!existingAuthUsers) {
          const defaultPassword = 'demo123'
          const passwordHash = await hashPassword(defaultPassword)
          
          const authUsers: Record<string, any> = {}
          
          const demoUserData = [
            {
              id: 'demo-admin-001',
              email: 'admin@crm.no',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin',
              avatar: undefined,
            },
            {
              id: 'demo-manager-001',
              email: 'manager@crm.no',
              firstName: 'Manager',
              lastName: 'User',
              role: 'manager',
              avatar: undefined,
            },
            {
              id: 'demo-sales-001',
              email: 'sales@crm.no',
              firstName: 'Sales',
              lastName: 'User',
              role: 'sales',
              avatar: undefined,
            },
          ]
          
          for (const userData of demoUserData) {
            authUsers[userData.id] = {
              ...userData,
              passwordHash,
              isActive: true,
              emailVerified: userData.id !== 'demo-sales-001',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
          
          await kv.set('auth-users', authUsers)
          setAuthUsersInitialized(true)
        }
      }
    }

    initDemoAccounts()
  }, [members, setMembers, authUsersInitialized, setAuthUsersInitialized])
}
