const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://wikipedia.org",
    supportFile: false
  }
});

const reportportal = require('reportportal-agent-js-cypress');

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      reportportal(on, config, {
        token: 'test01_n-Y5rdGESZe1qIgv2lIiZqad9-N_8_uxE8E32D3fbiptV-pHdnyNhdFbHWp0MmeN/,
        endpoint: process.env.https://rp.bfx.elegenbio.com/,
        launch: 'Cypress Tests',
        project: 'eks-test',
        description: 'TSEST wikipedia.org'
      });
      return config;
    },
    baseUrl: 'https://wikipedia.org',
    supportFile: false
  }
};
