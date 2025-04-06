// הרשאות כלליות
export const PERMISSIONS = {
  // הרשאות משתמשים
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',

  // הרשאות וואטסאפ
  WHATSAPP_VIEW: 'whatsapp:view',
  WHATSAPP_CREATE: 'whatsapp:create',
  WHATSAPP_EDIT: 'whatsapp:edit',
  WHATSAPP_DELETE: 'whatsapp:delete',
  WHATSAPP_CONNECT: 'whatsapp:connect',
  WHATSAPP_DISCONNECT: 'whatsapp:disconnect',

  // הרשאות סקרים
  SURVEY_VIEW: 'survey:view',
  SURVEY_CREATE: 'survey:create',
  SURVEY_EDIT: 'survey:edit',
  SURVEY_DELETE: 'survey:delete',
  SURVEY_PUBLISH: 'survey:publish',
  SURVEY_RESULTS_VIEW: 'survey:results:view',

  // הרשאות שיחות
  CONVERSATION_VIEW: 'conversation:view',
  CONVERSATION_SEND: 'conversation:send',
  CONVERSATION_BULK_SEND: 'conversation:bulk:send',
  CONVERSATION_DELETE: 'conversation:delete',

  // הרשאות הגדרות
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // הרשאות ניהול מערכת
  ROLES_MANAGE: 'roles:manage',
  LOGS_VIEW: 'logs:view',
  ADMIN_ACCESS: 'admin:access',

  // תפקידים
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    AGENT: 'agent',
    VIEWER: 'viewer',
  }
} as const

// מיפוי הרשאות לפי תפקידים
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.WHATSAPP_VIEW,
    PERMISSIONS.WHATSAPP_CREATE,
    PERMISSIONS.WHATSAPP_EDIT,
    PERMISSIONS.WHATSAPP_DELETE,
    PERMISSIONS.WHATSAPP_CONNECT,
    PERMISSIONS.WHATSAPP_DISCONNECT,
    PERMISSIONS.SURVEY_VIEW,
    PERMISSIONS.SURVEY_CREATE,
    PERMISSIONS.SURVEY_EDIT,
    PERMISSIONS.SURVEY_DELETE,
    PERMISSIONS.SURVEY_PUBLISH,
    PERMISSIONS.SURVEY_RESULTS_VIEW,
    PERMISSIONS.CONVERSATION_VIEW,
    PERMISSIONS.CONVERSATION_SEND,
    PERMISSIONS.CONVERSATION_BULK_SEND,
    PERMISSIONS.CONVERSATION_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],
  MANAGER: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.WHATSAPP_VIEW,
    PERMISSIONS.WHATSAPP_CREATE,
    PERMISSIONS.WHATSAPP_EDIT,
    PERMISSIONS.WHATSAPP_CONNECT,
    PERMISSIONS.WHATSAPP_DISCONNECT,
    PERMISSIONS.SURVEY_VIEW,
    PERMISSIONS.SURVEY_CREATE,
    PERMISSIONS.SURVEY_EDIT,
    PERMISSIONS.SURVEY_PUBLISH,
    PERMISSIONS.SURVEY_RESULTS_VIEW,
    PERMISSIONS.CONVERSATION_VIEW,
    PERMISSIONS.CONVERSATION_SEND,
    PERMISSIONS.CONVERSATION_BULK_SEND,
    PERMISSIONS.CONVERSATION_DELETE,
  ],
  AGENT: [
    PERMISSIONS.WHATSAPP_VIEW,
    PERMISSIONS.WHATSAPP_CONNECT,
    PERMISSIONS.WHATSAPP_DISCONNECT,
    PERMISSIONS.SURVEY_VIEW,
    PERMISSIONS.SURVEY_RESULTS_VIEW,
    PERMISSIONS.CONVERSATION_VIEW,
    PERMISSIONS.CONVERSATION_SEND,
  ],
  VIEWER: [
    PERMISSIONS.WHATSAPP_VIEW,
    PERMISSIONS.SURVEY_VIEW,
    PERMISSIONS.SURVEY_RESULTS_VIEW,
    PERMISSIONS.CONVERSATION_VIEW,
  ],
} as const

// הוק עזר לבדיקת הרשאות
export const hasPermission = (
  userPermissions: string[] | undefined,
  requiredPermissions: string[],
  requireAll = false
): boolean => {
  if (!userPermissions) return false

  return requireAll
    ? requiredPermissions.every((permission) => userPermissions.includes(permission))
    : requiredPermissions.some((permission) => userPermissions.includes(permission))
} 