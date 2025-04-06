import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface RoleGuardProps {
  children: ReactNode
  roles: string[]
  fallback?: ReactNode
}

const RoleGuard = ({ children, roles, fallback = null }: RoleGuardProps) => {
  const { user } = useAuth()

  // אם אין משתמש מחובר, הצג את תוכן ברירת המחדל
  if (!user) {
    return fallback
  }

  // בדוק אם למשתמש יש לפחות אחד מהתפקידים הנדרשים
  const hasRequiredRole = roles.some((role) => user.roles.includes(role))

  // אם למשתמש אין הרשאה מתאימה, הצג את תוכן ברירת המחדל
  if (!hasRequiredRole) {
    return fallback
  }

  // אם למשתמש יש הרשאה מתאימה, הצג את התוכן המבוקש
  return <>{children}</>
}

export default RoleGuard 