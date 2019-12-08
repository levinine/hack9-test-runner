const axios = require('axios');
const express = require('express');
const { exec } = require('child_process');
const { readFileSync } = require('fs');

const port = 3500;
const judge = process.env.HACK9_JUDGE || 'http://localhost:3000/dev';
const cloudProvider = process.env.HACK9_CLOUD_PROVIDER || 'aws';
const region = process.env.HACK9_REGION || 'eu-west-1';

const app = express();
app.get('/', (req, res) => {
  testExecution();
  res.send({'status': 'OK'});
});

app.listen(port, () => console.log(`Listening on port ${port}...`));

const getTestExecution = async function () {
  console.log(`get a task to run`);
  const response = await axios.get(`${judge}/testRequest?cloudProvider=${cloudProvider}&region=${region}`)
    .catch(e => {
      if (!e.response || e.response.status != 404) {
        console.log('error getting test execution', e);
      }
      return null;
    });
  const testExecution = response && response.data;
  console.log(`Fetched test ${JSON.stringify(testExecution)}`);
  return testExecution;
}

const runTestExecution = function (testExecution) {
  console.log(`Run task ${testExecution.id} [${testExecution.url}]`);
  const artillery = `node_modules/artillery/bin/artillery`;
  const overrides = {'config': {'target': testExecution.url}};
  const output = `result-${testExecution.id}.json`;
  const command = `cd artillery-load-tests && ${artillery} run --overrides '${JSON.stringify(overrides)}' --output ${output} script.yml`;
  console.log(`Executing command '${command}'`);
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err || stderr) {
        console.log('Error running artillery', err, stderr);
        // TODO handle rejection
        reject();
      }
      console.log(`Run task - finished`);
      resolve();
    })
  });

}

const submitTestExecutionResults = async function(testExecution) {
  console.log('Submit results');
  const results = {
    id: testExecution.id,
    data: readFileSync(`artillery-load-tests/result-${testExecution.id}.json`, { encoding: 'utf8' })
  };
  const response = await axios.post(`${judge}/testResults`, results);
  console.log(`Submit results finished [${response.status}]`);
}

const testExecution = async function() {
  const testExecution = await getTestExecution();
  if (testExecution && testExecution.id) {
    await runTestExecution(testExecution);
    await submitTestExecutionResults(testExecution);
  }
}

// setInterval(getTask, 30000);

testExecution();
