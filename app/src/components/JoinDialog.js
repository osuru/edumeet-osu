import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withRoomContext } from '../RoomContext';
import classnames from 'classnames';
import isElectron from 'is-electron';
import * as settingsActions from '../actions/settingsActions';
import * as roomActions from '../actions/roomActions';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CookieConsent from 'react-cookie-consent';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import BlockIcon from '@material-ui/icons/Block';
import MicIcon from '@material-ui/icons/Mic';
import VideocamIcon from '@material-ui/icons/Videocam';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import WorkOutlineIcon from '@material-ui/icons/WorkOutline';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import randomString from 'random-string';
import { useHistory, useLocation } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Switch from '@material-ui/core/Switch';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import EditableInput from './Controls/EditableInput';
import Logger from '../Logger';

const logger = new Logger('JoinDialog');

const styles = (theme) =>
	({
		root :
		{
			display              : 'flex',
			width                : '100%',
			height               : '100%',
			backgroundColor      : 'var(--background-color)',
			backgroundImage      : `url(${window.config ? window.config.background : null})`,
			backgroundAttachment : 'fixed',
			backgroundPosition   : 'center',
			backgroundSize       : 'cover',
			backgroundRepeat     : 'no-repeat'
		},
		margin :
		{
			height : theme.spacing(3)
		},
		dialogTitle :
		{
		},
		dialogPaper :
		{
			width                          : '30vw',
			padding                        : theme.spacing(2),
			[theme.breakpoints.down('lg')] :
			{
				width : '40vw'
			},
			[theme.breakpoints.down('md')] :
			{
				width : '50vw'
			},
			[theme.breakpoints.down('sm')] :
			{
				width : '70vw'
			},
			[theme.breakpoints.down('xs')] :
			{
				width : '90vw'
			}
		},
		accountButton :
		{
			padding : 0
		},
		accountButtonAvatar :
		{
			width  : 50,
			height : 50
		},

		green :
		{
			color : '#5F9B2D'
		},
		red :
		{
			color : 'rgba(153, 0, 0, 1)'
		},
		joinButton :
		{
			background : '#2e7031',
			color      : 'white',
			'&:hover'  : {
				backgroundColor : '#2e7031'
			}
		},
		mediaDevicesAnySelectedButton :
		{
			'& .Mui-selected' : {
				color           : 'white',
				backgroundColor : '#5F9B2D',
				'&:hover'       : {
					color           : 'white',
					backgroundColor : '#5F9B2D'
				} }

		},

		mediaDevicesNoneSelectedButton :
		{
			'& .Mui-selected' : {
				color           : 'white',
				backgroundColor : '#f50057',
				'&:hover'       : {
					color           : 'white',
					backgroundColor : '#f50057'
				} }

		},
		switchLabel : {
			justifyContent : 'space-between',
			flex           : 'auto',
			display        : 'flex',
			padding        : theme.spacing(0)
		},
		nested : {
			display       : 'block',
			paddingTop    : 0,
			paddingBottom : 0,
			paddingLeft   : '25px',
			paddingRight  : '25px'
		},
		settings : {
			width           : '100%',
			backgroundColor : theme.palette.background.paper,
			border          : '1px solid black'
		}

	});

const DialogTitle = withStyles((theme) => ({
	root :
	{
		margin  : 0,
		padding : theme.spacing(1)
	}
}))(MuiDialogTitle);

const DialogContent = withStyles((theme) => ({
	root :
	{
		padding    : theme.spacing(2),
		paddingTop : theme.spacing(1)
	}
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
	root :
	{
		margin  : 0,
		padding : theme.spacing(1)
	}
}))(MuiDialogActions);

