# WhatsApp Bot Management System

## תיאור המערכת
מערכת לניהול ושליחת הודעות WhatsApp באופן אוטומטי, המאפשרת לנהל מספר חשבונות ותהליכי תקשורת במקביל, הפעלת סקרים אינטראקטיביים, ואינטגרציה עם מערכות CRM חיצוניות.

## מבנה המערכת
```
project-root/
├── frontend/           # React + TypeScript application
├── backend/           # Node.js + TypeScript application
├── epics/             # Project epics and documentation
└── docs/              # Additional documentation
```

## דרישות מערכת
- Node.js 18+
- MongoDB 6+
- Docker (אופציונלי)

## התקנה מהירה
```bash
# התקנת dependencies
cd frontend && npm install
cd ../backend && npm install

# הרצת סביבת פיתוח
# Terminal 1
cd frontend && npm start

# Terminal 2
cd backend && npm run dev
```

## קישורים מהירים
- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [Epics Documentation](./epics/README.md) 