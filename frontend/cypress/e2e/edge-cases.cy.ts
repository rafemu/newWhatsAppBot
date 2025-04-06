import '@testing-library/cypress/add-commands'

describe('מקרי קצה', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000')
  })

  describe('התנהגות בתנאי רשת', () => {
    it('מטפל בכישלון רשת בזמן התחברות', () => {
      cy.visit('/auth/login')
      
      // סימולציה של כישלון רשת
      cy.intercept('POST', '/api/auth/login', {
        forceNetworkError: true
      }).as('loginRequest')
      
      // ניסיון התחברות
      cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      cy.findByRole('button', { name: /התחבר/ }).click()
      
      // וידוא שמוצגת הודעת שגיאה מתאימה
      cy.findByText(/בעיית תקשורת/).should('exist')
    })

    it('מטפל בתגובה איטית מהשרת', () => {
      cy.visit('/auth/login')
      
      // סימולציה של תגובה איטית
      cy.intercept('POST', '/api/auth/login', (req) => {
        req.on('response', (res) => {
          res.setDelay(5000)
        })
      }).as('slowLogin')
      
      // ניסיון התחברות
      cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      cy.findByRole('button', { name: /התחבר/ }).click()
      
      // וידוא שמוצג מצב טעינה
      cy.findByRole('progressbar').should('exist')
    })
  })

  describe('טיפול בקלט משתמש חריג', () => {
    it('מטפל בקלט ארוך במיוחד', () => {
      cy.visit('/auth/register')
      
      // יצירת מחרוזת ארוכה
      const longInput = 'a'.repeat(1000)
      
      // ניסיון להזין קלט ארוך
      cy.findByLabelText(/שם/).type(longInput)
      cy.findByRole('button', { name: /הירשם/ }).click()
      
      // וידוא שמוצגת הודעת שגיאה
      cy.findByText(/השם ארוך מדי/).should('exist')
    })

    it('מטפל בתווים מיוחדים', () => {
      cy.visit('/auth/register')
      
      // קלט עם תווים מיוחדים
      const specialChars = '!@#$%^&*()+<>?'
      cy.findByLabelText(/שם/).type(specialChars)
      cy.findByRole('button', { name: /הירשם/ }).click()
      
      // וידוא שמוצגת הודעת שגיאה
      cy.findByText(/השם מכיל תווים לא חוקיים/).should('exist')
    })
  })

  describe('מצבי מערכת מורכבים', () => {
    it('מטפל בפקיעת סשן בזמן פעולה', () => {
      cy.login('test@example.com', 'Password123!')
      
      // סימולציה של פקיעת סשן
      cy.clock().then((clock) => {
        clock.tick(24 * 60 * 60 * 1000) // קידום ב-24 שעות
      })
      
      // ניסיון לבצע פעולה
      cy.visit('/profile')
      cy.findByRole('button', { name: /עדכן פרטים/ }).click()
      
      // וידוא שהמשתמש מועבר להתחברות
      cy.url().should('include', '/auth/login')
      cy.findByText(/פג תוקף הסשן/).should('exist')
    })

    it('מטפל בהתחברות מרובת מכשירים', () => {
      // התחברות ראשונה
      cy.login('test@example.com', 'Password123!')
      
      // סימולציה של התחברות ממכשיר אחר
      cy.request('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'Password123!',
        deviceId: 'device2'
      })
      
      // רענון הדף
      cy.reload()
      
      // וידוא שמוצגת התראה על התחברות ממכשיר אחר
      cy.findByText(/התחברות זוהתה ממכשיר אחר/).should('exist')
    })
  })

  describe('טיפול בשגיאות API', () => {
    it('מטפל בשגיאות שרת לא צפויות', () => {
      cy.visit('/auth/login')
      
      // סימולציה של שגיאת שרת
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('serverError')
      
      // ניסיון התחברות
      cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      cy.findByRole('button', { name: /התחבר/ }).click()
      
      // וידוא שמוצגת הודעת שגיאה מתאימה
      cy.findByText(/שגיאת מערכת/).should('exist')
    })

    it('מטפל בתגובות API לא תקינות', () => {
      cy.visit('/auth/login')
      
      // סימולציה של תגובה לא תקינה
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: 'Invalid JSON'
      }).as('invalidResponse')
      
      // ניסיון התחברות
      cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      cy.findByRole('button', { name: /התחבר/ }).click()
      
      // וידוא שמוצגת הודעת שגיאה מתאימה
      cy.findByText(/תגובה לא תקינה מהשרת/).should('exist')
    })
  })
}) 