'use strict';

const child_process = require('child_process');

async function mkvmerge(to, title, is_webm, track0_path, track0_opt, track1_path, track1_opt) {
  let output = ['--output', to];
  let format = is_webm ? ['-w'] : [];
  let track0 = track0_opt.concat([track0_path]);
  let track1 = track1_opt.concat([track1_path]);
  title = ['--title', title];
  let track_order = ['--track-order', '0:0,1:0'];

  const argv = Array.prototype.concat(output, format, track0, track1, title, track_order);

  return new Promise((resolve, reject) => {
    const mkvmerge = child_process.spawn('mkvmerge', argv);

    mkvmerge.stdout.on('data', (data) => {
      console.log(String(data));
    });

    let stderr = null;
    mkvmerge.stderr.on('data', (data) => {
      stderr = stderr.concat(data);
    });

    mkvmerge.on('close', (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(stderr);
      }
    });
  });
}

exports.mkvmerge = mkvmerge;
