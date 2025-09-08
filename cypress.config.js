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
        token: 'test_TK071VfkSwCGN0wgZKt_vs43JUd3oxdyAu2J3JAaaL_ZGcYFygAG-cC-GvRq7TGC',
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
