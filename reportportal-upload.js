const fs = require("fs");
const path = require("path");
const axios = require("axios");

const RP_ENDPOINT = 'https://rp.bfx.elegenbio.com/';
const RP_PROJECT = 'eks-test';
const RP_TOKEN = '123_xnlAHqX5TnS5mSvXICcUDCHnRp6LuDdwyX_RpLzygIcimAUxfvqel_52sCQjg0yR';

if (!RP_ENDPOINT || !RP_PROJECT || !RP_TOKEN) {
  console.error("Set RP_ENDPOINT, RP_PROJECT and RP_TOKEN environment variables");
  process.exit(1);
}

// Функция для рекурсивного поиска JSON файлов
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

// Функция для отправки отчёта в ReportPortal
async function uploadReport(filePath) {
  console.log("Uploading:", filePath);
  const report = JSON.parse(fs.readFileSync(filePath));

  try {
    // Создаём новый launch
    const launchResp = await axios.post(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch`,
      {
        name: path.basename(filePath),
        startTime: new Date().toISOString()
      },
      { headers: { Authorization: `Bearer ${RP_TOKEN}` } }  
    );

    const launchId = launchResp.data.id;

    // Отправка тестов (упрощённо: только имена и статусы)
    for (const suite of report.results[0].suites) {
      await axios.post(
        `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/item`,
        {
          launchId,
          name: suite.title,
          startTime: new Date().toISOString(),
          status: suite.tests.every(t => t.pass) ? "PASSED" : "FAILED"
        },
        { headers: { Authorization: RP_TOKEN } }
      );
    }

    // Завершаем launch
    await axios.put(
      `${RP_ENDPOINT}/api/v1/${RP_PROJECT}/launch/${launchId}/finish`,
      { endTime: new Date().toISOString() },
      { headers: { Authorization: RP_TOKEN } }
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


// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');

// // Конфигурация ReportPortal
// const RP_CONFIG = {
//   endpoint: process.env.RP_ENDPOINT || 'https://rp.bfx.elegenbio.com/',
//   token: process.env.RP_TOKEN || 'test_Plt1eiRYSJCS1MHQ0bnEQCYOXFrnxz1N7-iRLWI80My2gmckt8fSJy8P_BfS4tFJ',
//   project: process.env.RP_PROJECT || 'eks-test',
//   launch: process.env.RP_LAUNCH || 'cypress-tests'
// };

// async function uploadReports() {
//   try {
//     console.log('Starting ReportPortal upload...');
    
//     // Путь к отчетам
//     const reportsDir = path.join(__dirname, 'cypress', 'reports');
    
//     console.log(`Looking for reports in: ${reportsDir}`);
    
//     // Проверяем существование папки с отчетами
//     if (!fs.existsSync(reportsDir)) {
//       console.error('Reports directory does not exist:', reportsDir);
//       return;
//     }
    
//     // Получаем список JSON файлов отчетов
//     const reportFiles = fs.readdirSync(reportsDir)
//       .filter(file => file.endsWith('.json'))
//       .map(file => path.join(reportsDir, file));
    
//     console.log(`Found ${reportFiles.length} report files:`, reportFiles);
    
//     if (reportFiles.length === 0) {
//       console.error('No JSON report files found in reports directory');
//       return;
//     }
    
//     // Обрабатываем каждый файл отчета
//     for (const reportFile of reportFiles) {
//       console.log(`Processing report file: ${reportFile}`);
      
//       const reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
//       console.log('Report data loaded successfully');
      
//       // Преобразуем отчет Mochawesome в формат ReportPortal
//       const rpData = transformMochawesomeToRP(reportData);
      
//       // Отправляем в ReportPortal
//       await sendToReportPortal(rpData);
//     }
    
//     console.log('ReportPortal upload completed successfully');
    
//   } catch (error) {
//     console.error('Error uploading to ReportPortal:', error.message);
//     console.error('Stack trace:', error.stack);
//     process.exit(1);
//   }
// }

// function transformMochawesomeToRP(mochawesomeData) {
//   console.log('Transforming Mochawesome data to ReportPortal format...');
  
//   const transformed = {
//     name: RP_CONFIG.launch,
//     description: 'Cypress test results',
//     startTime: new Date().toISOString(),
//     endTime: new Date().toISOString(),
//     mode: 'DEFAULT',
//     tags: ['cypress', 'automation'],
//     tests: []
//   };
  
//   // Обрабатываем результаты тестов
//   if (mochawesomeData.results && mochawesomeData.results.length > 0) {
//     mochawesomeData.results.forEach(result => {
//       if (result.suites) {
//         result.suites.forEach(suite => {
//           if (suite.tests) {
//             suite.tests.forEach(test => {
//               transformed.tests.push({
//                 name: test.title,
//                 status: test.state === 'passed' ? 'PASSED' : 'FAILED',
//                 startTime: test.startedAt || new Date().toISOString(),
//                 endTime: test.endedAt || new Date().toISOString(),
//                 duration: test.duration || 0,
//                 suite: suite.title,
//                 error: test.err ? test.err.message : null
//               });
//             });
//           }
//         });
//       }
//     });
//   }
  
//   console.log(`Transformed ${transformed.tests.length} test results`);
//   return transformed;
// }

// async function sendToReportPortal(data) {
//   console.log('Sending data to ReportPortal...');
  
//   // Проверяем конфигурацию
//   if (!RP_CONFIG.token || RP_CONFIG.token === 'your-token-here') {
//     console.error('ReportPortal token not configured. Please set RP_TOKEN environment variable.');
//     return;
//   }
  
//   if (!RP_CONFIG.endpoint || RP_CONFIG.endpoint === 'https://your-reportportal-instance.com') {
//     console.error('ReportPortal endpoint not configured. Please set RP_ENDPOINT environment variable.');
//     return;
//   }
  
//   try {
//     const response = await axios.post(
//       `${RP_CONFIG.endpoint}/api/v1/${RP_CONFIG.project}/launch`,
//       data,
//       {
//         headers: {
//           'Authorization': `Bearer ${RP_CONFIG.token}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 30000
//       }
//     );
    
//     console.log('Successfully sent to ReportPortal');
//     console.log('Response status:', response.status);
//     console.log('Launch ID:', response.data?.id);
    
//   } catch (error) {
//     if (error.response) {
//       console.error('ReportPortal API Error:');
//       console.error('Status:', error.response.status);
//       console.error('Data:', error.response.data);
//     } else if (error.request) {
//       console.error('Network Error:', error.message);
//     } else {
//       console.error('Request Error:', error.message);
//     }
//     throw error;
//   }
// }

// // Запускаем загрузку
// uploadReports();
