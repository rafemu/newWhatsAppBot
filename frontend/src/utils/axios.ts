import axios from 'axios'
import { authService } from '@/services/auth'

// יצירת מופע Axios עם הגדרות ברירת מחדל
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// הוספת טוקן לכל בקשה
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = authService.getAccessToken()
    
    if (accessToken) {
      // בדיקה אם הטוקן פג תוקף
      if (authService.isTokenExpired(accessToken)) {
        try {
          // ניסיון לרענן את הטוקן
          const newAccessToken = await authService.refreshAccessToken()
          config.headers.Authorization = `Bearer ${newAccessToken}`
        } catch (error) {
          // אם נכשל רענון הטוקן, ננקה את הטוקנים ונחזיר את הבקשה ללא טוקן
          authService.clearTokens()
          return config
        }
      } else {
        // אם הטוקן תקף, נוסיף אותו לבקשה
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// טיפול בשגיאות תשובה
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // אם קיבלנו שגיאת 401 ואין זה ניסיון חוזר
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // ניסיון לרענן את הטוקן
        const newAccessToken = await authService.refreshAccessToken()
        
        // עדכון הטוקן בבקשה המקורית
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        
        // שליחת הבקשה המקורית שוב
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // אם נכשל רענון הטוקן, ננקה את הטוקנים
        authService.clearTokens()
        
        // הפניה לדף ההתחברות
        window.location.href = '/auth/login'
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ייצוא ברירת מחדל כדי לתמוך בייבוא סטנדרטי
export default axiosInstance; 