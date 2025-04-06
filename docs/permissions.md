# מערכת הרשאות

## סקירה כללית
מערכת ההרשאות מאפשרת ניהול גישה מבוסס תפקידים והרשאות ספציפיות. המערכת מורכבת משני רבדים:
1. **תפקידים (Roles)** - קבוצות הרשאות מוגדרות מראש
2. **הרשאות (Permissions)** - הרשאות ספציפיות לפעולות במערכת

## תפקידים מובנים
- **SUPER_ADMIN**: גישה מלאה לכל הפעולות במערכת
- **ADMIN**: ניהול משתמשים, WhatsApp, סקרים והגדרות מערכת
- **MANAGER**: ניהול WhatsApp וסקרים, צפייה במשתמשים
- **AGENT**: שליחת הודעות WhatsApp וצפייה בסקרים
- **VIEWER**: צפייה בלבד ב-WhatsApp וסקרים

## הרשאות זמינות

### ניהול משתמשים
- `user:view`: צפייה במשתמשים
- `user:create`: יצירת משתמשים חדשים
- `user:edit`: עריכת פרטי משתמשים
- `user:delete`: מחיקת משתמשים

### WhatsApp
- `whatsapp:view`: צפייה בהודעות ושיחות
- `whatsapp:create`: יצירת שיחות חדשות
- `whatsapp:edit`: עריכת שיחות
- `whatsapp:delete`: מחיקת שיחות
- `whatsapp:send`: שליחת הודעות

### סקרים
- `survey:view`: צפייה בסקרים
- `survey:create`: יצירת סקרים חדשים
- `survey:edit`: עריכת סקרים
- `survey:delete`: מחיקת סקרים
- `survey:publish`: פרסום סקרים
- `survey:results:view`: צפייה בתוצאות סקרים

### הגדרות מערכת
- `settings:view`: צפייה בהגדרות
- `settings:edit`: עריכת הגדרות

### ניהול
- `admin:access`: גישה לממשק הניהול
- `roles:manage`: ניהול תפקידים והרשאות
- `permissions:manage`: ניהול הרשאות ספציפיות

## שימוש בקומפוננטות אבטחה

### PermissionGuard
קומפוננטה לבדיקת הרשאות ברמת ה-UI:

```tsx
<PermissionGuard
  permissions={['user:edit']}
  requireAll={false}
  fallback={<AccessDenied />}
>
  <EditUserForm />
</PermissionGuard>
```

### ProtectedRoute
קומפוננטה להגנה על נתיבים:

```tsx
<ProtectedRoute
  requireAuth
  roles={['ADMIN']}
  permissions={['settings:edit']}
>
  <SettingsPage />
</ProtectedRoute>
```

## בדיקת הרשאות בקוד

### שימוש בפונקציית העזר hasPermission
```typescript
import { hasPermission } from '@/constants/permissions'

const canEditUser = hasPermission(
  user.permissions,
  ['user:edit'],
  false // requireAll
)
```

## תהליך הוספת הרשאה חדשה
1. הוסף את ההרשאה ל-`PERMISSIONS` ב-`permissions.ts`
2. עדכן את מיפוי התפקידים ב-`ROLE_PERMISSIONS`
3. הוסף את ההרשאה לממשק הניהול
4. עדכן את התיעוד

## שיקולי אבטחה
1. **שכבות הגנה**: יש לבצע בדיקות הרשאה הן בצד הלקוח והן בצד השרת
2. **Principle of Least Privilege**: יש להעניק למשתמשים את ההרשאות המינימליות הנדרשות
3. **אימות כפול**: פעולות רגישות דורשות אימות נוסף
4. **תיעוד**: כל פעולות הניהול מתועדות במערכת

## בדיקות
- בדיקות יחידה לקומפוננטות האבטחה
- בדיקות אינטגרציה לתהליכי הרשאות
- בדיקות E2E לתרחישי הרשאות מורכבים 