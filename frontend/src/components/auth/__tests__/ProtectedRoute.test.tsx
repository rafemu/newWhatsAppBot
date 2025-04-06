import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '../ProtectedRoute'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')

const mockUseAuth = useAuth as jest.Mock

// Test component setup
const TestComponent = () => <div>Protected Content</div>
const LoginComponent = () => <div>Login Page</div>
const UnauthorizedComponent = () => <div>Unauthorized Page</div>

const renderWithRouter = (
  element: React.ReactNode,
  { route = '/' } = {}
) => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/unauthorized" element={<UnauthorizedComponent />} />
        <Route path="/" element={element} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReset()
  })

  it('shows loading state while initializing', () => {
    mockUseAuth.mockReturnValue({
      isInitialized: false,
      user: null,
    })

    renderWithRouter(
      <ProtectedRoute requireAuth>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isInitialized: true,
      user: null,
    })

    renderWithRouter(
      <ProtectedRoute requireAuth>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects to home when authenticated user tries to access auth pages', () => {
    mockUseAuth.mockReturnValue({
      isInitialized: true,
      user: { id: '1', roles: [], permissions: [] },
    })

    renderWithRouter(
      <ProtectedRoute requireAuth={false}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to unauthorized when user lacks required role', () => {
    mockUseAuth.mockReturnValue({
      isInitialized: true,
      user: { id: '1', roles: ['USER'], permissions: [] },
    })

    renderWithRouter(
      <ProtectedRoute requireAuth roles={['ADMIN']}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
  })

  it('redirects to unauthorized when user lacks required permissions', () => {
    mockUseAuth.mockReturnValue({
      isInitialized: true,
      user: { id: '1', roles: [], permissions: ['view'] },
    })

    renderWithRouter(
      <ProtectedRoute requireAuth permissions={['edit']}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
  })

  it('renders children when user has required role and permissions', () => {
    mockUseAuth.mockReturnValue({
      isInitialized: true,
      user: {
        id: '1',
        roles: ['ADMIN'],
        permissions: ['edit', 'view'],
      },
    })

    renderWithRouter(
      <ProtectedRoute
        requireAuth
        roles={['ADMIN']}
        permissions={['edit']}
      >
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('allows access when no roles or permissions are required', () => {
    mockUseAuth.mockReturnValue({
      isInitialized: true,
      user: { id: '1', roles: [], permissions: [] },
    })

    renderWithRouter(
      <ProtectedRoute requireAuth>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
}) 