const JoinDialog = ({
	roomClient,
	room,
	mediaPerms,
	displayName,
	displayNameInProgress,
	loggedIn,
	myPicture,
	changeDisplayName,
	setMediaPerms,
	classes,
	setAudioMuted,
	setVideoMuted,
	setLockRoom,
	setMuteOnJoin,
	signInRequired,
	joinByAccessCode,
	accessCode,
	setEnableRecording
}) =>
{

	const location = useLocation();

	const history = useHistory();

	const intl = useIntl();

	const [ SettingsOpen, setSettingsOpen ] = useState(false);

	let [ _accessCode, setAccessCode ] = useState(roomClient.accessCode);

	displayName = displayName.trimLeft();

	const authTypeDefault = (loggedIn) ? 'auth' : 'guest';

	const [ authType, setAuthType ] = useState(authTypeDefault);

	const [ roomId, setRoomId ] = useState(
		decodeURIComponent(location.pathname.split('/').slice(-1)) ||
		randomString({ length: 20 }).toLowerCase()
	);

	useEffect(() =>
	{
		window.history.replaceState({}, null, `/room/${encodeURIComponent(roomId)}` || '/');

	}, [ roomId ]);

	useEffect(() =>
	{
		(location.pathname === '/') && history.push(`/room/${encodeURIComponent(roomId)}`);
	});

	const _askForPerms = () =>
	{
		if (mediaPerms.video || mediaPerms.audio)
		{
			navigator.mediaDevices.getUserMedia(mediaPerms);
		}
	};

	const handleSetMediaPerms = (event, newMediaPerms) =>
	{

		if (newMediaPerms !== null)
		{
			setMediaPerms(JSON.parse(newMediaPerms));
		}
	};

	const handleSetAuthType = (event, newAuthType) =>
	{
		if (newAuthType !== null)
		{
			setAuthType(newAuthType);
		}

	};

	const handleJoin = () =>
	{
		setAudioMuted(false);

		setVideoMuted(false);

		_askForPerms();

		const encodedRoomId = encodeURIComponent(roomId);

		logger.debug('AAAAAAAAAAAAAA: %o', roomClient);
		roomClient.join({
			roomId     : encodedRoomId,
			joinVideo  : mediaPerms.video,
			joinAudio  : mediaPerms.audio,
			accessCode : accessCode
		});
	};

	const handleFocus = (event) => event.target.select();

	const handleAuth = () =>
	{
		_askForPerms();
		const encodedRoomId = encodeURIComponent(roomId);

		!loggedIn ?
			roomClient.login(encodedRoomId) :
			roomClient.join({
				roomId    : encodedRoomId,
				joinVideo : mediaPerms.video,
				joinAudio : mediaPerms.audio
			});
	};

	const handleJoinUsingEnterKey = (event) =>
	{
		if (event.key === 'Enter') document.getElementById('joinButton').click();
	};

	const handleChangeDisplayName = (event) =>
	{
		const { key } = event;

		switch (key)
		{
			case 'Enter':
			case 'Escape':

			{
				displayName = displayName.trim();

				if (displayName === '')
					changeDisplayName(
						`Guest ${Math.floor(Math.random() * (100000 - 10000)) + 10000}`);
				if (room.inLobby)
					roomClient.changeDisplayName(displayName);
				break;
			}
			default:
				break;
		}
	};

	return (
		<div className={classes.root}>
			<Dialog
				onKeyDown={handleJoinUsingEnterKey}
				open
				classes={{
					paper : classes.dialogPaper
				}}
			>

				<DialogTitle disableTypography className={classes.dialogTitle}>
					<Grid
						container
						direction='row'
						justify='space-between'
						alignItems='center'
					>
						<Grid item>
							{ window.config.logo !=='' ?
								<img alt='Logo' src={window.config.logo} /> :
								<Typography variant='h5'> {window.config.title} </Typography>
							}
						</Grid>
						<Grid item>
							{ window.config.loginEnabled && false &&
							<>
								<Button
									onClick={
										loggedIn ?
											() => roomClient.logout(roomId) :
											() => roomClient.login(roomId)
									}
								>
									{intl.formatMessage({
										id             : loggedIn ? 'label.logout' : 'label.login',
										defaultMessage : loggedIn ? 'Logout' : 'Login'
									})}
								</Button>
								<IconButton
									className={classes.accountButton}
									onClick={
										loggedIn ?
											() => roomClient.logout(roomId) :
											() => roomClient.login(roomId)
									}
								>
									{ myPicture ?
										<Avatar src={myPicture} className={classes.accountButtonAvatar} />
										:
										<AccountCircle
											className={
												classnames(
													classes.accountButtonAvatar, loggedIn ? classes.green : null
												)
											}
										/>
									}
								</IconButton>
							</>
							}
						</Grid>
					</Grid>
				</DialogTitle>

				<DialogContent>
					<hr />
					{/* ROOM NAME */}
					<TextField
						autoFocus
						id='roomId'
						label={intl.formatMessage({
							id             : 'label.roomName',
							defaultMessage : 'Room name'
						})}
						value={roomId}
						variant='outlined'
						margin='normal'
						InputProps={{
							startAdornment : (
								<InputAdornment position='start'>
									<MeetingRoomIcon />
								</InputAdornment>
							)
						}}
						onChange={(event) =>
						{
							const { value } = event.target;

							setRoomId(value.toLowerCase());

						}}
						onFocus={handleFocus}
						onBlur={() =>
						{
							if (roomId === '')
								setRoomId(randomString({ length: 8 }).toLowerCase());
						}}
						fullWidth
					/>
					{/* /ROOM NAME */}

					{/* NAME FIELD */}
					<TextField
						id='displayname'
						label={intl.formatMessage({
							id             : 'label.yourName',
							defaultMessage : 'Your name'
						})}
						// value={loggedIn ? displayName: changeDisplayName(`Guest ${Math.floor(Math.random()
						// * (100000 - 10000)) + 10000}`)}
						value={displayName}
						variant='outlined'
						onFocus={handleFocus}

						InputProps={{
							startAdornment : (
								<InputAdornment position='start'>
									<AccountCircle />
								</InputAdornment>
							)
						}}

						margin='normal'
						disabled={displayNameInProgress}
						onChange={(event) =>
						{
							const { value } = event.target;

							changeDisplayName(value);
						}}
						onKeyDown={handleChangeDisplayName}
						onBlur={() =>
						{
							displayName = displayName.trim();

							if (displayName === '')
								changeDisplayName(`Guest ${Math.floor(Math.random() * (100000 - 10000)) + 10000}`);
							if (room.inLobby)
								roomClient.changeDisplayName(displayName);
						}}
						fullWidth
					/>
					{/* NAME FIELD*/}

					{!room.inLobby && room.overRoomLimit &&
						<DialogContentText className={classes.red} variant='h6' gutterBottom>
							<FormattedMessage
								id='room.overRoomLimit'
								defaultMessage={
									'The room is full, retry after some time.'
								}
							/>
						</DialogContentText>
					}
				</DialogContent>

				{ !room.inLobby ?

					<DialogActions>

						<Grid container
							direction='row'
							justify='space-between'
							alignItems='flex-end'
							spacing={1}
						>

							{/* MEDIA PERMISSIONS TOGGLE BUTTONS */}
							{window.config.loginEnabled &&
							<Grid item>
								<FormControl component='fieldset'>
									<Box mb={1}>
										<FormLabel component='legend'>
											<FormattedMessage
												id='devices.chooseMedia'
												defaultMessage='Choose Media'
											/>
										</FormLabel>
									</Box>
									<ToggleButtonGroup
										value={JSON.stringify(mediaPerms)}
										size='small'
										onChange={handleSetMediaPerms}
										className={
											JSON.stringify(mediaPerms) ===
											'{"audio":false,"video":false}' ?
												classes.mediaDevicesNoneSelectedButton :
												classes.mediaDevicesAnySelectedButton
										}
										aria-label='choose permission'
										exclusive
									>
										<ToggleButton value='{"audio":false,"video":false}'>
											<Tooltip title={intl.formatMessage({
												id             : 'devices.disableBothMicrophoneAndCamera',
												defaultMessage : 'Disable both Microphone And Camera'
											})} placement='bottom'
											>
												<BlockIcon/>
											</Tooltip>
										</ToggleButton>
										<ToggleButton value='{"audio":true,"video":false}'>
											<Tooltip title={intl.formatMessage({
												id             : 'devices.enableOnlyMicrophone',
												defaultMessage : 'Enable only Microphone'
											})} placement='bottom'
											>

												<MicIcon/>
											</Tooltip>
										</ToggleButton>
										<ToggleButton value='{"audio":false,"video":true}'>
											<Tooltip title={intl.formatMessage({
												id             : 'devices.enableOnlyCamera',
												defaultMessage : 'Enable only Camera'
											})} placement='bottom'
											>
												<VideocamIcon/>
											</Tooltip>
										</ToggleButton>
										<ToggleButton value='{"audio":true,"video":true}'>
											<Tooltip title={intl.formatMessage({
												id             : 'devices.enableBothMicrophoneAndCamera',
												defaultMessage : 'Enable both Microphone and Camera'
											})} placement='bottom'
											>
												<span style={{ display: 'flex', flexDirection: 'row' }}>
													<MicIcon/>+<VideocamIcon/>
												</span>
											</Tooltip>
										</ToggleButton>
									</ToggleButtonGroup >
								</FormControl>
							</Grid>
							}
							{/* /MEDIA PERMISSION BUTTONS */}
							{/* AUTH TOGGLE BUTTONS */}
							{/*
							{!loggedIn &&
								<Grid item>
									<ToggleButtonGroup
										value={authType}
										onChange={handleSetAuthType}
										aria-label='choose auth'
										exclusive
									>
										<ToggleButton value='guest'>
											<WorkOutlineIcon/>&nbsp;

											<FormattedMessage
												id='room.joinGuest'
												defaultMessage='Guest'
											/>
										</ToggleButton>

										<ToggleButton value='auth'>
											<VpnKeyIcon/>&nbsp;

											<FormattedMessage
												id='room.joinAuth'
												defaultMessage='Auth'
											/>
										</ToggleButton>

									</ToggleButtonGroup >

								</Grid>

							} */}
							{/* /AUTH TOGGLE BUTTONS */}
							{/* JOIN/AUTH BUTTON */}
							{ !loggedIn &&
								<Grid item >
									<Button
										onClick={handleJoin}
										variant='contained'
										color='primary'
										id='joinButton'
									>
										<FormattedMessage
											id='label.joinGuest'
											defaultMessage='Join as guest'
										/>
									</Button>

								</Grid>
							}
							{
								<Grid item>
									<Button
										onClick={handleAuth}
										variant='contained'
										className={classes.red}
										id='joinButton'
									>
										<FormattedMessage
											id='room.joinAuth'
											defaultMessage='Join as user'
										/>
									</Button>

								</Grid>
							}
							{/* /JOIN BUTTON */}

							{/* /SETTINGS */}
							<Grid item xs={12}>
								<List className={classes.settings} component='nav'>
									<ListItem button onClick={() => setSettingsOpen(!SettingsOpen)}>
										<ListItemText primary={intl.formatMessage({
											id             : 'settings.showAdvanced',
											defaultMessage : 'Advanced settings'
										})}
										/>
										{SettingsOpen ? <ExpandLess /> : <ExpandMore />}
									</ListItem>
									<Collapse in={SettingsOpen} timeout='auto' unmountOnExit>
										<List component='div'>
											<ListItem className={classes.nested}>
												<FormControlLabel
													className={classnames(classes.setting, classes.switchLabel)}
													control={
														<Switch color='secondary'
															checked={setLockRoom}
														/>}
													labelPlacement='start'
													label={intl.formatMessage({
														id             : 'tooltip.lockRoom',
														defaultMessage : 'Enable wait room'
													})}
												/>
											</ListItem>
										</List>
										<List component='div'>
											<ListItem className={classes.nested}>
												<FormControlLabel
													className={classnames(classes.setting, classes.switchLabel)}
													control={
														<Switch color='secondary'
															checked={setMuteOnJoin}
														/>}
													labelPlacement='start'
													label={intl.formatMessage({
														id             : 'room.muteAll',
														defaultMessage : 'Mute all on'
													})}
												/>
											</ListItem>
										</List>
										<List component='div'>
											<ListItem className={classes.nested}>
												<FormControlLabel
													className={classnames(classes.setting, classes.switchLabel)}
													control={
														<Switch color='secondary'
															checked={signInRequired}
														/>}
													labelPlacement='start'
													label={intl.formatMessage({
														id             : 'tooltip.permitGuest',
														defaultMessage : 'Permit guests'
													})}
												/>
											</ListItem>
										</List>
										<List component='div'>
											<ListItem className={classes.nested}>
												<FormControlLabel
													className={classnames(classes.setting, classes.switchLabel)}
													control={
														<Switch color='secondary'
															checked={joinByAccessCode}
															onChange={(event) =>
															{
																roomActions.setJoinByAccessCode(event.target.value);
															}}
														/>}
													labelPlacement='start'
													label={intl.formatMessage({
														id             : 'label.roomCodeEnable',
														defaultMessage : 'Enable passcode to access'
													})}
												/>
											</ListItem>
										</List>
										<List component='div'>
											<ListItem className={classes.nested}>
												<FormControlLabel
													className={classnames(classes.setting)}
													variant='outlined'
													margin='normal'
													control={
														<TextField color='secondary'
															id='passcode'
															onChange={(event) =>
															{
																room.accessCode=event.target.value;
																_accessCode=event.target.value;
																setAccessCode=event.target.value;
																// accessCode=event.target.value;
																roomClient._AccessCode = event.target.value;

																// setAccessCode(event.target.value);
															}}
														/>}
													labelPlacement='start'
													label={intl.formatMessage({
														id             : 'label.roomCode',
														defaultMessage : 'Set passcode'
													})}
												/>
											</ListItem>
										</List>
										<List component='div'>
											<ListItem className={classes.nested}>
												<FormControlLabel
													className={classnames(classes.setting, classes.switchLabel)}
													control={
														<Switch color='secondary'
															checked={setEnableRecording}
														/>}
													labelPlacement='start'
													label={intl.formatMessage({
														id             : 'label.permitRecording',
														defaultMessage : 'Permit recordin'
													})}
												/>
											</ListItem>
										</List>
									</Collapse>
								</List>

							</Grid>
						</Grid>
					</DialogActions>
					:
					<DialogContent>
						<DialogContentText
							className={classes.green}
							gutterBottom
							variant='h6'
							style={{ fontWeight: '600' }}
							align='center'
						>
							<FormattedMessage
								id='room.youAreReady'
								defaultMessage='Ok, you are ready'
							/>
						</DialogContentText>
						{ room.signInRequired ?
							<DialogContentText
								gutterBottom
								variant='h5'
								style={{ fontWeight: '600' }}
							>
								<FormattedMessage
									id='room.emptyRequireLogin'
									defaultMessage={
										`The room is empty! You can Log In to start 
										the meeting or wait until the host joins`
									}
								/>
							</DialogContentText>
							:
							<DialogContentText
								gutterBottom
								variant='h5'
								style={{ fontWeight: '600' }}
							>
								<FormattedMessage
									id='room.locketWait'
									defaultMessage='The room is locked - hang on until somebody lets you in ...'
								/>
							</DialogContentText>
						}
					</DialogContent>
				}

				{ !isElectron() &&
					<CookieConsent buttonText={intl.formatMessage({
						id             : 'room.consentUnderstand',
						defaultMessage : 'I understand'
					})}
					>
						<FormattedMessage
							id='room.cookieConsent'
							defaultMessage='This website uses cookies to enhance the user experience'
						/>
					</CookieConsent>
				}
			</Dialog>
		</div>
	);
};

