import http from "k6/http";
import { check, sleep } from "k6";

const apiUrl = __ENV.apiUrl || 'http://localhost:8080/reference';
const testData = open("./data-60k.csv").split('\n');
const testDatalisting = open("./data-60klisting.csv").split('\n');
const vus = __ENV.vus || 250;
const iterations = __ENV.iterations || 6000000;

export let options = {
  vus: vus,
  // duration: "10s"
  iterations: iterations
};

export default function() {
  if (__ENV.phase === 'getPrice') {
    getPrice();
  } else if (__ENV.phase === 'postCall') {
    postCall();
  } else if (__ENV.phase === 'listingCall') {
    listingCall();
  }
  // sleep(0.1);
};

function getPrice () {
  let item = testData[__ITER%60000].split(',');
  const called = item[1];
  const start = item[2];
  let res = http.get(`${apiUrl}/switch/price?number=${called}&time=${start}`);
  check(res, {
    "status was 200": (r) => r.status == 200
  });
}

function postCall () {
  let item = testData[__ITER%60000].split(',');
  const postParams = {
    calling: item[0],
    called: item[1],
    start: item[2],
    duration: item[3]
  }
  let res = http.post(`${apiUrl}/switch/call`, JSON.stringify(postParams), { headers: { "Content-Type": "application/json" } });
  check(res, {
    "status was 200": (r) => r.status == 200
  });
}
  function listingCall () {
    let item = testDatalisting[__ITER%60000].split(',');
    const calling= item[0];
    const  from= item[5];
    const to= item[6];
    
    let res = http.get(`${apiUrl}/listing/${calling}?from=${from}&to=${to}`);
    check(res, {
      "status was 200": (r) => r.status == 200
    });
  }

