import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactsView from '@/components/ContactsView'
import { useKV } from '@github/spark/hooks'
import type { Contact } from '@/lib/types'

vi.mock('@github/spark/hooks')
vi.mock('@/lib/language-context', () => ({
  useLanguage: () => ({
    t: {
      common: {
        search: 'Search',
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        cancel: 'Cancel',
        save: 'Save',
        loading: 'Loading...',
        export: 'Export',
        import: 'Import'
      },
      contacts: {
        title: 'Contacts',
        addContact: 'Add Contact',
        editContact: 'Edit Contact',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        company: 'Company',
        status: 'Status',
        tags: 'Tags',
        notes: 'Notes',
        value: 'Value',
        assignedTo: 'Assigned To',
        searchPlaceholder: 'Search contacts...',
        noContacts: 'No contacts found',
        deleteConfirm: 'Are you sure you want to delete this contact?',
        bulkActions: 'Bulk Actions'
      },
      status: {
        lead: 'Lead',
        prospect: 'Prospect',
        customer: 'Customer',
        lost: 'Lost'
      }
    },
    language: 'en'
  })
}))

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    },
    hasPermission: () => true
  })
}))

describe('ContactsView Integration Tests', () => {
  let mockContacts: Contact[]
  let mockSetContacts: ReturnType<typeof vi.fn>
  let mockDeleteContacts: ReturnType<typeof vi.fn>
  let mockEmails: any[]
  let mockSetEmails: ReturnType<typeof vi.fn>
  let mockDeleteEmails: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockContacts = [
      {
        id: 'contact-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+47 123 45 678',
        company: 'Acme Corp',
        status: 'lead',
        tags: ['important', 'vip'],
        value: 50000,
        assignedTo: 'user-123',
        notes: 'Test notes',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      {
        id: 'contact-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+47 987 65 432',
        company: 'Tech Inc',
        status: 'customer',
        tags: ['new'],
        value: 75000,
        assignedTo: 'user-123',
        createdAt: '2024-01-02T10:00:00Z',
        updatedAt: '2024-01-02T10:00:00Z'
      },
      {
        id: 'contact-3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        status: 'prospect',
        tags: [],
        value: 30000,
        assignedTo: 'user-456',
        createdAt: '2024-01-03T10:00:00Z',
        updatedAt: '2024-01-03T10:00:00Z'
      }
    ]

    mockEmails = []
    mockSetContacts = vi.fn((updater) => {
      if (typeof updater === 'function') {
        mockContacts = updater(mockContacts)
      } else {
        mockContacts = updater
      }
    })
    mockDeleteContacts = vi.fn()
    mockSetEmails = vi.fn((updater) => {
      if (typeof updater === 'function') {
        mockEmails = updater(mockEmails)
      } else {
        mockEmails = updater
      }
    })
    mockDeleteEmails = vi.fn()

    vi.mocked(useKV).mockImplementation((key: string, defaultValue: any) => {
      if (key === 'contacts') {
        return [mockContacts, mockSetContacts, mockDeleteContacts]
      }
      if (key === 'emails') {
        return [mockEmails, mockSetEmails, mockDeleteEmails]
      }
      return [defaultValue, vi.fn(), vi.fn()]
    })
  })

  describe('Data Loading and Display', () => {
    it('should render contacts list', () => {
      render(<ContactsView />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('should display contact details correctly', () => {
      render(<ContactsView />)
      
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('Tech Inc')).toBeInTheDocument()
    })

    it('should load contacts from KV store on mount', () => {
      render(<ContactsView />)
      
      expect(useKV).toHaveBeenCalledWith('contacts', [])
      expect(mockContacts).toHaveLength(3)
    })
  })

  describe('Search Functionality', () => {
    it('should filter contacts by name', async () => {
      render(<ContactsView />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'John' } })
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })
    })

    it('should filter contacts by email', async () => {
      render(<ContactsView />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'jane@example.com' } })
      
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      })
    })

    it('should filter contacts by company', async () => {
      render(<ContactsView />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'Acme' } })
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })
    })

    it('should filter contacts by tags', async () => {
      render(<ContactsView />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'vip' } })
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })
    })

    it('should show all contacts when search is cleared', async () => {
      render(<ContactsView />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'John' } })
      fireEvent.change(searchInput, { target: { value: '' } })
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      })
    })

    it('should be case insensitive', async () => {
      render(<ContactsView />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'JOHN' } })
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Contact Creation', () => {
    it('should open add contact dialog', async () => {
      render(<ContactsView />)
      
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByText('Add Contact')).toBeInTheDocument()
      })
    })

    it('should create new contact with valid data', async () => {
      render(<ContactsView />)
      
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByText('Add Contact')).toBeInTheDocument()
      })
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const emailInput = screen.getByLabelText(/email/i)
      
      fireEvent.change(firstNameInput, { target: { value: 'New' } })
      fireEvent.change(lastNameInput, { target: { value: 'Contact' } })
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalled()
      })
    })

    it('should save contact to KV store', async () => {
      render(<ContactsView />)
      
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByText('Add Contact')).toBeInTheDocument()
      })
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      
      fireEvent.change(firstNameInput, { target: { value: 'Test' } })
      fireEvent.change(lastNameInput, { target: { value: 'User' } })
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalledWith(expect.any(Function))
      })
      
      const updateFunction = mockSetContacts.mock.calls[0][0]
      const updatedContacts = updateFunction(mockContacts)
      expect(updatedContacts.length).toBeGreaterThan(mockContacts.length)
    })
  })

  describe('Contact Editing', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      render(<ContactsView />)
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Edit Contact')).toBeInTheDocument()
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      })
    })

    it('should update contact with new data', async () => {
      render(<ContactsView />)
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      })
      
      const firstNameInput = screen.getByDisplayValue('John')
      fireEvent.change(firstNameInput, { target: { value: 'Johnny' } })
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalled()
      })
    })

    it('should persist changes to KV store', async () => {
      render(<ContactsView />)
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      })
      
      const emailInput = screen.getByDisplayValue('john@example.com')
      fireEvent.change(emailInput, { target: { value: 'johnny@newexample.com' } })
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalledWith(expect.any(Function))
      })
      
      const updateFunction = mockSetContacts.mock.calls[0][0]
      const updatedContacts = updateFunction(mockContacts)
      const updatedContact = updatedContacts.find((c: Contact) => c.id === 'contact-1')
      expect(updatedContact?.email).toBe('johnny@newexample.com')
    })
  })

  describe('Contact Deletion', () => {
    it('should delete contact when delete button is clicked', async () => {
      render(<ContactsView />)
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      fireEvent.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalled()
      })
    })

    it('should remove contact from KV store', async () => {
      render(<ContactsView />)
      
      const initialCount = mockContacts.length
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      fireEvent.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalledWith(expect.any(Function))
      })
      
      const updateFunction = mockSetContacts.mock.calls[0][0]
      const updatedContacts = updateFunction(mockContacts)
      expect(updatedContacts.length).toBe(initialCount - 1)
      expect(updatedContacts.find((c: Contact) => c.id === 'contact-1')).toBeUndefined()
    })
  })

  describe('Bulk Actions', () => {
    it('should allow selecting multiple contacts', async () => {
      render(<ContactsView />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[1])
      
      await waitFor(() => {
        expect(checkboxes[0]).toBeChecked()
        expect(checkboxes[1]).toBeChecked()
      })
    })

    it('should select all contacts with select all checkbox', async () => {
      render(<ContactsView />)
      
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
      fireEvent.click(selectAllCheckbox)
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        checkboxes.forEach(checkbox => {
          expect(checkbox).toBeChecked()
        })
      })
    })

    it('should update status for multiple contacts', async () => {
      render(<ContactsView />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[1])
      
      const bulkStatusButton = screen.getByRole('button', { name: /bulk.*status/i })
      fireEvent.click(bulkStatusButton)
      
      const customerOption = screen.getByRole('option', { name: /customer/i })
      fireEvent.click(customerOption)
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalled()
      })
    })

    it('should assign tags to multiple contacts', async () => {
      render(<ContactsView />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[1])
      
      const bulkTagButton = screen.getByRole('button', { name: /bulk.*tag/i })
      fireEvent.click(bulkTagButton)
      
      const tagInput = screen.getByPlaceholderText(/tags/i)
      fireEvent.change(tagInput, { target: { value: 'newtag' } })
      
      const applyButton = screen.getByRole('button', { name: /apply/i })
      fireEvent.click(applyButton)
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalledWith(expect.any(Function))
      })
    })
  })

  describe('Data Persistence', () => {
    it('should retrieve contacts from KV on component mount', () => {
      render(<ContactsView />)
      expect(useKV).toHaveBeenCalledWith('contacts', [])
    })

    it('should handle empty contacts array', () => {
      vi.mocked(useKV).mockImplementation((key: string) => {
        if (key === 'contacts') {
          return [[], vi.fn(), vi.fn()]
        }
        return [[], vi.fn(), vi.fn()]
      })
      
      render(<ContactsView />)
      expect(screen.getByText(/no contacts/i)).toBeInTheDocument()
    })

    it('should handle null or undefined contacts gracefully', () => {
      vi.mocked(useKV).mockImplementation((key: string) => {
        if (key === 'contacts') {
          return [null, vi.fn(), vi.fn()]
        }
        return [[], vi.fn(), vi.fn()]
      })
      
      expect(() => render(<ContactsView />)).not.toThrow()
    })

    it('should update contacts immediately after creation', async () => {
      render(<ContactsView />)
      
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      
      fireEvent.change(firstNameInput, { target: { value: 'Immediate' } })
      fireEvent.change(lastNameInput, { target: { value: 'Update' } })
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalled()
        const calls = mockSetContacts.mock.calls
        expect(calls.length).toBeGreaterThan(0)
      })
    })

    it('should maintain data consistency after multiple operations', async () => {
      render(<ContactsView />)
      
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      fireEvent.change(firstNameInput, { target: { value: 'Test' } })
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockSetContacts).toHaveBeenCalled()
      })
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByText('Edit Contact')).toBeInTheDocument()
      })
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)
      
      expect(mockSetContacts.mock.calls.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle contacts with missing optional fields', () => {
      const incompleteContact: Contact = {
        id: 'incomplete',
        firstName: 'Test',
        lastName: 'User',
        status: 'lead',
        tags: [],
        value: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      vi.mocked(useKV).mockImplementation((key: string) => {
        if (key === 'contacts') {
          return [[incompleteContact], vi.fn(), vi.fn()]
        }
        return [[], vi.fn(), vi.fn()]
      })
      
      expect(() => render(<ContactsView />)).not.toThrow()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('should handle very long search terms', async () => {
      render(<ContactsView />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      const longSearchTerm = 'a'.repeat(500)
      
      fireEvent.change(searchInput, { target: { value: longSearchTerm } })
      
      expect(() => screen.getByText(/no contacts/i)).not.toThrow()
    })

    it('should handle special characters in search', async () => {
      render(<ContactsView />)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: '@#$%^&*()' } })
      
      expect(() => render(<ContactsView />)).not.toThrow()
    })
  })
})
