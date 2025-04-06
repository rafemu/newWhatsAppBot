import '@testing-library/cypress/add-commands'

describe('בדיקות ביצועים', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000')
  })

  describe('זמני טעינה', () => {
    it('טוען את דף ההתחברות במהירות', () => {
      // מדידת זמן טעינת הדף
      cy.window().then((win) => {
        const performance = win.performance
        const navigationStart = performance.timing.navigationStart
        const loadEventEnd = performance.timing.loadEventEnd
        const loadTime = loadEventEnd - navigationStart
        
        // וידוא שזמן הטעינה קטן מ-3 שניות
        expect(loadTime).to.be.lessThan(3000)
      })
    })

    it('מגיב במהירות לפעולות משתמש', () => {
      cy.visit('/auth/login')
      
      // מדידת זמן התגובה להזנת טקסט
      const start = Date.now()
      cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
      cy.findByLabelText(/סיסמה/).type('Password123!')
      const end = Date.now()
      
      // וידוא שזמן התגובה קטן מ-100 מילישניות
      expect(end - start).to.be.lessThan(100)
    })
  })

  describe('ביצועי רשת', () => {
    it('ממזער את מספר בקשות הרשת', () => {
      cy.intercept('**').as('networkRequests')
      cy.visit('/auth/login')
      
      // ספירת מספר בקשות הרשת
      cy.get('@networkRequests.all').then((requests) => {
        // וידוא שמספר הבקשות סביר
        expect(requests.length).to.be.lessThan(10)
      })
    })

    it('שומר על גודל תגובה קטן', () => {
      cy.intercept('**').as('networkRequests')
      cy.visit('/auth/login')
      
      // בדיקת גודל התגובות
      cy.get('@networkRequests.all').then((requests) => {
        requests.forEach((req) => {
          if (req.response) {
            // וידוא שגודל התגובה קטן מ-100KB
            expect(req.response.body.length).to.be.lessThan(100 * 1024)
          }
        })
      })
    })
  })

  describe('ביצועי ממשק משתמש', () => {
    it('שומר על FPS תקין בזמן אנימציות', () => {
      cy.visit('/auth/login')
      
      // מדידת FPS בזמן אנימציה
      cy.window().then((win) => {
        let frames = 0
        const startTime = performance.now()
        
        const measureFPS = () => {
          frames++
          if (performance.now() - startTime >= 1000) {
            // וידוא שה-FPS גבוה מ-30
            expect(frames).to.be.greaterThan(30)
          } else {
            requestAnimationFrame(measureFPS)
          }
        }
        
        requestAnimationFrame(measureFPS)
      })
      
      // הפעלת אנימציה
      cy.findByRole('button', { name: /התחבר/ }).click()
    })

    it('מגיב במהירות לאירועי משתמש', () => {
      cy.visit('/auth/login')
      
      // מדידת זמן תגובה לאירועי משתמש
      cy.findByRole('button', { name: /התחבר/ }).then(($button) => {
        const start = performance.now()
        $button.click()
        const end = performance.now()
        
        // וידוא שזמן התגובה קטן מ-100 מילישניות
        expect(end - start).to.be.lessThan(100)
      })
    })
  })

  describe('ביצועי זיכרון', () => {
    it('שומר על שימוש זיכרון יציב', () => {
      cy.window().then((win) => {
        // מדידת שימוש בזיכרון לפני
        const initialMemory = win.performance.memory?.usedJSHeapSize
        
        // ביצוע פעולות רבות
        for (let i = 0; i < 100; i++) {
          cy.visit('/auth/login')
          cy.visit('/auth/register')
        }
        
        // מדידת שימוש בזיכרון אחרי
        const finalMemory = win.performance.memory?.usedJSHeapSize
        
        // וידוא שאין דליפת זיכרון משמעותית
        expect(finalMemory - initialMemory).to.be.lessThan(50 * 1024 * 1024) // פחות מ-50MB
      })
    })
  })

  describe('ביצועים בתנאי עומס', () => {
    it('מתמודד עם ריבוי בקשות במקביל', () => {
      // יצירת מספר רב של בקשות במקביל
      const requests = Array(10).fill(null).map(() => 
        cy.request({
          method: 'POST',
          url: '/api/auth/login',
          body: { email: 'test@example.com', password: 'Password123!' },
          failOnStatusCode: false
        })
      )
      
      // וידוא שכל הבקשות מטופלות כראוי
      Promise.all(requests).then((responses) => {
        responses.forEach((response) => {
          expect(response.status).to.be.oneOf([200, 429]) // OK או Too Many Requests
        })
      })
    })

    it('שומר על ביצועים תחת עומס משתמשים', () => {
      // סימולציה של פעילות משתמשים מרובה
      const userActions = Array(50).fill(null).map(() => {
        cy.visit('/auth/login')
        cy.findByLabelText(/דואר אלקטרוני/).type('test@example.com')
        cy.findByLabelText(/סיסמה/).type('Password123!')
        cy.findByRole('button', { name: /התחבר/ }).click()
        cy.visit('/auth/logout')
      })
      
      // מדידת זמן ביצוע כולל
      const start = performance.now()
      Promise.all(userActions).then(() => {
        const end = performance.now()
        const totalTime = end - start
        
        // וידוא שהזמן הכולל סביר
        expect(totalTime).to.be.lessThan(30000) // פחות מ-30 שניות
      })
    })
  })
}) 