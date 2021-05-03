const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');

const TEMP_PATH = process.env['TEMP_PATH'] || 'temp';
const DEST_PATH = process.env['DEST_PATH'] || 'video';

const VideoInfo = require('./lib/videoinfo');
const Download = require('./lib/download');
const Mixing = require('./lib/mixing');

function createDownloadMetadata(videoInfo) {
    const videoId = videoInfo.videoDetails.videoId;
    const audioExtentionTable = { 'webm': 'weba', 'mp4': 'm4a' }
    var downloadQueues = []

    if (videoInfo.Combined) {
        downloadQueues.push({
            url: videoInfo.videoFormat.url,
            filename: videoId,
            extention: videoInfo.videoFormat.container,
            type: 'video'
        });
    } else {
        downloadQueues.push({
            url: videoInfo.videoFormat.url,
            filename: videoId,
            extention: videoInfo.videoFormat.container,
            type: 'video'
        });
        downloadQueues.push({
            url: videoInfo.audioFormat.url,
            filename: videoId,
            extention: audioExtentionTable[videoInfo.audioFormat.container],
            type: 'audio'
        });
    }

    return {
        videoId,
        title: videoInfo.videoDetails.title,
        container: videoInfo.audioFormat.container,
        mixingFormat: videoInfo.Combined ? null : videoInfo.audioFormat.container,
        downloadQueues
    }
}

VideoInfo.fetch(process.argv[2]).then((videoInfo) => {
    console.log(`${videoInfo.videoDetails.videoId} - ${videoInfo.videoDetails.title}`);
    console.log(`Video: ${videoInfo.videoFormat.videoCodec} ${videoInfo.videoFormat.qualityLabel} : ${videoInfo.videoFormat.bitrate/1000000}Mbps`);
    console.log(`Audio: ${videoInfo.audioFormat.audioCodec} : ${videoInfo.audioFormat.audioBitrate}Kbps`);

    metadata = createDownloadMetadata(videoInfo);
    jobs = metadata.downloadQueues.map(downloadQueue => {
        return Download.save(downloadQueue, downloadQueue.type == 'video');
    });

    Promise.all(jobs).then(() => {
        var safe_title = sanitize(metadata.title, { replacement: "_" });

        if (!metadata.mixingFormat) {
            downloadQueue = metadata.downloadQueues[0];
            fs.copyFileSync(
                `${TEMP_PATH}${path.sep}${downloadQueue.filename}.${downloadQueue.extention}`,
                `${DEST_PATH}${path.sep}${safe_title}.${downloadQueue.extention}`
            );
            fs.unlinkSync(`${TEMP_PATH}${path.sep}${downloadQueue.filename}.${downloadQueue.extention}`);
        } else {
            videoQueue = metadata.downloadQueues.filter((x) => { return x.type == 'video' })[0];
            audioQueue = metadata.downloadQueues.filter((x) => { return x.type == 'audio' })[0];

            switch (metadata.mixingFormat) {
                case 'webm':
                    Mixing.mkvmerge(
                        `${DEST_PATH}${path.sep}${safe_title}.webm`,
                        metadata.title,
                        true,
                        `${TEMP_PATH}${path.sep}${videoQueue.filename}.${videoQueue.extention}`, ["--language", "0:jpn", "--default-track", "0:yes"],
                        `${TEMP_PATH}${path.sep}${audioQueue.filename}.${audioQueue.extention}`, ["--language", "0:jpn", "--default-track", "0:yes"]
                    ).then(() => {
                        fs.unlinkSync(`${TEMP_PATH}${path.sep}${videoQueue.filename}.${videoQueue.extention}`);
                        fs.unlinkSync(`${TEMP_PATH}${path.sep}${audioQueue.filename}.${audioQueue.extention}`);
                    });
                    break;
                case 'mp4':
                    break;
            }
        }
    });
});