JoinDialog.propTypes =
{
	roomClient            : PropTypes.any.isRequired,
	room                  : PropTypes.object.isRequired,
	roomId                : PropTypes.string.isRequired,
	displayName           : PropTypes.string.isRequired,
	displayNameInProgress : PropTypes.bool.isRequired,
	loginEnabled          : PropTypes.bool.isRequired,
	loggedIn              : PropTypes.bool.isRequired,
	myPicture             : PropTypes.string,
	changeDisplayName     : PropTypes.func.isRequired,
	setMediaPerms  	      : PropTypes.func.isRequired,
	classes               : PropTypes.object.isRequired,
	mediaPerms            : PropTypes.object.isRequired,
	setAudioMuted         : PropTypes.bool,
	setVideoMuted         : PropTypes.bool,
	setLockRoom           : PropTypes.bool,
	setMuteOnJoin         : PropTypes.bool,
	signInRequired        : PropTypes.bool,
	joinByAccessCode      : PropTypes.bool,
	accessCode            : PropTypes.string,
	setEnableRecording    : PropTypes.bool
};

const mapStateToProps = (state) =>
{
	logger.debug('State AAA: %o', state);

	return {
		room                  : state.room,
		mediaPerms            : state.settings.mediaPerms,
		displayName           : state.settings.displayName,
		displayNameInProgress : state.me.displayNameInProgress,
		loginEnabled          : state.me.loginEnabled,
		loggedIn              : state.me.loggedIn,
		myPicture             : state.me.picture,
		setLockRoom	          : state.settings.setLockRoom,
		setMuteOnJoin         : state.settings.setMuteOnJoin,
		signInRequired        : state.settings.signInRequired,
		joinByAccessCode      : state.room.joinByAccessCode,
		accessCode            : state.room.accessCode,
		setEnableRecording    : state.settings.setEnableRecording
	};
};

