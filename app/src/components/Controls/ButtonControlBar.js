import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { meProducersSelector } from '../Selectors';
import { withStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import classnames from 'classnames';
import * as appPropTypes from '../appPropTypes';
import * as roomActions from '../../actions/roomActions';
import { withRoomContext } from '../../RoomContext';
import { useIntl } from 'react-intl';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import VideoIcon from '@material-ui/icons/Videocam';
import VideoOffIcon from '@material-ui/icons/VideocamOff';
import ScreenIcon from '@material-ui/icons/ScreenShare';
import { green, purple } from '@material-ui/core/colors';
import SettingsIcon from '@material-ui/icons/Settings';

const styles = (theme) =>
	({
		root :
		{
			position                     : 'fixed',
			display                      : 'flex',
			zIndex                       : 30,
			[theme.breakpoints.up('md')] :
			{
				top            : '50%',
				transform      : 'translate(0%, -50%)',
				flexDirection  : 'column',
				justifyContent : 'center',
				alignItems     : 'center',
				left           : theme.spacing(1)
			},
			[theme.breakpoints.down('sm')] :
			{
				flexDirection : 'row',
				bottom        : theme.spacing(1),
				left          : '50%',
				marginBottom  : '64px',
				transform     : 'translate(-50%, -0%)'
			}
		},
		fab :
		{
			margin : theme.spacing(1)
		},
		show :
		{
			opacity    : 1,
			transition : 'opacity .5s'
		},
		hide :
		{
			opacity    : 0,
			transition : 'opacity .5s'
		},
		move :
		{
			left                           : '30vw',
			top                            : '50%',
			transform                      : 'translate(0%, -50%)',
			flexDirection                  : 'column',
			justifyContent                 : 'center',
			alignItems                     : 'center',
			[theme.breakpoints.down('lg')] :
			{
				left : '40vw'
			},
			[theme.breakpoints.down('md')] :
			{
				left : '50vw'
			},
			[theme.breakpoints.down('sm')] :
			{
				left : '70vw'
			},
			[theme.breakpoints.down('xs')] :
			{
				left : '90vw'
			}
		},
		controllButton :
		{
			borderRadius : '2em',
			marginTop    : theme.spacing(0.5),
			marginLeft   : theme.spacing(0.5),
			marginRight  : theme.spacing(0.5),
			marginBottom : theme.spacing(0.5)
		}
	});

const ColorMicOn = withStyles((theme) =>
	({
		root : {
			color : green[500]
		}
	}))(MicIcon);

const ColorVidOn = withStyles((theme) =>
	({
		root : {
			color : green[500]
		}
	}))(VideoIcon);

const ColorScreenIconOn = withStyles((theme) =>
	({
		root : {
			color : green[500]
		}
	}))(ScreenIcon);

const ButtonControlBar = (props) =>
{
	const intl = useIntl();

	const {
		room,
		roomClient,
		toolbarsVisible,
		hiddenControls,
		setSettingsOpen,
		drawerOverlayed,
		toolAreaOpen,
		me,
		micProducer,
		webcamProducer,
		screenProducer,
		classes,
		theme
	} = props;

	let micState;

	let micTip;

	if (!me.canSendMic)
	{
		micState = 'unsupported';
		micTip = intl.formatMessage({
			id             : 'device.audioUnsupported',
			defaultMessage : 'Audio unsupported'
		});
	}
	else if (!micProducer)
	{
		micState = 'off';
		micTip = intl.formatMessage({
			id             : 'device.activateAudio',
			defaultMessage : 'Activate audio'
		});
	}
	else if (!micProducer.locallyPaused && !micProducer.remotelyPaused)
	{
		micState = 'on';
		micTip = intl.formatMessage({
			id             : 'device.muteAudio',
			defaultMessage : 'Mute audio'
		});
	}
	else
	{
		micState = 'muted';
		micTip = intl.formatMessage({
			id             : 'device.unMuteAudio',
			defaultMessage : 'Unmute audio'
		});
	}

	let webcamState;

	let webcamTip;

	if (!me.canSendWebcam)
	{
		webcamState = 'unsupported';
		webcamTip = intl.formatMessage({
			id             : 'device.videoUnsupported',
			defaultMessage : 'Video unsupported'
		});
	}
	else if (webcamProducer)
	{
		webcamState = 'on';
		webcamTip = intl.formatMessage({
			id             : 'device.stopVideo',
			defaultMessage : 'Stop video'
		});
	}
	else
	{
		webcamState = 'off';
		webcamTip = intl.formatMessage({
			id             : 'device.startVideo',
			defaultMessage : 'Start video'
		});
	}

	let screenState;

	let screenTip;

	if (!me.canShareScreen)
	{
		screenState = 'unsupported';
		screenTip = intl.formatMessage({
			id             : 'device.screenSharingUnsupported',
			defaultMessage : 'Screen sharing not supported'
		});
	}
	else if (screenProducer)
	{
		screenState = 'on';
		screenTip = intl.formatMessage({
			id             : 'device.stopScreenSharing',
			defaultMessage : 'Stop screen sharing'
		});
	}
	else
	{
		screenState = 'off';
		screenTip = intl.formatMessage({
			id             : 'device.startScreenSharing',
			defaultMessage : 'Start screen sharing'
		});
	}

	const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<div>
			{/* // className={
			// 	// classnames(
			// 	// 	classes.root,
			// 	// 	hiddenControls ?
			// 	// 		(toolbarsVisible ? classes.show : classes.hide) :
			// 	// 		classes.show,
			// 	// 	toolAreaOpen &&
			// 	// 		(me.browser.platform !== 'mobile' && !drawerOverlayed) ?
			// 	// 		classes.move : null
			// 	// )
			// }
		// > */}
			<Tooltip title={micTip}>
				<ButtonGroup variant='contained' className={classes.controllButton}>
					<IconButton
						aria-label={intl.formatMessage({
							id             : 'device.muteAudio',
							defaultMessage : 'Mute audio'
						})}
						// className={classes.fab}
						disabled={!me.canSendMic || me.audioInProgress}
						color={micState === 'on' ? 'inherit' : 'secondary'}
						size={smallScreen ? 'large' : 'medium'}
						onClick={() =>
						{
							if (micState === 'off')
								roomClient.updateMic({ start: true });
							else if (micState === 'on')
								roomClient.muteMic();
							else
								roomClient.unmuteMic();
						}}
					>
						{ micState === 'on' ?
							<ColorMicOn />
							:
							<MicOffIcon />
						}
					</IconButton>
					<IconButton
						aria-label={intl.formatMessage({
							id             : 'device.startVideo',
							defaultMessage : 'Start video'
						})}
						// className={classes.fab}
						disabled={!me.canSendWebcam || me.webcamInProgress}
						color='secondary'
						size={smallScreen ? 'large' : 'medium'}
						onClick={() =>
						{
							webcamState === 'on' ?
								roomClient.disableWebcam() :
								roomClient.updateWebcam({ start: true });
						}}
					>
						{ webcamState === 'on' ?
							<ColorVidOn />
							:
							<VideoOffIcon />
						}
					</IconButton>
					<IconButton
						color='inherit'
						onClick={() => setSettingsOpen(!room.settingsOpen)}
					>
						<SettingsIcon/>
					</IconButton>
				</ButtonGroup>
			</Tooltip>
			{/* <Tooltip title={webcamTip} className={classes.controllButton}>
				<ButtonGroup variant='contained'>
					<IconButton
						aria-label={intl.formatMessage({
							id             : 'device.startVideo',
							defaultMessage : 'Start video'
						})}
						className={classes.fab}
						disabled={!me.canSendWebcam || me.webcamInProgress}
						color={webcamState === 'on' ? 'inherit' : 'secondary'}
						size={smallScreen ? 'large' : 'medium'}
						onClick={() =>
						{
							webcamState === 'on' ?
								roomClient.disableWebcam() :
								roomClient.updateWebcam({ start: true });
						}}
					>
						{ webcamState === 'on' ?
							<VideoIcon />
							:
							<VideoOffIcon />
						}
					</IconButton>
					<IconButton
						color='inherit'
						onClick={() => setSettingsOpen(!room.settingsOpen)}
					>
						<ArrowDropUpIcon/>
					</IconButton>
				</ButtonGroup>
			</Tooltip> */}
			{ me.browser.platform !== 'mobile' &&
				<Tooltip title={screenTip} className={classes.controllButton}>
					<ButtonGroup variant='contained'>
						<IconButton
							aria-label={intl.formatMessage({
								id             : 'device.startScreenSharing',
								defaultMessage : 'Start screen sharing'
							})}
							// className={classes.fab}
							disabled={!me.canShareScreen || me.screenShareInProgress}
							color='secondary'
							size={smallScreen ? 'large' : 'medium'}
							onClick={() =>
							{
								if (screenState === 'off')
									roomClient.updateScreenSharing({ start: true });
								else if (screenState === 'on')
									roomClient.disableScreenSharing();
							}}
						>
							{ screenState === 'off' ?
								<ScreenIcon />
								:
								<ColorScreenIconOn/>
							}
						</IconButton>
					</ButtonGroup>
				</Tooltip>
			}
		</div>
	);
};

