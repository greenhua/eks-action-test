const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    overwrite: false,
    html: false,
    json: true,
    timestamp: "mmddyyyy_HHMMss"
  },
  e2e: {
    setupNodeEvents(on, config) {
      const mochawesome = require("cypress-mochawesome-reporter/plugin");
      mochawesome(on);
      
      // Генерация JSON после каждого запуска
      on('after:run', async (results) => {
        console.log('Cypress run finished, results available for report upload.');
      });
    
      return config;
    },
    baseUrl: "https://wikipedia.org",
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720
  },
});
