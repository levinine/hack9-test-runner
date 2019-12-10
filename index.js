const axios = require('axios');
const express = require('express');
const { exec } = require('child_process');
const { readFileSync } = require('fs');

const second = 1000, minute = 60 * second;
const port = 3500;
const judgeUrl = process.env.HACK9_JUDGE || 'http://localhost:3000/dev';
const cloudProvider = process.env.HACK9_CLOUD_PROVIDER || 'aws';
const region = process.env.HACK9_REGION || 'eu-west-1';

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
  let results = {};
  results.functional = await runFunctionalTests(testExecution);
  results.load = await runLoadTests(testExecution);
  return results;
}

const runCommand = function (command) {
  return new Promise((resolve, reject) => {
    console.log(`Running command '${command}'`);
    exec(command, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr });
      // if (err || stderr) {
      //   console.log(`Error running command ${command}`, err, stdout, stderr);
      //   reject(err || stderr);
      // } else {
      //   console.log(`Success running command ${command}`, stdout);
      //   resolve(stdout);
      // }
    });
  });
}

const runFunctionalTests = function (testExecution) {
  return runCommand('echo newman');
}

const runLoadTests = function (testExecution) {
  // k6 run -e phase=getPrice -e apiUrl=http://ec2-52-50-206-210.eu-west-1.compute.amazonaws.com:8080/reference -e iterations=1000 script.js
  const command = `k6 run -e phase=getPrice -e apiUrl=${testExecution.url} -e iterations=1000 k6-load-tests/script.js`;
  return runCommand(command).then(output => {
    // TODO parse score from output 
    return { success: true, score: 1, output: output.stdout };
  });
}

const runArtilleryLoadTests = function (testExecution) {
  const artillery = `node_modules/artillery/bin/artillery`;
  const overrides = {'config': {'target': testExecution.url}};
  const output = `result-${testExecution.id}.json`;
  const command = `cd artillery-load-tests && ${artillery} run --overrides '${JSON.stringify(overrides)}' --output ${output} script.yml`;
  return runCommand(command);
}

const submitTestExecutionResults = async function(testExecution, results) {
  console.log('Submit results');
  const payload = {
    id: testExecution.id,
    data: JSON.stringify(results)
  };
  const response = await axios.post(`${judgeUrl}/testResults`, payload);
  console.log(`Submit results finished [${response.status}]`);
}

const testExecution = async function() {
  const testExecution = await getTestExecution();
  if (testExecution && testExecution.id) {
    const results = await runTestExecution(testExecution);
    await submitTestExecutionResults(testExecution, results);
  }
}

exposeApi();
testExecution();
setInterval(testExecution, 1 * minute);
