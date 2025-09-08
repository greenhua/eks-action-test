const fs = require("fs");
const path = require("path");
const axios = require("axios");

const RP_ENDPOINT = 'https://rp.bfx.elegenbio.com/';
const RP_PROJECT = 'eks-test';
const RP_TOKEN = 'test_Plt1eiRYSJCS1MHQ0bnEQCYOXFrnxz1N7-iRLWI80My2gmckt8fSJy8P_BfS4tFJ';

if (!RP_ENDPOINT || !RP_PROJECT || !RP_TOKEN) {
  console.error("Set RP_ENDPOINT, RP_PROJECT and RP_TOKEN env variables");
  process.exit(1);
}

// Путь к JSON отчёту Mochawesome
const reportPath = path.resolve("cypress/reports/mochawesome.json");
if (!fs.existsSync(reportPath)) {
  console.error("Mochawesome report not found!");
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath));

(async () => {
  try {
    // Создаём запуск
    const launchResp = await axios.post(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch`,
      {
        name: "Cypress Tests",
        startTime: new Date().toISOString()
      },
      {
        headers: { Authorization: RP_TOKEN }
      }
    );

    const launchId = launchResp.data.id;

    // Можно здесь отправлять тесты из report.results, упрощённо:
    for (const test of report.results[0].suites) {
      // Для простого примера можно отправить только статус теста
      await axios.post(
        `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/item`,
        {
          launchId,
          name: test.title,
          startTime: new Date().toISOString(),
          status: test.tests.every(t => t.pass) ? "PASSED" : "FAILED"
        },
        { headers: { Authorization: RP_TOKEN } }
      );
    }

    // Завершаем запуск
    await axios.put(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch/${launchId}/finish`,
      { endTime: new Date().toISOString() },
      { headers: { Authorization: RP_TOKEN } }
    );

    console.log("Report uploaded to ReportPortal successfully!");
  } catch (err) {
    console.error(err.response?.data || err.message);
    process.exit(1);
  }
})();
