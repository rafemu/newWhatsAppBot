# הוראות להתקנת חיבור אמיתי ל-WhatsApp

כרגע המערכת פועלת במצב הדגמה (Mock) שמייצר קוד QR מדומה ומסמולציה את תהליך החיבור.
כדי לעבור למצב אמיתי שיאפשר סריקת QR אמיתי וחיבור לחשבון WhatsApp שלך, יש לבצע את הצעדים הבאים:

## 1. התקנת החבילות הדרושות

בתיקיית `backend` בפרויקט, הרץ את הפקודה הבאה:

```bash
npm install whatsapp-web.js qrcode puppeteer
```

## 2. החלפת מחלקת Mock במחלקה אמיתית

### יש שתי אפשרויות:

#### אפשרות 1: שימוש בקובץ RealWhatsAppClient.ts המוכן
1. בקובץ `backend/src/modules/sessions/services/RealWhatsAppClient.ts` נמצאת מחלקת `RealWhatsAppClient` מוכנה.
2. פתח את הקובץ והסר את ההערות מהקוד בפונקציית `constructor` ובפונקציית `initialize`
3. הוסף את השורה הבאה בתחילת הקובץ `whatsappService.ts`:
   ```typescript
   import { RealWhatsAppClient } from './RealWhatsAppClient';
   ```
4. שנה את הגדרת המשתנה `clientInstances` מ:
   ```typescript
   const clientInstances: Record<string, MockWhatsAppClient> = {};
   ```
   ל:
   ```typescript
   const clientInstances: Record<string, RealWhatsAppClient> = {};
   ```

#### אפשרות 2: שימוש בקוד המוערך בקובץ המקורי
בקובץ המקורי `backend/src/modules/sessions/services/whatsappService.ts` יש גרסה קודמת של המחלקה שהוסתרה בהערות. עדיף להימנע מהאפשרות הזו בגלל שגיאות תחביר שעלולות להתעורר.

### בכל מקרה, יש להחליף:

1. החלף כל מופע של `new MockWhatsAppClient` ל-`new RealWhatsAppClient`:
   - בפונקציית `addDevice`
   - בפונקציית `getDeviceQRCode`
   - בפונקציית `refreshDeviceQR`
   - בפונקציית `recreateDeviceClient`

## 3. הגדרות נוספות

1. **יצירת תיקיית אחסון**: צור תיקייה בשם `whatsapp-sessions` בתיקיית השורש של הפרויקט. זו התיקייה שבה יישמרו נתוני ההתחברות של המשתמשים:
```bash
mkdir -p backend/whatsapp-sessions
```

2. **הרשאות**: ודא שלתיקייה יש הרשאות כתיבה מתאימות:
```bash
chmod 755 backend/whatsapp-sessions
```

3. **התקנת Chromium**: WhatsApp-Web.js דורש דפדפן Chromium שירוץ ברקע. יש לוודא שיש לך התקנה של Chrome או Chromium במערכת.

במקרה של בעיות עם puppeteer, ייתכן שתצטרך להתקין חבילות נוספות (במיוחד בLinux):
```bash
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## 4. הערות חשובות

1. **אחסון הסשנים**: הקוד מוגדר לשמור את סשנים בתיקייה `./whatsapp-sessions`. ודא שהתיקייה קיימת והרשאות הכתיבה תקינות.

2. **איכות קוד ה-QR**: במקרה של בעיות סריקה, ניתן לשנות את הגדרות קוד ה-QR בפונקציה `setupEventListeners`.

3. **חיבור מרובה**: WhatsApp מגביל את מספר החיבורים המקבילים. אם אתה משתמש בכמה מכשירים, ודא שאתה לא חורג ממגבלות WhatsApp.

4. **תלות באינטרנט**: בניגוד למצב הדמו, החיבור האמיתי דורש חיבור אינטרנט יציב והפעלה של דפדפן Chromium ברקע. 