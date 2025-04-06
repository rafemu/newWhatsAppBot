# Frontend Application - WhatsApp Bot System

## טכנולוגיות
- React 18
- TypeScript
- Material UI / Chakra UI
- Zustand (State Management)
- React Query
- React Router
- Socket.io Client

## התקנה
```bash
cd frontend
npm install
```

## סקריפטים זמינים
```bash
npm start          # הרצת סביבת פיתוח
npm test          # הרצת טסטים
npm run build     # בניית גרסת ייצור
npm run lint      # בדיקת קוד
```

## מבנה תיקיות
```
src/
├── assets/                    # קבצים סטטיים
├── components/                # רכיבים משותפים
│   ├── ui/                   # רכיבי UI בסיסיים
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   ├── common/               # רכיבים משותפים
│   └── forms/                # רכיבי טפסים
├── features/                 # מודולים פונקציונליים
│   ├── auth/
│   ├── sessions/
│   ├── surveys/
│   └── conversations/
├── hooks/                    # Hooks מותאמים
├── services/                 # שירותי API
├── utils/                    # פונקציות עזר
├── contexts/                 # React Contexts
├── types/                    # TypeScript types
├── pages/                    # דפי האפליקציה
├── routes/                   # הגדרות ניתוב
└── store/                    # ניהול state
```

## קונבנציות קוד
- שימוש ב-TypeScript
- Functional Components
- Custom Hooks ללוגיקה משותפת
- תיעוד JSDoc לפונקציות ורכיבים

## סביבות
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

# מערכת אימות משתמשים - Frontend

מערכת אימות משתמשים מלאה הכוללת הרשמה, התחברות, ניהול הרשאות, וניהול משתמשים.

## תכונות

- התחברות והרשמת משתמשים
- התחברות באמצעות Google
- ניהול הרשאות מבוסס תפקידים
- ניהול פרופיל משתמש
- חידוש טוקן אוטומטי
- אבטחה מתקדמת
- בדיקות מקיפות
- CI/CD pipeline

## דרישות מערכת

- Node.js 20 ומעלה
- npm 9 ומעלה
- חשבון Firebase

## התקנה

1. התקן את התלויות:
```bash
npm install
```

2. העתק את קובץ הסביבה לדוגמה:
```bash
cp .env.example .env
```

3. הגדר את משתני הסביבה:
- צור פרויקט ב-Firebase Console
- הפעל את שירות האימות עם Google
- העתק את פרטי התצורה לקובץ `.env`

## הגדרת OAuth

1. הגדרת Firebase:
   - היכנס ל-Firebase Console
   - צור פרויקט חדש
   - הפעל את שירות האימות
   - הוסף את Google כספק אימות
   - העתק את פרטי התצורה

2. הגדרת Google OAuth:
   - היכנס ל-Google Cloud Console
   - צור פרויקט חדש
   - הפעל את Google Sign-In API
   - צור אישורי OAuth 2.0
   - הגדר את URI להפניה מחדש

3. עדכון קובץ הסביבה:
   - הוסף את פרטי התצורה של Firebase
   - הגדר את כתובת ה-API
   - הגדר את סביבת הפיתוח

## פיתוח

הרץ את הפרויקט במצב פיתוח:
```bash
npm start
```

## בדיקות

הרץ את כל הבדיקות:
```bash
npm test
```

בדיקות ספציפיות:
```bash
npm run test:unit        # בדיקות יחידה
npm run test:integration # בדיקות אינטגרציה
npm run test:e2e        # בדיקות E2E
npm run test:performance # בדיקות ביצועים
```

## פריסה

1. בנה את הפרויקט:
```bash
npm run build
```

2. העלה את תיקיית `build` לשרת האירוח שלך

## אבטחה

- כל הבקשות מאובטחות עם HTTPS
- טוקנים מאוחסנים בצורה מאובטחת
- הגנה מפני התקפות נפוצות
- נעילת חשבון לאחר ניסיונות כושלים

## תיעוד נוסף

- [מדריך API](docs/api.md)
- [הנחיות אבטחה](docs/security.md)
- [מדריך בדיקות](docs/testing.md)
- [מדריך פריסה](docs/deployment.md)

## תרומה

1. צור fork של הפרויקט
2. צור ענף חדש (`git checkout -b feature/amazing-feature`)
3. בצע commit לשינויים שלך (`git commit -m 'Add amazing feature'`)
4. דחוף לענף (`git push origin feature/amazing-feature`)
5. פתח בקשת משיכה

## רישיון

מופץ תחת רישיון MIT. ראה `LICENSE` למידע נוסף.

## יצירת קשר

שם הפרויקט - [קישור לפרויקט](https://github.com/username/project)

קישור לפרויקט: [https://github.com/username/project](https://github.com/username/project) 