ButtonControlBar.propTypes =
{
	roomClient      : PropTypes.any.isRequired,
	room            : appPropTypes.Room.isRequired,
	toolbarsVisible : PropTypes.bool.isRequired,
	hiddenControls  : PropTypes.bool.isRequired,
	drawerOverlayed : PropTypes.bool.isRequired,
	toolAreaOpen    : PropTypes.bool.isRequired,
	setSettingsOpen : PropTypes.func.isRequired,
	me              : appPropTypes.Me.isRequired,
	micProducer     : appPropTypes.Producer,
	webcamProducer  : appPropTypes.Producer,
	screenProducer  : appPropTypes.Producer,
	classes         : PropTypes.object.isRequired,
	theme           : PropTypes.object.isRequired
};

const mapStateToProps = (state) =>
	({
		room            : state.room,
		toolbarsVisible : state.room.toolbarsVisible,
		hiddenControls  : state.settings.hiddenControls,
		drawerOverlayed : state.settings.drawerOverlayed,
		toolAreaOpen    : state.toolarea.toolAreaOpen,
		...meProducersSelector(state),
		me              : state.me
	});

const mapDispatchToProps = (dispatch) =>
	({
		setSettingsOpen : (settingsOpen) =>
		{
			dispatch(roomActions.setSettingsOpen(settingsOpen));
		}
	});

export default withRoomContext(connect(
	mapStateToProps,
	mapDispatchToProps,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				Math.round(prev.peerVolumes[prev.me.id]) ===
				Math.round(next.peerVolumes[prev.me.id]) &&
				prev.room === next.room &&
				prev.room.toolbarsVisible === next.room.toolbarsVisible &&
				prev.settings.hiddenControls === next.settings.hiddenControls &&
				prev.settings.drawerOverlayed === next.settings.drawerOverlayed &&
				prev.toolarea.toolAreaOpen === next.toolarea.toolAreaOpen &&
				prev.producers === next.producers &&
				prev.me === next.me
			);
		}
	}
)(withStyles(styles, { withTheme: true })(ButtonControlBar)));