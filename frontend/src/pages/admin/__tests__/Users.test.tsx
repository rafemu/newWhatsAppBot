import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import Users from '../Users'

// Mock the hooks
jest.mock('@/hooks/useAuth')
jest.mock('@/hooks/useNotification')

const mockUseAuth = useAuth as jest.Mock
const mockUseNotification = useNotification as jest.Mock

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['ADMIN'],
    permissions: ['user:view', 'user:edit'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    roles: ['MANAGER'],
    permissions: ['user:view'],
    isActive: false,
  },
]

// Setup component wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderComponent = () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Users Page', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'admin',
        permissions: ['user:view', 'user:edit', 'user:create', 'user:delete'],
      },
    })

    mockUseNotification.mockReturnValue({
      showNotification: jest.fn(),
    })

    // Mock fetch
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/users') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  it('renders users table with data', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    expect(screen.getByText('ADMIN')).toBeInTheDocument()
    expect(screen.getByText('פעיל')).toBeInTheDocument()
    expect(screen.getByText('חסום')).toBeInTheDocument()
  })

  it('opens create user dialog when clicking add button', async () => {
    renderComponent()

    fireEvent.click(screen.getByText('הוסף משתמש'))

    expect(screen.getByText('הוסף משתמש חדש')).toBeInTheDocument()
    expect(screen.getByLabelText('שם מלא')).toBeInTheDocument()
    expect(screen.getByLabelText('אימייל')).toBeInTheDocument()
    expect(screen.getByLabelText('סיסמה')).toBeInTheDocument()
  })

  it('opens edit user dialog with user data', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: 'ערוך' })
    fireEvent.click(editButtons[0])

    expect(screen.getByText('ערוך משתמש')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
  })

  it('shows error message when submitting incomplete form', async () => {
    renderComponent()

    fireEvent.click(screen.getByText('הוסף משתמש'))
    fireEvent.click(screen.getByText('צור משתמש'))

    expect(
      screen.getByText('כל השדות המסומנים הם שדות חובה')
    ).toBeInTheDocument()
  })

  it('creates new user successfully', async () => {
    const showNotification = jest.fn()
    mockUseNotification.mockReturnValue({ showNotification })

    renderComponent()

    fireEvent.click(screen.getByText('הוסף משתמש'))

    fireEvent.change(screen.getByLabelText('שם מלא'), {
      target: { value: 'New User' },
    })
    fireEvent.change(screen.getByLabelText('אימייל'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('סיסמה'), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByText('צור משתמש'))

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        'המשתמש נוצר בהצלחה',
        'success'
      )
    })
  })

  it('confirms before deleting user', async () => {
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => true)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: 'מחק' })
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalledWith(
      'האם אתה בטוח שברצונך למחוק משתמש זה?'
    )

    window.confirm = originalConfirm
  })

  it('toggles user status', async () => {
    const showNotification = jest.fn()
    mockUseNotification.mockReturnValue({ showNotification })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const toggleButtons = screen.getAllByRole('button', { name: 'חסום' })
    fireEvent.click(toggleButtons[0])

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        'סטטוס המשתמש עודכן בהצלחה',
        'success'
      )
    })
  })
}) 