const mapDispatchToProps = (dispatch) =>
{

	return {
		changeDisplayName : (displayName) =>
		{
			dispatch(settingsActions.setDisplayName(displayName));
		},

		setMediaPerms : (mediaPerms) =>
		{
			dispatch(settingsActions.setMediaPerms(mediaPerms));
		},
		setAudioMuted : (flag) =>
		{
			dispatch(settingsActions.setAudioMuted(flag));
		},
		setVideoMuted : (flag) =>
		{
			dispatch(settingsActions.setVideoMuted(flag));
		},
		setAccessCode : (accessCode) =>
		{
			dispatch(roomActions.setAccessCode(accessCode));
		},
		setJoinByAccessCode : (accessCode) =>
		{
			dispatch(roomActions.setJoinByAccessCode(accessCode));
		}
	};
};

export default withRoomContext(connect(
	mapStateToProps,
	mapDispatchToProps,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.room.inLobby === next.room.inLobby &&
				prev.room.signInRequired === next.room.signInRequired &&
				prev.room.overRoomLimit === next.room.overRoomLimit &&
				prev.settings.displayName === next.settings.displayName &&
				prev.settings === next.settings &&
				prev.me.displayNameInProgress === next.me.displayNameInProgress &&
				prev.me.loginEnabled === next.me.loginEnabled &&
				prev.me.loggedIn === next.me.loggedIn &&
				prev.me.picture === next.me.picture &&
				prev.room.accessCode === next.room.accessCode
			);
		}
	}
)(withStyles(styles)(JoinDialog)));
