import { ActivityLog, ActivityType, ActivityAction, ActivityStatus, ActivityLogFilters } from '@/types/activity'
import { api } from '@/services/api'

class ActivityLogService {
  private static instance: ActivityLogService

  private constructor() {}

  public static getInstance(): ActivityLogService {
    if (!ActivityLogService.instance) {
      ActivityLogService.instance = new ActivityLogService()
    }
    return ActivityLogService.instance
  }

  async createLog(
    type: ActivityType,
    action: ActivityAction,
    details?: Record<string, any>,
    targetId?: string,
    targetType?: string
  ): Promise<void> {
    try {
      // קריאה לשרת ליצירת לוג
      await api.post('/activity-logs', {
        userId: '1', // אידיאלית צריך לקחת את מזהה המשתמש הנוכחי
        username: 'משתמש נוכחי', // אידיאלית צריך לקחת את שם המשתמש הנוכחי
        type,
        action,
        details: details ? JSON.stringify(details) : '',
        targetId,
        targetType,
        status: ActivityStatus.SUCCESS
      });
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }
  }

  async getLogs(filters: ActivityLogFilters = {}): Promise<ActivityLog[]> {
    try {
      // קריאה לשרת לקבלת לוגים
      const response = await api.get('/activity-logs', { params: filters });
      
      // טיפול בתשובה מהשרת
      if (response.status === 200 && response.data.status === 'success') {
        return response.data.data.logs || [];
      } else {
        console.error('Unexpected server response:', response);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return [];
    }
  }

  async getLogById(id: string): Promise<ActivityLog | null> {
    try {
      // קריאה לשרת לקבלת לוג לפי מזהה
      const response = await api.get(`/activity-logs/${id}`);
      
      // טיפול בתשובה מהשרת
      if (response.status === 200 && response.data.status === 'success') {
        return response.data.data.log || null;
      } else {
        console.error('Unexpected server response:', response);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
      return null;
    }
  }

  async deleteLog(id: string): Promise<boolean> {
    try {
      // קריאה לשרת למחיקת לוג
      const response = await api.delete(`/activity-logs/${id}`);
      
      // טיפול בתשובה מהשרת
      return response.status === 200 && response.data.status === 'success';
    } catch (error) {
      console.error(`Failed to delete activity log ${id}:`, error);
      return false;
    }
  }

  async clearLogs(before?: string): Promise<boolean> {
    try {
      // קריאה לשרת לניקוי לוגים
      const params = before ? { before } : {};
      const response = await api.delete('/activity-logs', { params });
      
      // טיפול בתשובה מהשרת
      return response.status === 200 && response.data.status === 'success';
    } catch (error) {
      console.error('Failed to clear activity logs:', error);
      return false;
    }
  }

  async addLog(logData: Partial<ActivityLog>): Promise<ActivityLog | null> {
    try {
      // קריאה לשרת להוספת לוג
      const response = await api.post('/activity-logs', {
        userId: logData.userId || '1',
        username: logData.username || 'משתמש נוכחי',
        type: logData.type || ActivityType.SYSTEM,
        action: logData.action || ActivityAction.CREATE,
        details: logData.details || '',
        targetId: logData.targetId,
        targetType: logData.targetType,
        status: logData.status || ActivityStatus.SUCCESS,
        errorMessage: logData.errorMessage,
      });
      
      // טיפול בתשובה מהשרת
      if (response.status === 201 && response.data.status === 'success') {
        return response.data.data.log || null;
      } else {
        console.error('Unexpected server response:', response);
        return null;
      }
    } catch (error) {
      console.error('Failed to add activity log:', error);
      return null;
    }
  }
}

export const activityLogService = ActivityLogService.getInstance();

// הוק לשימוש בלוגים
export const useActivityLog = () => {
  const logActivity = async (
    type: ActivityType,
    action: ActivityAction,
    details?: Record<string, any>,
    targetId?: string,
    targetType?: string
  ) => {
    await activityLogService.createLog(type, action, details, targetId, targetType);
  }

  return { logActivity };
} 