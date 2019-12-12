const axios = require('axios');
const express = require('express');
const { exec } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const second = 1000, minute = 60 * second;
const port = process.env.PORT || 3500;
const judgeUrl = process.env.HACK9_JUDGE || 'http://localhost:3000/dev';
const cloudProvider = process.env.HACK9_CLOUD_PROVIDER || 'aws';
const region = process.env.HACK9_REGION || 'eu-west-1';
const exposedUrl = process.env.TEST_RUNNER_BASE_URL || `http://localhost:${port}`;

let testInProgress = false;

const exposeApi = async function () {
  const app = express();
  app.get('/', (req, res) => {
    testExecution();
    res.send({'status': 'OK'});
  });
  await app.listen(port, () => console.log(`API running on port ${port}...`));
}

const getTestExecution = async function () {
  console.log(`${new Date().toISOString()} get a task to run [${`${judgeUrl}/testRequest?cloudProvider=${cloudProvider}&region=${region}`}]`);
  const response = await axios.get(`${judgeUrl}/testRequest?cloudProvider=${cloudProvider}&region=${region}`)
    .catch(e => {
      if (e.response && e.response.status == 404) {
        console.log('nothing to run');
      } else if (e.code == 'ECONNREFUSED') {
        console.log('judge not reachable');
      } else {
        console.log('error getting test execution', e);
      }
      return null;
    });
  const testExecution = response && response.data;
  if (testExecution) {
    console.log(`Fetched test ${JSON.stringify(testExecution)}`);
  }
  return testExecution;
}

const runTestExecution = async function (testExecution) {
  console.log(`Run task ${testExecution.id} [${testExecution.url}]`);
  testExecution.results = {};
  await runFunctionalTests(testExecution);
  await runLoadTests(testExecution);
  writeFileSync(`results/${testExecution.id}/results.json`, JSON.stringify(testExecution.results));
}

const runCommand = function (command) {
  return new Promise((resolve, reject) => {
    console.log(`Running command '${command}'`);
    exec(command, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr });
    });
  });
}
const functionalTests = [
  { name: 'reset', data: null },
  { name: 'price', data: 'test_data_for_ft_price.csv' },
  { name: 'call', data: 'test_data_for_ft_calls.csv' },
  { name: 'listing', data: 'test_data_for_ft_listing.csv' },
  { name: 'invoice_request', data: 'test_data_for_ft_invoice_request.csv' },
  { name: 'report', data: 'test_data_for_ft_report.csv' },
  { name: 'invoice', data: 'test_data_for_ft_invoice.csv' }
];
const testFile = 'functional-tests/Hack9_functional_tests.postman_collection.json';

const runFunctionalTests = async function (testExecution) {
  for (test of functionalTests) {
    testExecution.results[test.name] = await runFunctionalTest(testExecution, test);
  }
}

const runFunctionalTest = async function (testExecution, test) {
  try {
    const reportFile = `results/${testExecution.id}/test_${test.name}_results.json`;
    const command = `newman run ${testFile} \
                    ${ test.data ? '-d functional-tests/' + test.data : '' } \
                    --env-var base_url=${testExecution.url} \
                    --env-var callback_url=${exposedUrl} \
                    --folder ${test.name} \
                    --reporters cli,json \
                    --reporter-json-export ${reportFile}`;
    const output = await runCommand(command);
    const reportString = readFileSync(reportFile, { encoding: 'utf8' });
    const report = JSON.parse(reportString);
    const result = {
      success: report.run.failures.length === 0,
      score: report.run.failures.length === 0 ? 1 : 0,
      output: output.stdout
    }
    return result;
  } catch (e) {
    return {
      success: false,
      score: 0,
      output: JSON.stringify(e)
    }
  }
}

const parseAverageRequestDuration = function (output) {
  try {
    return output.match(new RegExp('http_req_duration([.]*): avg=([^ ]*)'))[2];
  } catch (e) {
    console.log('Cannot parse output, returning 0', output);
    return 0;
  }
}
const runLoadTests = async function (testExecution) {
  try {
    if (testExecution.results.price.success) {
      // k6 run -e phase=getPrice -e apiUrl=http://ec2-52-50-206-210.eu-west-1.compute.amazonaws.com:8080/reference -e iterations=1000 script.js
      const command = `k6 run -e phase=getPrice -e apiUrl=${testExecution.url} -e iterations=1000 k6-load-tests/script.js`;
      const output = await runCommand(command);
      testExecution.results.priceLoad = { success: true, score: parseAverageRequestDuration(output.stdout), output: output.stdout };
    } else {
      testExecution.results.priceLoad = { success: null, score: 0, output: 'skipped' };
    }
  } catch (e) {
    testExecution.results.priceLoad = { success: false, score: 0, output: JSON.stringify(e) };
  }

  try {
    if (testExecution.results.call.success) {
      const command = `k6 run -e phase=postCall -e apiUrl=${testExecution.url} -e iterations=1000 k6-load-tests/script.js`;
      const output = await runCommand(command);
      testExecution.results.callLoad = { success: true, score: parseAverageRequestDuration(output.stdout), output: output.stdout };
    } else {
      testExecution.results.callLoad = { success: null, score: 0, output: 'skipped' };
    }
  } catch (e) {
    testExecution.results.callLoad = { success: false, score: 0, output: JSON.stringify(e) };
  }
}

const submitTestExecutionResults = async function(testExecution) {
  console.log('Submit results');
  const payload = {
    id: testExecution.id,
    data: JSON.stringify(testExecution.results)
  };
  const response = await axios.post(`${judgeUrl}/testResults`, payload);
  console.log(`Submit results finished [${response.status}]`);
}

const testExecution = async function() {
  try {
    const testExecution = await getTestExecution();
    // const testExecution = { id: 1, url: 'http://hack9ri-env-1.wppmcc2szq.eu-west-1.elasticbeanstalk.com/reference/' };
    if (testExecution && testExecution.id) {
      await runTestExecution(testExecution);
      // console.log(testExecution.results);
      await submitTestExecutionResults(testExecution);
    }
  } catch (e) {
    console.log('Failed test execution', e);
  }
}

exposeApi();
testExecution();
setInterval(testExecution, 1 * minute);
