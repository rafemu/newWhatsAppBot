import '@testing-library/cypress/add-commands'

describe('תרחישי אבטחה', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000')
  })

  describe('הגנה מפני ניסיונות התחברות כושלים', () => {
    it('נועל את החשבון לאחר מספר ניסיונות התחברות כושלים', () => {
      const maxAttempts = 5
      
      for (let i = 0; i < maxAttempts; i++) {
        cy.visit('/auth/login')
        cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
        cy.findByLabelText(/סיסמה/).type('WrongPassword!')
        cy.findByRole('button', { name: /התחבר/ }).click()
        
        if (i < maxAttempts - 1) {
          cy.findByText(/פרטי התחברות שגויים/).should('exist')
        }
      }
      
      // וידוא שהחשבון ננעל
      cy.findByText(/החשבון ננעל זמנית/).should('exist')
      
      // ניסיון התחברות נוסף צריך להיכשל
      cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      cy.findByRole('button', { name: /התחבר/ }).click()
      cy.findByText(/החשבון ננעל/).should('exist')
    })
  })

  describe('אבטחת טוקנים', () => {
    it('מחדש את הטוקן כאשר הוא פג תוקף', () => {
      // התחברות ראשונית
      cy.login('test@example.com', 'Password123!')
      
      // סימולציה של טוקן שפג תוקפו
      cy.clock().then((clock) => {
        clock.tick(3600000) // קידום הזמן בשעה
      })
      
      // ביצוע פעולה שדורשת אימות
      cy.visit('/profile')
      
      // וידוא שהטוקן התחדש והמשתמש עדיין מחובר
      cy.findByText(/פרופיל/).should('exist')
    })

    it('מנתק את המשתמש כאשר הרענון נכשל', () => {
      cy.login('test@example.com', 'Password123!')
      
      // סימולציה של טוקן רענון לא תקין
      localStorage.setItem('refreshToken', 'invalid-token')
      
      // סימולציה של טוקן שפג תוקפו
      cy.clock().then((clock) => {
        clock.tick(3600000)
      })
      
      // ניסיון גישה לדף מוגן
      cy.visit('/profile')
      
      // וידוא שהמשתמש הועבר לדף ההתחברות
      cy.url().should('include', '/auth/login')
    })
  })

  describe('הגנה מפני CSRF', () => {
    it('מוודא שבקשות POST כוללות טוקן CSRF', () => {
      cy.login('test@example.com', 'Password123!')
      
      // ניסיון לשנות סיסמה
      cy.visit('/profile/security')
      cy.findByLabelText(/סיסמה נוכחית/).type('Password123!')
      cy.findByLabelText(/סיסמה חדשה/).type('NewPassword123!')
      cy.findByLabelText(/אימות סיסמה/).type('NewPassword123!')
      
      // בדיקה שהבקשה כוללת את ה-header הנדרש
      cy.intercept('POST', '/api/auth/change-password').as('changePassword')
      cy.findByRole('button', { name: /שנה סיסמה/ }).click()
      cy.wait('@changePassword').then((interception) => {
        expect(interception.request.headers['x-csrf-token']).to.exist
      })
    })
  })

  describe('הגנה מפני XSS', () => {
    it('מסנן תוכן HTML זדוני בשדות קלט', () => {
      cy.visit('/auth/register')
      
      // ניסיון להזין קוד HTML זדוני
      const maliciousInput = '<script>alert("XSS")</script>'
      cy.findByLabelText(/שם/).type(maliciousInput)
      cy.findByRole('button', { name: /הירשם/ }).click()
      
      // וידוא שהתוכן סונן
      cy.get('script').should('not.exist')
    })
  })

  describe('הגנה על נתוני משתמש רגישים', () => {
    it('מסתיר מידע רגיש בממשק המשתמש', () => {
      cy.login('test@example.com', 'Password123!')
      cy.visit('/profile')
      
      // וידוא שהסיסמה לא מוצגת
      cy.findByText(/Password123/).should('not.exist')
      
      // וידוא שפרטי אימות דו-שלבי מוסתרים
      cy.findByTestId('2fa-secret').should('not.exist')
    })

    it('מוודא שמידע רגיש לא נשמר ב-localStorage', () => {
      cy.login('test@example.com', 'Password123!')
      
      // בדיקה שאין מידע רגיש ב-localStorage
      cy.window().then((window) => {
        const storage = window.localStorage
        expect(storage.getItem('password')).to.be.null
        expect(storage.getItem('2faSecret')).to.be.null
        
        // וידוא שהטוקנים מוצפנים
        const accessToken = storage.getItem('accessToken')
        expect(accessToken).to.not.include('password')
        expect(accessToken).to.not.include('secret')
      })
    })
  })

  describe('ניהול הרשאות', () => {
    it('מונע גישה למשאבים מוגנים ללא הרשאות מתאימות', () => {
      // התחברות כמשתמש רגיל
      cy.login('user@example.com', 'Password123!')
      
      // ניסיון גישה לדף ניהול משתמשים
      cy.visit('/admin/users')
      
      // וידוא שהגישה נמנעה
      cy.findByText(/אין לך הרשאות מתאימות/).should('exist')
      cy.url().should('eq', 'http://localhost:3000/')
    })

    it('מאפשר גישה למשאבים מוגנים עם הרשאות מתאימות', () => {
      // התחברות כמנהל
      cy.login('admin@example.com', 'AdminPass123!')
      
      // גישה לדף ניהול משתמשים
      cy.visit('/admin/users')
      
      // וידוא שהגישה התאפשרה
      cy.findByText(/ניהול משתמשים/).should('exist')
      cy.findByRole('table').should('exist')
    })
  })
}) 