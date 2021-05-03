const ytdl = require('ytdl-core');

const VIDEO_TYPE_PRIORITY = ['av01', 'vp9', 'avc1']
const AUDIO_TYPE_PRIORITY = ['opus', 'mp4a']

async function fetch(video_url) {
    var videoInfo = await ytdl.getInfo(video_url);
    videoFormats = videoInfo.formats.filter((x) => { return x.hasVideo });
    audioFormats = videoInfo.formats.filter((x) => { return x.hasAudio });

    videoFormats = videoFormats.sort((x, y) => {
        return y.bitrate - x.bitrate;
    }).sort((x, y) => {
        if (x.height == y.height) {
            x_codec = VIDEO_TYPE_PRIORITY.indexOf(x.videoCodec.substr(0, 4));
            y_codec = VIDEO_TYPE_PRIORITY.indexOf(y.videoCodec.substr(0, 4));
            return x_codec - y_codec;
        }
        return y.height - x.height;
    });

    audioFormats = audioFormats.sort((x, y) => {
        return y.audioBitrate - x.audioBitrate;
    }).sort((x, y) => {
        x_codec = AUDIO_TYPE_PRIORITY.indexOf(x.audioCodec.substr(0, 4));
        y_codec = AUDIO_TYPE_PRIORITY.indexOf(y.audioCodec.substr(0, 4));
        return x_codec - y_codec;
    });

    // Determine best format by video
    if (!videoFormats.length || !audioFormats.length) {
        throw 'Downloadable format not exists.';
    }
    videoFormat = videoFormats[0];
    audioFormat = null;
    isWebm = false;
    if (!(Combined = videoFormat.hasAudio)) {
        if (isWebm = !(videoFormat.videoCodec.substr(0, 4) == 'avc1')) {
            audioFormat = audioFormats.filter((x) => { return x.audioCodec == 'opus' })[0];
        } else {
            audioFormat = audioFormats.filter((x) => { return x.audioCodec.substr(0, 4) == 'mp4a' })[0];
        }
    }

    return {
        videoDetails: videoInfo.videoDetails,
        videoFormat,
        audioFormat,
        Combined,
        isWebm
    }
}

exports.fetch = fetch