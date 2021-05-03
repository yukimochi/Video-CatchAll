const child_process = require('child_process');

async function mkvmerge(to, title, is_webm, track0_path, track0_opt, track1_path, track1_opt) {
    var output = ["--output", to];
    var format = is_webm ? ["-w"] : [];
    var track0 = track0_opt.concat([track0_path]);
    var track1 = track1_opt.concat([track1_path]);
    var title = ["--title", title];
    var track_order = ["--track-order", "0:0,1:0"];

    const argv = Array.prototype.concat(output, format, track0, track1, title, track_order);

    return new Promise((resolve, reject) => {
        const mkvmerge = child_process.spawn("mkvmerge", argv);

        mkvmerge.stdout.on('data', (data) => {
            console.log(String(data));
        });

        var stderr = null;
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
    })
}

exports.mkvmerge = mkvmerge