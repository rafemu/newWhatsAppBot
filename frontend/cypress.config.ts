import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // הגדרת אירועים מותאמים אישית
    },
  },
  
  // הגדרות סביבה
  env: {
    apiUrl: 'http://localhost:3000/api',
  },
  
  // הגדרת התנהגות הבדיקות
  retries: {
    runMode: 2,
    openMode: 0,
  },
  
  // הגדרות צילומי מסך
  screenshotsFolder: 'cypress/screenshots',
  
  // הגדרות וידאו
  videosFolder: 'cypress/videos',
  
  // הגדרות דיווח
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
}) 