import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // פונקציה לבדיקה האם למשתמש יש הרשאה מסוימת
  const hasPermission = (permission: string): boolean => {
    if (!context.user) return false;
    return context.user.permissions?.includes(permission) || false;
  };

  // פונקציה לבדיקה האם למשתמש יש תפקיד מסוים
  const hasRole = (role: string): boolean => {
    if (!context.user) return false;
    return context.user.roles?.includes(role) || false;
  };

  return {
    ...context,
    hasPermission,
    hasRole,
  };
}; 