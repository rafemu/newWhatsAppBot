import { render, screen } from '@testing-library/react'
import { PermissionGuard } from '../PermissionGuard'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')

describe('PermissionGuard', () => {
  const mockUseAuth = useAuth as jest.Mock

  beforeEach(() => {
    mockUseAuth.mockReset()
  })

  it('renders children when user has all required permissions', () => {
    mockUseAuth.mockReturnValue({
      user: {
        permissions: ['permission1', 'permission2'],
      },
    })

    render(
      <PermissionGuard
        permissions={['permission1', 'permission2']}
        requireAll={true}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when user has at least one required permission', () => {
    mockUseAuth.mockReturnValue({
      user: {
        permissions: ['permission1'],
      },
    })

    render(
      <PermissionGuard
        permissions={['permission1', 'permission2']}
        requireAll={false}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders fallback when user lacks required permissions', () => {
    mockUseAuth.mockReturnValue({
      user: {
        permissions: ['permission3'],
      },
    })

    render(
      <PermissionGuard
        permissions={['permission1', 'permission2']}
        fallback={<div>Fallback Content</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.getByText('Fallback Content')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders fallback when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
    })

    render(
      <PermissionGuard
        permissions={['permission1']}
        fallback={<div>Fallback Content</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(screen.getByText('Fallback Content')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders null as fallback when no fallback is provided', () => {
    mockUseAuth.mockReturnValue({
      user: {
        permissions: ['permission3'],
      },
    })

    const { container } = render(
      <PermissionGuard permissions={['permission1']}>
        <div>Protected Content</div>
      </PermissionGuard>
    )

    expect(container.firstChild).toBeNull()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
}) 