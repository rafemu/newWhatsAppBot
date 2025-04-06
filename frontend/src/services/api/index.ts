import axios from 'axios';

// יצירת מופע Axios עם הגדרות ברירת מחדל
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// הוספת האינטרספטור לבקשות
api.interceptors.request.use(
  (config) => {
    // הוספת טוקן אם קיים
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// הוספת האינטרספטור לתשובות
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // טיפול בשגיאות 401
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // שימוש ב-setTimeout כדי למנוע ריענון מעגלי
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 100);
    }
    return Promise.reject(error);
  }
);

export { api };

class ApiService {
  private api: typeof api;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // שימוש ב-setTimeout כדי למנוע ריענון מעגלי
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 100);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, name: string) {
    const response = await this.api.post('/auth/register', { email, password, name });
    return response.data;
  }

  async logout() {
    localStorage.removeItem('token');
  }

  // Sessions endpoints
  async getSessions() {
    const response = await this.api.get('/sessions');
    return response.data;
  }

  async createSession(name: string, description?: string, autoReconnect: boolean = true) {
    const response = await this.api.post('/sessions/init', { 
      name, 
      description,
      autoReconnect 
    });
    return response.data;
  }

  async getSessionById(sessionId: string) {
    const response = await this.api.get(`/sessions/${sessionId}`);
    return response.data;
  }

  async getSessionStatus(sessionId: string) {
    const response = await this.api.get(`/sessions/status/${sessionId}`);
    return response.data;
  }

  async logoutSession(sessionId: string) {
    const response = await this.api.post(`/sessions/logout/${sessionId}`);
    return response.data;
  }

  async deleteSession(sessionId: string) {
    const response = await this.api.delete(`/sessions/${sessionId}`);
    return response.data;
  }

  async updateSessionSettings(sessionId: string, settings: any) {
    const response = await this.api.put(`/sessions/${sessionId}/settings`, settings);
    return response.data;
  }

  // Conversations endpoints
  async getConversations() {
    const response = await this.api.get('/conversations');
    return response.data;
  }

  async sendMessage(conversationId: string, content: string, type: string = 'text') {
    const response = await this.api.post(`/conversations/${conversationId}/messages`, {
      content,
      type,
    });
    return response.data;
  }

  // User management endpoints
  async getUsers() {
    const response = await this.api.get('/auth/users');
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.api.get(`/auth/users/${id}`);
    return response.data;
  }

  async createUser(userData: { email: string; password: string; name: string; role: string }) {
    const response = await this.api.post('/auth/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: { name?: string; email?: string }) {
    const response = await this.api.patch(`/auth/users/${id}`, userData);
    return response.data;
  }

  async updateUserRole(id: string, role: string) {
    const response = await this.api.patch(`/auth/users/${id}/role`, { role });
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete(`/auth/users/${id}`);
    return response.data;
  }

  async resetPassword(email: string) {
    const response = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  // WhatsApp devices endpoints
  async getDevices(sessionId: string) {
    console.log(`Getting devices for session: ${sessionId}`);
    const response = await this.api.get(`/sessions/${sessionId}/devices`);
    console.log('Devices response:', response.data);
    return response.data;
  }

  async addDevice(sessionId: string, deviceData: { name: string }) {
    console.log(`Adding device for session: ${sessionId}, data:`, deviceData);
    // שינוי מבנה האובייקט כדי להתאים לשרת
    const response = await this.api.post(`/sessions/${sessionId}/devices`, { 
      deviceName: deviceData.name 
    });
    console.log('Add device response:', response.data);
    return response.data;
  }

  async getQRCode(sessionId: string, deviceId: string) {
    console.log(`Getting QR code for device: ${deviceId} in session: ${sessionId}`);
    try {
      // ניסיון לקבל QR דרך הנתיב הרגיל
      const response = await this.api.get(`/sessions/${sessionId}/devices/${deviceId}/qr`);
      console.log('QR code regular response:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log('Device QR not found, trying legacy endpoint...');
        
        // אם קיבלנו 404, ננסה את הנתיב הלגאסי
        const legacyResponse = await this.api.get(`/sessions/qr/${sessionId}`);
        console.log('QR code legacy response:', legacyResponse.data);
        return legacyResponse.data;
      }
      throw error;
    }
  }

  async refreshQR(sessionId: string, deviceId: string) {
    console.log(`Refreshing QR for device: ${deviceId} in session: ${sessionId}`);
    try {
      // ניסיון לרענן QR דרך הנתיב הרגיל
      const response = await this.api.post(`/sessions/${sessionId}/devices/${deviceId}/refresh-qr`);
      console.log('QR refresh regular response:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log('Device refresh QR endpoint not found, trying legacy endpoint...');
        
        // אם קיבלנו 404, ננסה את הנתיב הלגאסי
        const legacyResponse = await this.api.get(`/sessions/qr/${sessionId}`);
        console.log('QR refresh legacy response:', legacyResponse.data);
        return legacyResponse.data;
      }
      throw error;
    }
  }

  async logoutDevice(sessionId: string, deviceId: string) {
    console.log(`Logging out device: ${deviceId} from session: ${sessionId}`);
    const response = await this.api.post(`/sessions/${sessionId}/devices/${deviceId}/logout`);
    return response.data;
  }

  async removeDevice(sessionId: string, deviceId: string) {
    console.log(`Removing device: ${deviceId} from session: ${sessionId}`);
    const response = await this.api.delete(`/sessions/${sessionId}/devices/${deviceId}`);
    return response.data;
  }

  async getLegacyQRCode(sessionId: string) {
    console.log(`Getting legacy QR code for session: ${sessionId}`);
    const response = await this.api.get(`/sessions/qr/${sessionId}`);
    return response.data;
  }
}

export const apiService = new ApiService(); 