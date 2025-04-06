# מדריך בדיקות - מערכת אימות משתמשים

## תוכן עניינים
1. [סקירה כללית](#סקירה-כללית)
2. [בדיקות יחידה](#בדיקות-יחידה)
3. [בדיקות אינטגרציה](#בדיקות-אינטגרציה)
4. [בדיקות E2E](#בדיקות-e2e)
5. [בדיקות ביצועים](#בדיקות-ביצועים)
6. [הרצת הבדיקות](#הרצת-הבדיקות)

## סקירה כללית

### מבנה הבדיקות
```
tests/
├── unit/
│   ├── hooks/
│   ├── components/
│   └── services/
├── integration/
│   ├── auth/
│   └── users/
├── e2e/
│   ├── auth.cy.ts
│   ├── security.cy.ts
│   ├── edge-cases.cy.ts
│   └── performance.cy.ts
└── utils/
    └── test-helpers.ts
```

### כלי בדיקה
- Jest: בדיקות יחידה ואינטגרציה
- React Testing Library: בדיקות קומפוננטות
- Cypress: בדיקות E2E וביצועים
- MSW: דימוי שירותי רשת

## בדיקות יחידה

### בדיקת Hooks
```typescript
describe('useAuth', () => {
  it('מחזיר את מצב האימות הנוכחי', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBeDefined()
  })
})
```

### בדיקת קומפוננטות
```typescript
describe('LoginForm', () => {
  it('מציג שגיאת אימות', async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /התחבר/ }))
    expect(await screen.findByText(/שדות חובה/)).toBeInTheDocument()
  })
})
```

### בדיקת שירותים
```typescript
describe('AuthService', () => {
  it('מחדש טוקן גישה', async () => {
    const response = await authService.refreshToken()
    expect(response.accessToken).toBeDefined()
  })
})
```

## בדיקות אינטגרציה

### הגדרת סביבת בדיקות
```typescript
beforeAll(() => {
  // אתחול בסיס נתונים לבדיקות
  setupTestDB()
  // הגדרת מדמי שירותי רשת
  setupMockServer()
})
```

### בדיקת תהליך אימות מלא
```typescript
describe('תהליך אימות', () => {
  it('משלים תהליך התחברות מלא', async () => {
    // התחברות
    const loginResponse = await authService.login(credentials)
    expect(loginResponse.success).toBe(true)
    
    // אימות הרשאות
    const userPermissions = await authService.getUserPermissions()
    expect(userPermissions).toContain('read:profile')
  })
})
```

## בדיקות E2E

### בדיקות אבטחה
```typescript
describe('אבטחה', () => {
  it('נועל חשבון לאחר ניסיונות כושלים', () => {
    // ניסיונות התחברות כושלים
    for (let i = 0; i < 5; i++) {
      cy.login({ shouldFail: true })
    }
    
    // וידוא נעילת חשבון
    cy.contains('החשבון ננעל זמנית')
  })
})
```

### בדיקות מקרי קצה
```typescript
describe('מקרי קצה', () => {
  it('מטפל בכשל רשת', () => {
    cy.intercept('POST', '/api/auth/login', {
      forceNetworkError: true
    })
    
    // ניסיון התחברות
    cy.contains('בעיית תקשורת')
  })
})
```

## בדיקות ביצועים

### מדדי ביצועים
- זמן טעינה: < 3 שניות
- זמן תגובה לפעולות: < 100ms
- שימוש זיכרון: < 50MB
- FPS בזמן אנימציות: > 30

### דוגמאות לבדיקות
```typescript
describe('ביצועים', () => {
  it('טוען דף במהירות', () => {
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - 
                      win.performance.timing.navigationStart
      expect(loadTime).to.be.lessThan(3000)
    })
  })
})
```

## הרצת הבדיקות

### בדיקות יחידה ואינטגרציה
```bash
# הרצת כל הבדיקות
npm test

# הרצת בדיקות ספציפיות
npm test auth
npm test users

# הרצה במצב צפייה
npm test:watch
```

### בדיקות E2E
```bash
# הרצת כל בדיקות E2E
npm run e2e

# הרצת קבוצת בדיקות ספציפית
npm run e2e:auth
npm run e2e:security

# הרצה במצב פיתוח
npm run e2e:dev
```

### בדיקות ביצועים
```bash
# הרצת בדיקות ביצועים
npm run test:performance

# יצירת דוח ביצועים
npm run test:performance:report
```

## תחזוקת בדיקות

### מיטוב בדיקות
1. שימוש ב-fixtures לנתוני בדיקה
2. ארגון בדיקות בקבוצות הגיוניות
3. שימוש בפקודות מותאמות אישית
4. הימנעות מכפילות קוד

### דיווח ותיעוד
1. שמירת דוחות בדיקה
2. תיעוד כיסוי קוד
3. מעקב אחר ביצועים
4. ניתוח מגמות

## פתרון בעיות נפוצות

### בדיקות נכשלות
1. בדיקת תלויות חסרות
2. וידוא מצב התחלתי נכון
3. בדיקת תזמון אסינכרוני
4. בדיקת מדמי שירותים

### בעיות ביצועים
1. זיהוי צווארי בקבוק
2. מיטוב שאילתות
3. צמצום עומס רשת
4. ייעול שימוש בזיכרון 