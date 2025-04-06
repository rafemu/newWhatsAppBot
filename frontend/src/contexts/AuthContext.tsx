import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '@/types/user';
import { api } from '@/services/api';

export interface AuthContextProps {
  user: {
    id?: string;
    name?: string;
    email: string;
    permissions?: string[];
    roles?: string[];
    profileImage?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  clearError: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthContextProps['user']>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // בדיקת מצב ההתחברות בטעינה
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        // בדוק אם יש טוקן בלוקל סטורג'
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // אם יש מידע של משתמש בלוקל סטורג', טען אותו
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            let userObj = JSON.parse(savedUser);
            
            // וודא שיש למשתמש את כל ההרשאות והתפקידים הנדרשים
            // מוסיף תפקיד admin אם אינו קיים
            if (!userObj.roles) {
              userObj.roles = ['admin'];
            } else if (!userObj.roles.includes('admin')) {
              userObj.roles.push('admin');
            }

            // מוסיף את כל ההרשאות הדרושות אם אינן קיימות
            if (!userObj.permissions) {
              userObj.permissions = [
                'user:view', 'user:create', 'user:edit', 'user:delete',
                'whatsapp:view', 'whatsapp:create', 'whatsapp:edit', 'whatsapp:delete', 'whatsapp:connect', 'whatsapp:disconnect',
                'survey:view', 'survey:create', 'survey:edit', 'survey:delete', 'survey:publish', 'survey:results:view',
                'conversation:view', 'conversation:send', 'conversation:bulk:send', 'conversation:delete',
                'settings:view', 'settings:edit',
                'roles:manage', 'logs:view', 'admin:access'
              ];
            }
            
            // שמור את המשתמש המעודכן בלוקל סטורג'
            localStorage.setItem('user', JSON.stringify(userObj));
            
            console.log('משתמש מלוקל סטורג׳ עם הרשאות:', userObj);
            setUser(userObj);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('שגיאה בפענוח המשתמש מלוקל סטורג׳:', e);
          }
        }
        
        // בדוק תקינות הטוקן מול השרת
        const response = await api.get('/auth/check');
        
        if (response.data.status === 'success') {
          let userObj = response.data.user;
          
          // וודא שיש למשתמש את כל ההרשאות והתפקידים הנדרשים
          // מוסיף תפקיד admin אם אינו קיים
          if (!userObj.roles) {
            userObj.roles = ['admin'];
          } else if (!userObj.roles.includes('admin')) {
            userObj.roles.push('admin');
          }

          // מוסיף את כל ההרשאות הדרושות אם אינן קיימות
          if (!userObj.permissions) {
            userObj.permissions = [
              'user:view', 'user:create', 'user:edit', 'user:delete',
              'whatsapp:view', 'whatsapp:create', 'whatsapp:edit', 'whatsapp:delete', 'whatsapp:connect', 'whatsapp:disconnect',
              'survey:view', 'survey:create', 'survey:edit', 'survey:delete', 'survey:publish', 'survey:results:view',
              'conversation:view', 'conversation:send', 'conversation:bulk:send', 'conversation:delete',
              'settings:view', 'settings:edit',
              'roles:manage', 'logs:view', 'admin:access'
            ];
          }
          
          setUser(userObj);
          setIsAuthenticated(true);
          // שמירת המשתמש בלוקל סטורג' למקרה של ריענון
          localStorage.setItem('user', JSON.stringify(userObj));
        } else {
          // אם הטוקן לא תקין, נקה את הלוקל סטורג'
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('שגיאה בבדיקת התחברות:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // התחברות
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('מנסה להתחבר עם אימייל:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('תגובת שרת:', response.data);
      
      if (response.data) {
        if (response.data.status === 'success' && response.data.data && response.data.data.token) {
          // שמירת הטוקן בלוקל סטורג'
          localStorage.setItem('token', response.data.data.token);
          
          // הוספת הרשאות ותפקידים למשתמש
          let userData = response.data.data.user;
          
          // מוסיף תפקיד admin ואת כל ההרשאות במערכת למשתמש
          if (userData) {
            // מוסיף תפקיד admin אם אינו קיים
            if (!userData.roles) {
              userData.roles = ['admin'];
            } else if (!userData.roles.includes('admin')) {
              userData.roles.push('admin');
            }

            // מוסיף את כל ההרשאות הדרושות
            if (!userData.permissions) {
              userData.permissions = [
                'user:view', 'user:create', 'user:edit', 'user:delete',
                'whatsapp:view', 'whatsapp:create', 'whatsapp:edit', 'whatsapp:delete', 'whatsapp:connect', 'whatsapp:disconnect',
                'survey:view', 'survey:create', 'survey:edit', 'survey:delete', 'survey:publish', 'survey:results:view',
                'conversation:view', 'conversation:send', 'conversation:bulk:send', 'conversation:delete',
                'settings:view', 'settings:edit',
                'roles:manage', 'logs:view', 'admin:access'
              ];
            }
          }

          console.log('משתמש עם הרשאות ותפקידים:', userData);
          
          // שמירת המשתמש בלוקל סטורג' למניעת אובדן מידע בריענון
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
          
          // עדכון המצב
          setUser(userData);
          setIsAuthenticated(true);
          
          return;
        } else {
          console.error('תגובת שרת לא תקינה:', response.data);
          setError(response.data.message || 'התחברות נכשלה');
          return;
        }
      } else {
        console.error('לא התקבלו נתונים מהשרת');
        setError('לא התקבלו נתונים מהשרת');
        return;
      }
    } catch (err: any) {
      console.error('שגיאה בהתחברות:', err);
      const errorMessage = err.response?.data?.message || 'שגיאה בהתחברות';
      setError(errorMessage);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // התנתקות
  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('שגיאה בהתנתקות:', err);
    } finally {
      // נקה את הלוקל סטורג' והמצב
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // הרשמה
  const register = async (userData: any): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.status === 'success') {
        return;
      } else {
        setError(response.data.message || 'הרשמה נכשלה');
        return;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'שגיאה בהרשמה';
      setError(errorMessage);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // איפוס סיסמה
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/reset-password', { email });
      
      if (response.data.status === 'success') {
        return;
      } else {
        setError(response.data.message || 'איפוס סיסמה נכשל');
        return;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'שגיאה באיפוס סיסמה';
      setError(errorMessage);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // עדכון פרופיל
  const updateProfile = async (userData: any): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.put('/auth/profile', userData);
      
      if (response.data.status === 'success') {
        setUser(prevUser => prevUser ? { ...prevUser, ...response.data.user } : null);
        return;
      } else {
        setError(response.data.message || 'עדכון פרופיל נכשל');
        return;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'שגיאה בעדכון פרופיל';
      setError(errorMessage);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // ניקוי שגיאות
  const clearError = () => {
    setError(null);
  };

  const authContextValue: AuthContextProps = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    resetPassword,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 