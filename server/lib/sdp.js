const { getCodecInfoFromRtpParameters } = require('./utils');
const config = require('../config/config');

// File to create SDP text from mediasoup RTP Parameters
module.exports.createSdpText = (rtpParameters) => {
  let { video, audio } = rtpParameters;
  
  if (audio == undefined) audio={};
  if (video == undefined) video={};
  // Video codec info
  const videoCodecInfo = (rtpParameters.video)?getCodecInfoFromRtpParameters('video', video.rtpParameters)
								: '';

  // Audio codec info
  const audioCodecInfo = (rtpParameters.audio)?getCodecInfoFromRtpParameters('audio', audio.rtpParameters)
								: '';
  const audioStr = (audio == undefined)?'':
`m=audio ${audio.remoteRtpPort || 0} RTP/AVP ${audioCodecInfo.payloadType || 0} 
a=rtcp:${audio.remoteRtcpPort}
a=rtpmap:${audioCodecInfo.payloadType || 0} ${audioCodecInfo.codecName}/${audioCodecInfo.clockRate}/${audioCodecInfo.channels}
a=sendonly`;
  const videoStr = (video == undefined)?'':
`m=video ${video.remoteRtpPort || 0} RTP/AVP ${videoCodecInfo.payloadType} 
a=rtcp:${video.remoteRtcpPort || 0}
a=rtpmap:${videoCodecInfo.payloadType} ${videoCodecInfo.codecName}/${videoCodecInfo.clockRate}
a=sendonly
`;
  
  const recordIp = config.mediasoup.recording.ip || '127.0.0.1';
  return `v=0
  o=- 0 0 IN IP4 ${recordIp}
  s=FFmpeg
  c=IN IP4 ${recordIp}
  t=0 0
  ${videoStr}${audioStr}
  `;
};
