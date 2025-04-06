# מדריך פריסה - מערכת אימות משתמשים

## תוכן עניינים
1. [דרישות מקדימות](#דרישות-מקדימות)
2. [התקנה](#התקנה)
3. [תצורה](#תצורה)
4. [פריסה](#פריסה)
5. [ניטור ותחזוקה](#ניטור-ותחזוקה)
6. [פתרון בעיות](#פתרון-בעיות)

## דרישות מקדימות

### חומרה מינימלית
- מעבד: 2 ליבות
- זיכרון RAM: 4GB
- אחסון: 20GB SSD

### תוכנה
- Node.js 18.x ומעלה
- npm 8.x ומעלה
- MongoDB 5.x ומעלה
- Redis (עבור ניהול סשנים)
- NGINX או שרת פרוקסי הפוך דומה

### שירותי ענן (אופציונלי)
- שירות אחסון קבצים (למשל AWS S3)
- שירות דואר אלקטרוני (למשל SendGrid)

## התקנה

### 1. הכנת סביבת הפיתוח
```bash
# התקנת תלויות גלובליות
npm install -g pm2 typescript

# שכפול המאגר
git clone [repository-url]
cd [project-directory]

# התקנת תלויות הפרויקט
npm install

# בניית הפרויקט
npm run build
```

### 2. הגדרת משתני סביבה
יש ליצור קובץ `.env` בתיקיית השורש:

```env
# סביבה
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/auth-system

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-token-secret
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# 2FA
TWO_FACTOR_AUTH_SECRET=your-2fa-secret

# אבטחה
CSRF_SECRET=your-csrf-secret
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

## תצורה

### 1. הגדרת NGINX
יש ליצור קובץ תצורה חדש ב-`/etc/nginx/sites-available/auth-system`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. הגדרת SSL
```bash
# התקנת Certbot
sudo apt-get install certbot python3-certbot-nginx

# קבלת אישור SSL
sudo certbot --nginx -d your-domain.com
```

### 3. הגדרת MongoDB
```bash
# יצירת משתמש MongoDB
mongo admin
db.createUser({
  user: "authAdmin",
  pwd: "secure-password",
  roles: [{ role: "dbOwner", db: "auth-system" }]
})
```

## פריסה

### 1. הפעלת השירות
```bash
# הפעלה באמצעות PM2
pm2 start ecosystem.config.js

# וידוא שהשירות פועל
pm2 status

# הגדרת הפעלה אוטומטית בעת אתחול
pm2 startup
pm2 save
```

### 2. בדיקת תקינות
```bash
# בדיקת חיבור לשרת
curl -I https://your-domain.com

# בדיקת לוגים
pm2 logs auth-system
```

## ניטור ותחזוקה

### 1. ניטור ביצועים
- הגדרת התראות על שימוש במשאבים
- ניטור זמני תגובה
- מעקב אחר שגיאות ויוצאי דופן

### 2. גיבויים
```bash
# גיבוי בסיס הנתונים
mongodump --uri="mongodb://localhost:27017/auth-system" --out=/backup/$(date +%Y%m%d)

# גיבוי קבצי תצורה
cp .env /backup/env-$(date +%Y%m%d)
```

### 3. עדכונים
```bash
# עדכון המערכת
git pull
npm install
npm run build
pm2 reload auth-system
```

## פתרון בעיות

### בעיות נפוצות ופתרונן

#### 1. השירות לא מתחיל
- בדיקת לוגים: `pm2 logs auth-system`
- וידוא שכל משתני הסביבה מוגדרים
- בדיקת הרשאות תיקיות

#### 2. בעיות חיבור ל-MongoDB
- בדיקת סטטוס השירות: `systemctl status mongod`
- בדיקת חיבור: `mongo --eval "db.serverStatus()"`

#### 3. בעיות SSL
- בדיקת תוקף האישור: `certbot certificates`
- חידוש ידני: `certbot renew --force-renewal`

### רשימת בדיקה לפתרון בעיות
1. בדיקת לוגים
2. וידוא שכל השירותים פעילים
3. בדיקת חיבורי רשת
4. בדיקת הרשאות קבצים
5. בדיקת משתני סביבה

## תמיכה נוספת
- פתיחת issue במאגר GitHub
- פנייה לצוות התמיכה
- עיון בתיעוד API 