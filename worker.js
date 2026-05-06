const { parentPort, workerData } = require('worker_threads');

let result = 0;
for (let i = 0; i < workerData.iterations; i++) {
  result += i;
}

parentPort.postMessage(result);