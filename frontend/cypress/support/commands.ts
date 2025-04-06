import '@testing-library/cypress/add-commands'

// הרחבת הטיפוסים של Cypress
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * התחברות מהירה למערכת
       * @param email - כתובת דואר אלקטרוני
       * @param password - סיסמה
       */
      login(email: string, password: string): Chainable<void>

      /**
       * התנתקות מהמערכת
       */
      logout(): Chainable<void>

      /**
       * הגדרת מצב אימות דו-שלבי
       * @param enabled - האם להפעיל או לכבות
       */
      set2FAState(enabled: boolean): Chainable<void>
    }
  }
}

// פקודת התחברות מהירה
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login',
    body: { email, password },
  }).then((response) => {
    const { accessToken, refreshToken } = response.body
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  })
})

// פקודת התנתקות
Cypress.Commands.add('logout', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/logout',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  }).then(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  })
})

// פקודה להגדרת מצב אימות דו-שלבי
Cypress.Commands.add('set2FAState', (enabled: boolean) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/2fa/toggle',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: { enabled },
  })
}) 