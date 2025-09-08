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

// Рекурсивный поиск JSON файлов
function findJsonFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
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

async function uploadReport(filePath) {
  console.log("Uploading:", filePath);
  const report = JSON.parse(fs.readFileSync(filePath));

  const headers = { Authorization: `Bearer ${RP_TOKEN}` };

  try {
    // Создаём launch
    const launchResp = await axios.post(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch`,
      { name: path.basename(filePath), startTime: new Date().toISOString() },
      { headers }
    );

    const launchId = launchResp.data.id;

    // Отправка тестов
    for (const suite of report.results[0].suites) {
      await axios.post(
        `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/item`,
        {
          launchId,
          name: suite.title,
          startTime: new Date().toISOString(),
          status: suite.tests.every(t => t.pass) ? "PASSED" : "FAILED"
        },
        { headers }  // <- исправлено
      );
    }

    // Завершаем launch
    await axios.put(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch/${launchId}/finish`,
      { endTime: new Date().toISOString() },
      { headers }  // <- исправлено
    );

    console.log("Report uploaded successfully:", filePath);
  } catch (err) {
    console.error("Error uploading report:", err.response?.data || err.message);
  }
}

// Загружаем все найденные файлы
(async () => {
  for (const file of reportFiles) {
    await uploadReport(file);
  }
})();
