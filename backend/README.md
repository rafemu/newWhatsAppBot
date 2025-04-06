# Backend Application - WhatsApp Bot System

## טכנולוגיות
- Node.js
- TypeScript
- Express/Nest.js
- MongoDB + Mongoose
- Socket.io
- Jest

## התקנה
```bash
cd backend
npm install
```

## סקריפטים זמינים
```bash
npm run dev        # הרצת סביבת פיתוח
npm test          # הרצת טסטים
npm run build     # קומפילציה
npm start         # הרצת שרת
```

## מבנה תיקיות
```
src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication module
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── routes/
│   ├── sessions/     # WhatsApp sessions
│   ├── surveys/      # Surveys management
│   └── conversations/# Chat management
├── shared/           # Shared code
│   ├── types/       # TypeScript types
│   ├── utils/       # Utility functions
│   └── middlewares/ # Express middlewares
├── database/         # Database configuration
├── config/           # App configuration
├── api/              # API routes
├── websocket/        # WebSocket handlers
└── services/         # External services
```

## סביבות
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

## API Documentation
- Swagger UI: `http://localhost:3000/api-docs`
- Postman Collection: `docs/postman/`

## מודולים עיקריים

### Auth Module
- JWT Authentication
- Role-based access control
- User management

### Sessions Module
- WhatsApp connection management
- QR code generation
- Session monitoring

### Surveys Module
- Survey creation and management
- List Messages support
- Response collection and analysis

### Conversations Module
- Real-time chat management
- Automated responses
- Message queueing 