import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export interface PermissionGuardProps {
  children: ReactNode
  permissions?: string[]
  roles?: string[]
  redirectTo?: string
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  redirectTo = '/unauthorized',
}) => {
  const { user, hasPermission, hasRole } = useAuth()

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  // אם אין צורך בהרשאות או תפקידים מיוחדים
  if (permissions.length === 0 && roles.length === 0) {
    return <>{children}</>
  }

  // בדיקת הרשאות
  const hasRequiredPermission = permissions.length === 0 || 
    permissions.some(permission => hasPermission(permission))

  // בדיקת תפקידים
  const hasRequiredRole = roles.length === 0 || 
    roles.some(role => hasRole(role))

  // המשתמש חייב לענות על אחד מהתנאים: או שיש לו הרשאה או שיש לו תפקיד
  if (hasRequiredPermission || hasRequiredRole) {
    return <>{children}</>
  }

  // אם הגענו לכאן, למשתמש אין הרשאות מתאימות
  return <Navigate to={redirectTo} replace />
}

export default PermissionGuard 