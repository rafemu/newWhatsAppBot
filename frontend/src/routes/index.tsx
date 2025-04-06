import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Profile from '@/pages/profile/Profile'
import Unauthorized from '@/pages/error/Unauthorized'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PERMISSIONS } from '@/constants/permissions'

// Main pages
import Dashboard from '@/pages/Dashboard'
import WhatsAppSessions from '@/pages/whatsapp/Sessions'
import WhatsAppSession from '@/pages/whatsapp/Sessions'
import Settings from '@/pages/Settings'
import Permissions from '@/pages/admin/Permissions'
import Users from '@/pages/admin/Users'
import ActivityLogs from '@/pages/admin/ActivityLogs'

// Chat pages
import ChatManagement from '@/pages/chats/ChatManagement'
import NewChat from '@/pages/chats/NewChat'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute requireAuth>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requireAuth>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chats',
        children: [
          {
            path: '',
            element: (
              <ProtectedRoute requireAuth>
                <ChatManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requireAuth>
                <NewChat />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'whatsapp',
        children: [
          {
            path: '',
            element: (
              <ProtectedRoute
                requireAuth
                permissions={[PERMISSIONS.WHATSAPP_VIEW]}
              >
                <WhatsAppSessions />
              </ProtectedRoute>
            ),
          },
          {
            path: ':sessionId',
            element: (
              <ProtectedRoute
                requireAuth
                permissions={[PERMISSIONS.WHATSAPP_VIEW]}
              >
                <WhatsAppSession />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute requireAuth>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute
            requireAuth
            permissions={[PERMISSIONS.SETTINGS_VIEW]}
          >
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        children: [
          {
            path: 'permissions',
            element: (
              <ProtectedRoute
                requireAuth
                permissions={[PERMISSIONS.ROLES_MANAGE]}
              >
                <Permissions />
              </ProtectedRoute>
            ),
          },
          {
            path: 'users',
            element: (
              <ProtectedRoute
                requireAuth
                permissions={[PERMISSIONS.USER_VIEW]}
              >
                <Users />
              </ProtectedRoute>
            ),
          },
          {
            path: 'activity-logs',
            element: (
              <ProtectedRoute requireAuth roles={[PERMISSIONS.ROLES.ADMIN]}>
                <ActivityLogs />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <Login />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <Register />
          </ProtectedRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <ForgotPassword />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <ResetPassword />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

export default router 