import React, { createRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { invokeSaveAsDialog, MultiStreamRecorder } from 'recordrtc';
import html2canvas from 'html2canvas';
import Logger from '../../Logger';

const logger = new Logger('Recorder');

export default class Recorder extends React.PureComponent
{
	constructor(props)
	{
		super(props);
		this.state = {
			recordVideo : null,
			src         : null
		};

		// Latest received audio track.
		// @type {MediaStreamTrack}
		this.ref2 = createRef();
		this.ref1 = createRef();
		this._videoTimer = null;
		this.recorder = null;
		this.elementToRecord = null;
		this.canvas2d = null;
		this.context = null;
	}

	render()
	{
		const {
			recorded
		} = this.props;

		const {
			recordVideo,
			src
		} = this.state;

		return (
			<div>

				<div>

					<video style={{ display: 'none' }} ref={this.ref1}/>

				</div>

				<canvas ref={this.ref2} style={{ display: 'none' }}/>

			</div>
		);
	}

	_StartRecord()
	{
		try
		{
			// TODO: switch remote and local recording
			// REMOTE - await this.sendRequest('moderator:start_record');
			this.elementToRecord = this.props.parentRef.current;

			this.canvas2d =this.ref2.current;
			this.canvasStream = this.canvas2d.captureStream();

			// this.finalStream = new MediaStream();

			this.context = this.canvas2d.getContext('2d');

			this.canvas2d.width = this.elementToRecord.clientWidth;
			this.canvas2d.height = this.elementToRecord.clientHeight;

			this.looper = (() =>
			{
				html2canvas(this.elementToRecord).then((canvas) =>
				{
					logger.error('CANVAS: %o', this.context);
					try
					{
						this.canvas2d.width = this.elementToRecord.clientWidth;
						this.canvas2d.height = this.elementToRecord.clientHeight;
						this.context = this.canvas2d.getContext('2d');
						this.context.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
						this.context.drawImage(canvas, 0, 0, this.canvas2d.width,
							this.canvas2d.height);

						if (!this.props.recorded)
						{
							return;
						}

						requestAnimationFrame(this.looper);
					}
					catch (err)
					{
						logger.error('ERROR record: %o', err);
						clearTimeout(this._videoTimer);
					}
				});
			});

			// looper.bind(this);

			this._videoTimer = setTimeout(() => { this.looper(); }, 500);

			this.recordVideo = new MultiStreamRecorder([ this.canvasStream ], { type: 'video' });

			logger.error('BBBBBBB: %o', this.recordVideo);
			// this.recordVideo.addStream();

			this.recordVideo.record();
		}
		catch (error)
		{
			logger.error('start_record() [error:"%o"]', error);
		}
	}
	_StopRecord()
	{
		if (this.recordVideo)
		{
			clearTimeout(this._videoTimer);
			this.recordVideo.stop((blob) =>
			{
				// let blob = recorder.getBlob();
				// invokeSaveAsDialog(blob);
				logger.error('VODEI: %o', blob);
				this.ref2.current.src = URL.createObjectURL(blob);
				invokeSaveAsDialog(blob, 'Save.webm');
			});
		}
	}

	componentDidUpdate(prevProps)
	{
		if (prevProps !== this.props)
		{
			if (this.props.recorded)
			{
				this._StartRecord();
			}
			else
			{
				this._StopRecord();
			}
		}
	}

	componentWillUnmount()
	{
		clearInterval(this._videoTimer);
	}

}

Recorder.propTypes =
{
	recorded  : PropTypes.bool.isRequired,
	parentRef : PropTypes.object
};