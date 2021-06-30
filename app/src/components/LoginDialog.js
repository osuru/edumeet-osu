import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import isElectron from 'is-electron';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CookieConsent from 'react-cookie-consent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Logger from '../Logger';
import { withRoomContext } from '../RoomContext';
import { connect } from 'react-redux';

const logger = new Logger('LoginDialog');

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
		logo :
		{
			display       : 'block',
			paddingBottom : '1vh'
		},
		loginButton :
		{
			position : 'absolute',
			right    : theme.spacing(2),
			top      : theme.spacing(2),
			padding  : 0
		},
		largeIcon :
		{
			fontSize : '2em'
		},
		largeAvatar :
		{
			width  : 50,
			height : 50
		},
		green :
		{
			color : 'rgba(0, 153, 0, 1)'
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
		padding : theme.spacing(2)
	}
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
	root :
	{
		margin  : 0,
		padding : theme.spacing(1)
	}
}))(MuiDialogActions);

const ChooseRoom = ({
	classes,
	loggedIn,
	room,
	displayName,
	loginEnabled,
	myPicture
}) =>
{
	const intl = useIntl();
	const username = (loggedIn)?displayName:'';
	const roomId = useParams().roomId;

	logger.error('KKKKK: %o %o %o', displayName, loggedIn, room);
	const [ id, setId ] = useState(
		roomId ||
		'guestroom'
	);

	return (
		<div className={classes.root}>
			<Dialog
				open
				classes={{
					paper : classes.dialogPaper
				}}
			>
				<DialogTitle>

					{ window.config.logo !=='' ?
						<img alt='Logo' src={window.config.logo} /> :
						<Typography variant='h5'> {window.config.title} </Typography>
					}
					<hr />

				</DialogTitle>
				{!loggedIn &&
				<form method='post' action={`https://${window.config.host}/auth/callback`}>
					<DialogContent>

						<TextField
							autoFocus
							id='username'
							label={intl.formatMessage({
								id             : 'label.username',
								defaultMessage : 'Username'
							})}
							variant='outlined'
							margin='normal'
							name='username'
							value={username}
							required
							fullWidth
						/>
						<TextField
							id='password'
							label={intl.formatMessage({
								id             : 'label.password',
								defaultMessage : 'Password'
							})}
							variant='outlined'
							margin='normal'
							name='password'
							type='password'
							required
							fullWidth
						/>
						<TextField
							id='roomId'
							label={intl.formatMessage({
								id             : 'label.roomNameLogin',
								defaultMessage : 'Room ID (optional)'
							})}
							variant='outlined'
							margin='normal'
							name='roomName'
							type='text'
							value={id}
							onChange={(event) =>
							{
								const { value } = event.target;

								setId(value.toLowerCase());
							}}
							fullWidth
						/>
					</DialogContent>

					<DialogActions>
						<Button
							variant='contained'
							color='secondary'
							type='submit'
						>
							<FormattedMessage
								id='label.login'
								defaultMessage='Login'
							/>
						</Button>
					</DialogActions>
					<DialogActions>
						<Button
							variant='contained'
							color='secondary'
							type='button'
							onClick={(e) =>
							{
								e.preventDefault();
								window.location.href='/guestroom';
							}}
						>
							<FormattedMessage
								id='label.loginAsGuest'
								defaultMessage='Login as guest'
							/>
						</Button>
					</DialogActions>
				</form>
				}
				{loggedIn &&
				<form method='get' action={`https://${window.config.host}/auth/logout`}>
					<DialogActions>
						<Button
							variant='contained'
							color='secondary'
							type='button'
							onClick={(e) =>
							{
								e.preventDefault();
								window.location.href=`/room/${roomId}`;
							}}
						>
							<FormattedMessage
								id='label.returnToRoom'
								defaultMessage='Return to room'
							/>
						</Button>
					</DialogActions>
					<DialogActions>
						<Button
							variant='contained'
							color='secondary'
							type='submit'
						>
							<FormattedMessage
								id='label.logout'
								defaultMessage='Logout'
							/>
						</Button>
					</DialogActions>
				</form>
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

ChooseRoom.propTypes =
{
	classes      : PropTypes.object.isRequired,
	loggedIn     : PropTypes.bool.isRequired,
	loginEnabled : PropTypes.bool.isRequired,
	displayName  : PropTypes.string.isRequired,
	room         : PropTypes.object.isRequired,
	myPicture    : PropTypes.string
};

const mapStateToProps = (state) =>
{
	logger.debug('State AAA: %o', state);

	return {
		room         : state.room,
		displayName  : state.settings.displayName,
		loginEnabled : state.me.loginEnabled,
		loggedIn     : state.me.loggedIn,
		myPicture    : state.me.picture
	};
};

export default withRoomContext(connect(
	mapStateToProps,
	null,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.settings.displayName === next.settings.displayName &&
				prev.me.loginEnabled === next.me.loginEnabled &&
				prev.me.loggedIn === next.me.loggedIn &&
				prev.me.picture === next.me.picture
			);
		}
	})(withStyles(styles)(ChooseRoom)));
