import { UserRole } from '../models/User';

// הגדרת סוגי הרשאות
export enum Permission {
  // הרשאות משתמשים
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',
  
  // הרשאות WhatsApp
  VIEW_SESSIONS = 'view_sessions',
  MANAGE_SESSIONS = 'manage_sessions',
  SEND_MESSAGES = 'send_messages',
  VIEW_MESSAGES = 'view_messages',
  
  // הרשאות סקרים
  VIEW_SURVEYS = 'view_surveys',
  CREATE_SURVEYS = 'create_surveys',
  EDIT_SURVEYS = 'edit_surveys',
  DELETE_SURVEYS = 'delete_surveys',
  VIEW_RESPONSES = 'view_responses',
  
  // הרשאות דוחות
  VIEW_REPORTS = 'view_reports',
  GENERATE_REPORTS = 'generate_reports',
  
  // הרשאות לוגים
  VIEW_LOGS = 'view_logs',
  MANAGE_LOGS = 'manage_logs',
  
  // הרשאות הגדרות מערכת
  VIEW_SETTINGS = 'view_settings',
  MANAGE_SETTINGS = 'manage_settings',
}

// הגדרת הרשאות ברירת מחדל לכל תפקיד
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission), // כל ההרשאות

  [UserRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_SESSIONS,
    Permission.MANAGE_SESSIONS,
    Permission.SEND_MESSAGES,
    Permission.VIEW_MESSAGES,
    Permission.VIEW_SURVEYS,
    Permission.CREATE_SURVEYS,
    Permission.EDIT_SURVEYS,
    Permission.DELETE_SURVEYS,
    Permission.VIEW_RESPONSES,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_SETTINGS,
    Permission.VIEW_LOGS,
    Permission.MANAGE_LOGS,
  ],

  [UserRole.MANAGER]: [
    Permission.VIEW_USERS,
    Permission.VIEW_SESSIONS,
    Permission.MANAGE_SESSIONS,
    Permission.SEND_MESSAGES,
    Permission.VIEW_MESSAGES,
    Permission.VIEW_SURVEYS,
    Permission.CREATE_SURVEYS,
    Permission.EDIT_SURVEYS,
    Permission.VIEW_RESPONSES,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_LOGS,
  ],

  [UserRole.AGENT]: [
    Permission.VIEW_SESSIONS,
    Permission.SEND_MESSAGES,
    Permission.VIEW_MESSAGES,
    Permission.VIEW_SURVEYS,
    Permission.VIEW_RESPONSES,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.VIEWER]: [
    Permission.VIEW_SESSIONS,
    Permission.VIEW_MESSAGES,
    Permission.VIEW_SURVEYS,
    Permission.VIEW_RESPONSES,
    Permission.VIEW_REPORTS,
  ],
};

// פונקציית עזר לבדיקת הרשאות
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole].includes(permission);
};

// פונקציית עזר לקבלת כל ההרשאות של תפקיד
export const getRolePermissions = (role: UserRole): Permission[] => {
  return rolePermissions[role];
}; 