import { useContext, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { hasPermission } from '@/constants/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  permissions?: string[];
  roles?: string[];
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  permissions = [], 
  roles = [],
  redirectTo = "/auth/login"
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();

  // הוספת לוג שיעזור לדבג הרשאות
  console.log('ProtectedRoute - User permissions:', user?.permissions);
  console.log('ProtectedRoute - Required permissions:', permissions);
  console.log('ProtectedRoute - Required roles:', roles);
  console.log('ProtectedRoute - Is authenticated:', isAuthenticated);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // אם נדרשת התחברות ולא מחובר - מעביר לעמוד התחברות
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // אם לא נדרשת התחברות והמשתמש מחובר - מעביר לנתיב שהוגדר
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // אם יש הרשאות או תפקידים נדרשים, וחובה להיות מחובר
  if (requireAuth && isAuthenticated && (permissions.length > 0 || roles.length > 0)) {
    const userPermissions = user?.permissions || [];
    const userRoles = user?.roles || [];

    // בדיקה האם יש למשתמש את ההרשאות הנדרשות
    const hasRequiredPermissions = permissions.length === 0 || 
                                 hasPermission(userPermissions, permissions);
    
    // בדיקה האם יש למשתמש את התפקידים הנדרשים
    const hasRequiredRoles = roles.length === 0 || 
                           roles.some(role => userRoles.includes(role));

    // אם אין הרשאות או תפקידים נדרשים - מעביר לעמוד 'אין הרשאה'
    if (!hasRequiredPermissions || !hasRequiredRoles) {
      console.log('User does not have required permissions or roles');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 