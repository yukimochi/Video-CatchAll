'use strict';

const ytdl = require('ytdl-core');

const VIDEO_TYPE_PRIORITY = ['av01', 'vp9', 'avc1'];
const AUDIO_TYPE_PRIORITY = ['opus', 'mp4a'];

async function fetch(video_url) {
  let videoInfo = await ytdl.getInfo(video_url);
  let videoFormats = videoInfo.formats.filter((x) => { return x.hasVideo; });
  let audioFormats = videoInfo.formats.filter((x) => { return x.hasAudio; });

  videoFormats = videoFormats.sort((x, y) => {
    return y.bitrate - x.bitrate;
  }).sort((x, y) => {
    if (x.height == y.height) {
      let x_codec = VIDEO_TYPE_PRIORITY.indexOf(x.videoCodec.substr(0, 4));
      let y_codec = VIDEO_TYPE_PRIORITY.indexOf(y.videoCodec.substr(0, 4));
      return x_codec - y_codec;
    }
    return y.height - x.height;
  });

  audioFormats = audioFormats.sort((x, y) => {
    return y.audioBitrate - x.audioBitrate;
  }).sort((x, y) => {
    let x_codec = AUDIO_TYPE_PRIORITY.indexOf(x.audioCodec.substr(0, 4));
    let y_codec = AUDIO_TYPE_PRIORITY.indexOf(y.audioCodec.substr(0, 4));
    return x_codec - y_codec;
  });

  // Determine best format by video
  if (!videoFormats.length || !audioFormats.length) {
    throw 'Downloadable format not exists.';
  }
  let videoFormat = videoFormats[0];
  let audioFormat = null;
  let isWebm = false;
  let Combined = false;
  if (!(Combined = videoFormat.hasAudio)) {
    if ((isWebm = !(videoFormat.videoCodec.substr(0, 4) == 'avc1'))) {
      audioFormat = audioFormats.filter((x) => { return x.audioCodec == 'opus'; })[0];
    } else {
      audioFormat = audioFormats.filter((x) => { return x.audioCodec.substr(0, 4) == 'mp4a'; })[0];
    }
  }

  return {
    videoDetails: videoInfo.videoDetails,
    videoFormat,
    audioFormat,
    Combined,
    isWebm
  };
}

exports.fetch = fetch;
