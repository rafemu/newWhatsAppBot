# תיעוד API - מודול אימות

## כללי
כל הנתיבים מתחילים ב-`/api/auth`

## נתיבים ציבוריים

### הרשמה
```http
POST /register
```

**גוף הבקשה:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "שם המשתמש"
}
```

**תגובה מוצלחת - 201:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "שם המשתמש",
      "role": "VIEWER"
    },
    "token": "JWT_TOKEN"
  }
}
```

### התחברות
```http
POST /login
```

**גוף הבקשה:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "שם המשתמש",
      "role": "VIEWER"
    },
    "token": "JWT_TOKEN"
  }
}
```

**תגובה עם 2FA מופעל - 200:**
```json
{
  "status": "success",
  "data": {
    "requiresTwoFactor": true,
    "tempToken": "TEMP_TOKEN"
  }
}
```

### אימות 2FA
```http
POST /verify-2fa
```

**גוף הבקשה:**
```json
{
  "token": "123456",
  "tempToken": "TEMP_TOKEN"
}
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "שם המשתמש",
      "role": "VIEWER"
    },
    "token": "JWT_TOKEN"
  }
}
```

### שכחתי סיסמה
```http
POST /forgot-password
```

**גוף הבקשה:**
```json
{
  "email": "user@example.com"
}
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "message": "הוראות לאיפוס סיסמה נשלחו לאימייל שלך"
}
```

### איפוס סיסמה
```http
POST /reset-password
```

**גוף הבקשה:**
```json
{
  "token": "RESET_TOKEN",
  "password": "NewPassword123!"
}
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "message": "הסיסמה שונתה בהצלחה"
}
```

## נתיבים מוגנים
דורשים הכללת טוקן JWT בכותרת הבקשה:
```http
Authorization: Bearer JWT_TOKEN
```

### קבלת פרטי המשתמש הנוכחי
```http
GET /me
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "שם המשתמש",
      "role": "VIEWER"
    }
  }
}
```

### עדכון פרטי משתמש
```http
PATCH /updateMe
```

**גוף הבקשה:**
```json
{
  "name": "שם חדש",
  "email": "newemail@example.com"
}
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "newemail@example.com",
      "name": "שם חדש",
      "role": "VIEWER"
    }
  }
}
```

### עדכון סיסמה
```http
PATCH /updatePassword
```

**גוף הבקשה:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "message": "הסיסמה עודכנה בהצלחה"
}
```

### יצירת 2FA
```http
GET /2fa/generate
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "data": {
    "qrCode": "QR_CODE_DATA_URL",
    "secret": "SECRET_KEY"
  }
}
```

### הפעלת 2FA
```http
POST /2fa/enable
```

**גוף הבקשה:**
```json
{
  "token": "123456"
}
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "message": "2FA הופעל בהצלחה"
}
```

### כיבוי 2FA
```http
POST /2fa/disable
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "message": "2FA כובה בהצלחה"
}
```

## נתיבי ניהול משתמשים
דורשים הרשאות מתאימות (ADMIN או SUPER_ADMIN)

### קבלת כל המשתמשים
```http
GET /users
```

**פרמטרים אופציונליים:**
- `page`: מספר העמוד (ברירת מחדל: 1)
- `limit`: מספר תוצאות בעמוד (ברירת מחדל: 10)
- `sort`: שדה למיון (לדוגמה: "name" או "-createdAt")

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "results": 10,
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "user@example.com",
        "name": "שם המשתמש",
        "role": "VIEWER"
      }
    ]
  }
}
```

### יצירת משתמש חדש
```http
POST /users
```

**גוף הבקשה:**
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "name": "שם המשתמש",
  "role": "AGENT"
}
```

**תגובה מוצלחת - 201:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "newuser@example.com",
      "name": "שם המשתמש",
      "role": "AGENT"
    }
  }
}
```

### עדכון תפקיד משתמש
```http
PATCH /users/:id/role
```

**גוף הבקשה:**
```json
{
  "role": "MANAGER"
}
```

**תגובה מוצלחת - 200:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "שם המשתמש",
      "role": "MANAGER"
    }
  }
}
```

## קודי שגיאה

- **400** - בקשה לא תקינה
- **401** - לא מורשה
- **403** - אין הרשאה מתאימה
- **404** - לא נמצא
- **429** - יותר מדי בקשות
- **500** - שגיאת שרת

## הערות אבטחה

1. **הגבלת קצב בקשות:**
   - נתיבי אימות: 5 בקשות ל-15 דקות
   - נתיבים כלליים: 100 בקשות ל-15 דקות

2. **דרישות סיסמה:**
   - אורך מינימלי: 8 תווים
   - חייבת להכיל: אות גדולה, אות קטנה, מספר ותו מיוחד

3. **אימות דו-שלבי:**
   - מומלץ להפעיל 2FA לאבטחה מוגברת
   - יש לשמור את קוד הגיבוי בעת הפעלת 2FA 