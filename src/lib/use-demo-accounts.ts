import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { TeamMember } from './types'

export function useDemoAccounts() {
  const [members, setMembers] = useKV<TeamMember[]>('team-members', [])

  useEffect(() => {
    const initDemoAccounts = () => {
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
          },
        ]
        
        setMembers(demoAccounts)
      }
    }

    initDemoAccounts()
  }, [members, setMembers])
}
