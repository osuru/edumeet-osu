// Class to handle child process used for running FFmpeg
const Logger = require('./Logger');
const config = require('../config/config');

const logger = new Logger('ffmpeg');


const child_process = require('child_process');
const { EventEmitter } = require('events');

const { createSdpText } = require('./sdp');
const { convertStringToStream } = require('./utils');
const fs = require('fs');

const RECORD_FILE_LOCATION_PATH = process.env.RECORD_FILE_LOCATION_PATH || config.mediasoup.recording.path;

module.exports = class FFmpeg {
  constructor (rtpParameters) {
    this._rtpParameters = rtpParameters;
	this.fileName=rtpParameters.fileName;
	this.producers = rtpParameters;
    this._process = undefined;
    this._observer = new EventEmitter();
	this._state=true;
    this._createProcess();
  }

  _createProcess () {
	  try{
    const sdpString = createSdpText(this._rtpParameters);
	/**fs.writeFile('/tmp/1.sdp', sdpString, function (err) {
		if (err) return logger.error(err);
	});*/
    const sdpStream = convertStringToStream(sdpString);

    logger.info('createProcess() [sdpString:%s]', sdpString);

    this._process = child_process.spawn('ffmpeg', this._commandArgs);

    if (this._process.stderr) {
      this._process.stderr.setEncoding('utf-8');

      this._process.stderr.on('data', data =>
        logger.info('ffmpeg::process::data [data:%o]', data)
      );
    }

    if (this._process.stdout) {
      this._process.stdout.setEncoding('utf-8');

      this._process.stdout.on('data', data => 
        logger.info('ffmpeg::process::data [data:%o]', data)
      );
    }

    this._process.on('message', message =>
      logger.info('ffmpeg::process::message [message:%o]', message)
    );

    this._process.on('error', error =>
      logger.error('ffmpeg::process::error [error:%o]', error)
    );

    this._process.once('close', () => {
      logger.info('ffmpeg::process::close');
      this._observer.emit('process-close');
    });

    sdpStream.on('error', error =>
      logger.error('sdpStream::error [error:%o]', error)
    );

    // Pipe sdp stream to the ffmpeg process
    sdpStream.resume();
    sdpStream.pipe(this._process.stdin);
	  }
	  catch(err){
		  logger.error('ffmpeg error: %o',err);
		  this._state=false;
	  }
  }

  kill () {
    logger.info('kill() [pid:%d]', this._process.pid);
    this._state=false;
	this._process.kill('SIGINT');
   }

  get _commandArgs () {
    let commandArgs = [
      '-loglevel',
      (config.mediasoup.recording.ffmpeg_debug || 'debug'),
      '-protocol_whitelist',
      'pipe,udp,rtp',
      '-fflags',
      '+genpts',
      '-f',
      'sdp',
	  '-i',
      'pipe:0'
    ];
	if (this._rtpParameters['video'])
		commandArgs = commandArgs.concat(this._videoArgs);
	if (this._rtpParameters['audio'])
    commandArgs = commandArgs.concat(this._audioArgs);
    
    commandArgs = commandArgs.concat([
      '-flags',
      '+global_header',
	  '-analyzeduration','11000000',
      `${RECORD_FILE_LOCATION_PATH}/${this._rtpParameters.fileName}.webm`
    ]);

    logger.info('commandArgs:%o', commandArgs.concat());

    return commandArgs;
  }
  
  get state(){ return this._state; }
  
  get _videoArgs () {
    return [
      '-map',
      '0:v:0',
      '-c:v',
      'copy'
    ];
  }

  get _audioArgs () {
    return [
      '-map',
      '0:a:0',
      '-strict', // libvorbis is experimental
      '-2',
      '-c:a',
      'copy'
    ];
  }
}
