const fs = require("fs");
const path = require("path");
const axios = require("axios");

const RP_ENDPOINT = 'https://rp.bfx.elegenbio.com';
const RP_PROJECT = 'eks-test';
const RP_TOKEN = '123_xnlAHqX5TnS5mSvXICcUDCHnRp6LuDdwyX_RpLzygIcimAUxfvqel_52sCQjg0yR';

if (!RP_ENDPOINT || !RP_PROJECT || !RP_TOKEN) {
  console.error("Set RP_ENDPOINT, RP_PROJECT and RP_TOKEN environment variables");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${RP_TOKEN}` };

// Рекурсивный поиск JSON файлов
function findJsonFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findJsonFiles(filePath));
    } else if (file.endsWith(".json")) {
      results.push(filePath);
    }
  });
  return results;
}

const reportsDir = path.resolve("cypress/reports");
const reportFiles = findJsonFiles(reportsDir);

if (reportFiles.length === 0) {
  console.log("No JSON report files found in reports directory:", reportsDir);
  process.exit(0);
}

console.log("Found report files:", reportFiles);

// Отправка launch и items в ReportPortal
async function uploadReport(filePath) {
  console.log("Uploading:", filePath);
  const report = JSON.parse(fs.readFileSync(filePath));

  try {
    // 1️⃣ Создаём launch
    const launchResp = await axios.post(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch`,
      {
        name: `Cypress Tests - ${path.basename(filePath)}`,
        startTime: new Date().toISOString()
      },
      { headers }
    );

    const launchUuid = launchResp.data.uuid;

    // 2️⃣ Создаём suites
    for (const suite of report.results[0].suites) {
      const suiteResp = await axios.post(
        `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/item`,
        {
          launchUuid,
          name: suite.title,
          type: "SUITE",
          startTime: new Date().toISOString(),
          status: suite.tests.every(t => t.pass) ? "PASSED" : "FAILED"
        },
        { headers }
      );

      const suiteUuid = suiteResp.data.uuid;

      // 3️⃣ Создаём тесты внутри suite
      for (const test of suite.tests) {
        await axios.post(
          `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/item`,
          {
            launchUuid,
            name: test.title,
            type: "TEST",
            startTime: new Date().toISOString(),
            status: test.pass ? "PASSED" : "FAILED",
            parentUuid: suiteUuid
          },
          { headers }
        );
      }
    }

    // 4️⃣ Завершаем launch
    await axios.put(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch/${launchUuid}/finish`,
      { endTime: new Date().toISOString() },
      { headers }
    );

    console.log("Report uploaded successfully:", filePath);

  } catch (err) {
    console.error("Error uploading report:", err.response?.data || err.message);
  }
}

// Загрузка всех файлов
(async () => {
  for (const file of reportFiles) {
    await uploadReport(file);
  }
})();
