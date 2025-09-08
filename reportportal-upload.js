// 📌 Генерация красивого имени ланча
function generateLaunchName() {
  const now = new Date();
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `test-name-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

async function uploadReport(filePath) {
  console.log("Uploading:", filePath);
  const report = JSON.parse(fs.readFileSync(filePath));

  try {
    // 1️⃣ Создаём launch с кастомным именем
    const launchResp = await axios.post(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch`,
      {
        name: generateLaunchName(),
        startTime: new Date().toISOString()
      },
      { headers }
    );

    const launchId = launchResp.data.id;

    // 2️⃣ Получаем корректный launchUuid
    const launchData = await axios.get(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch/${launchId}`,
      { headers }
    );

    const launchUuid = launchData.data.uuid;

    // 3️⃣ Загружаем SUITES и TESTS как раньше...
    for (const suite of report.results[0].suites) {
      const suiteResp = await axios.post(
        `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/item`,
        {
          launchUuid,
          name: suite.title || "Unnamed Suite",
          type: "SUITE",
          startTime: new Date().toISOString(),
          status: suite.tests.every(t => t.pass) ? "PASSED" : "FAILED"
        },
        { headers }
      );

      const suiteUuid = suiteResp.data.uuid;

      for (const test of suite.tests) {
        await axios.post(
          `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/item`,
          {
            launchUuid,
            name: test.title || "Unnamed Test",
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

    console.log("✅ Report uploaded successfully:", filePath);

  } catch (err) {
    console.error("❌ Error uploading report:", err.response?.data || err.message);
  }
}
