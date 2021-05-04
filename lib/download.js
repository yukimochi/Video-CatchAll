'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TEMP_PATH = process.env['TEMP_PATH'] || 'temp';

async function save(downloadQueue, progress = false) {
  let response = await axios.get(downloadQueue.url, { responseType: 'stream' });

  const dataSize = response.headers['content-length'];
  let loadedSize = 0;

  return new Promise((resolve, reject) => {
    let dest_stream = fs.createWriteStream(`${TEMP_PATH}${path.sep}${downloadQueue.filename}.${downloadQueue.extention}`);
    response.data.pipe(dest_stream);

    if (progress) {
      let prevPercentage = -1;
      response.data.on('data', (data) => {
        loadedSize += Buffer.byteLength(data);
        let percentage = Math.round(loadedSize / dataSize * 100);
        if (percentage != prevPercentage) {
          prevPercentage = percentage;
          process.stdout.write(`\r${percentage}% [${'#'.repeat(percentage)}${'.'.repeat(100 - percentage)}]`);
        }
      });
    }

    response.data.on('error', (err) => {
      dest_stream.destroy();
      reject(err);
    });

    response.data.on('end', () => {
      dest_stream.end();
      if (progress) {
        process.stdout.write('\n');
      }
      resolve();
    });
  });
}

exports.save = save;
