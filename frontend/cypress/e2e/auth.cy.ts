import '@testing-library/cypress/add-commands'

describe('תהליכי אימות', () => {
  beforeEach(() => {
    // ניקוי ה-localStorage לפני כל בדיקה
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000')
  })

  describe('תהליך התחברות', () => {
    it('מאפשר למשתמש להתחבר בהצלחה', () => {
      cy.visit('/auth/login')
      
      // מילוי טופס התחברות
      cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      
      // שליחת הטופס
      cy.findByRole('button', { name: /התחבר/ }).click()
      
      // וידוא שהמשתמש הועבר לדף הבית
      cy.url().should('eq', 'http://localhost:3000/')
      
      // וידוא שהתצוגה מראה שהמשתמש מחובר
      cy.findByText(/פרופיל/).should('exist')
    })

    it('מציג שגיאה כאשר פרטי ההתחברות שגויים', () => {
      cy.visit('/auth/login')
      
      // מילוי טופס עם פרטים שגויים
      cy.findByLabelText(/דואר אלקטרוני/).type('wrong@example.com')
      cy.findByLabelText(/סיסמה/).type('WrongPassword123!')
      
      // שליחת הטופס
      cy.findByRole('button', { name: /התחבר/ }).click()
      
      // וידוא שמוצגת הודעת שגיאה
      cy.findByText(/פרטי התחברות שגויים/).should('exist')
    })
  })

  describe('תהליך הרשמה', () => {
    it('מאפשר למשתמש להירשם בהצלחה', () => {
      cy.visit('/auth/register')
      
      // מילוי טופס הרשמה
      cy.findByLabelText(/שם/).type('משתמש חדש')
      cy.findByLabelText(/דואר אלקטרוני/).type('newuser@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      cy.findByLabelText(/אימות סיסמה/).type('Password123!')
      
      // שליחת הטופס
      cy.findByRole('button', { name: /הירשם/ }).click()
      
      // וידוא שהמשתמש הועבר לדף אימות המייל
      cy.url().should('include', '/auth/verify-email')
      cy.findByText(/נשלח אליך מייל אימות/).should('exist')
    })

    it('מונע הרשמה עם סיסמה חלשה', () => {
      cy.visit('/auth/register')
      
      // מילוי טופס עם סיסמה חלשה
      cy.findByLabelText(/שם/).type('משתמש חדש')
      cy.findByLabelText(/דואר אלקטרוני/).type('newuser@example.com')
      cy.findByLabelText(/סיסמה/).type('weak')
      cy.findByLabelText(/אימות סיסמה/).type('weak')
      
      // שליחת הטופס
      cy.findByRole('button', { name: /הירשם/ }).click()
      
      // וידוא שמוצגת הודעת שגיאה על סיסמה חלשה
      cy.findByText(/הסיסמה חייבת להכיל לפחות 8 תווים/).should('exist')
    })
  })

  describe('תהליך איפוס סיסמה', () => {
    it('מאפשר למשתמש לבקש איפוס סיסמה', () => {
      cy.visit('/auth/forgot-password')
      
      // הזנת כתובת מייל
      cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
      
      // שליחת הטופס
      cy.findByRole('button', { name: /שלח/ }).click()
      
      // וידוא שמוצג אישור שליחת המייל
      cy.findByText(/הוראות לאיפוס הסיסמה נשלחו למייל שלך/).should('exist')
    })

    it('מאפשר למשתמש לאפס סיסמה עם טוקן תקין', () => {
      // סימולציה של טוקן תקין
      const validToken = 'valid-reset-token'
      cy.visit(`/auth/reset-password?token=${validToken}`)
      
      // הזנת סיסמה חדשה
      cy.findByLabelText(/סיסמה חדשה/).type('NewPassword123!')
      cy.findByLabelText(/אימות סיסמה/).type('NewPassword123!')
      
      // שליחת הטופס
      cy.findByRole('button', { name: /אפס סיסמה/ }).click()
      
      // וידוא שהסיסמה אופסה בהצלחה
      cy.findByText(/הסיסמה אופסה בהצלחה/).should('exist')
      cy.url().should('include', '/auth/login')
    })
  })

  describe('אימות דו-שלבי', () => {
    it('מאפשר למשתמש להפעיל אימות דו-שלבי', () => {
      // התחברות ראשונית
      cy.login('test@example.com', 'Password123!')
      
      // ניווט להגדרות אבטחה
      cy.visit('/profile/security')
      
      // הפעלת אימות דו-שלבי
      cy.findByRole('button', { name: /הפעל אימות דו-שלבי/ }).click()
      
      // וידוא שמוצג קוד QR
      cy.findByTestId('2fa-qr-code').should('exist')
      
      // הזנת קוד אימות
      cy.findByLabelText(/קוד אימות/).type('123456')
      
      // אישור הפעלה
      cy.findByRole('button', { name: /אשר/ }).click()
      
      // וידוא שהאימות הדו-שלבי הופעל
      cy.findByText(/אימות דו-שלבי פעיל/).should('exist')
    })

    it('דורש קוד אימות בהתחברות כאשר 2FA מופעל', () => {
      // התחברות עם משתמש שיש לו 2FA מופעל
      cy.visit('/auth/login')
      cy.findByLabelText(/דואר אלקטרוני/).type('2fa@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      cy.findByRole('button', { name: /התחבר/ }).click()
      
      // וידוא שמוצג מסך הזנת קוד אימות
      cy.findByText(/הזן קוד אימות/).should('exist')
      
      // הזנת קוד אימות
      cy.findByLabelText(/קוד אימות/).type('123456')
      cy.findByRole('button', { name: /אמת/ }).click()
      
      // וידוא שההתחברות הצליחה
      cy.url().should('eq', 'http://localhost:3000/')
    })
  })
}) 