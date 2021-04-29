const os = require('os');
// const fs = require('fs');

const userRoles = require('../userRoles');

const {
	BYPASS_ROOM_LOCK,
	BYPASS_LOBBY
} = require('../access');

const {
	CHANGE_ROOM_LOCK,
	PROMOTE_PEER,
	MODIFY_ROLE,
	SEND_CHAT,
	MODERATE_CHAT,
	SHARE_AUDIO,
	SHARE_VIDEO,
	SHARE_SCREEN,
	EXTRA_VIDEO,
	SHARE_FILE,
	MODERATE_FILES,
	MODERATE_ROOM
} = require('../permissions');

// const AwaitQueue = require('awaitqueue');
// const axios = require('axios');

// To gather ip address only on interface like eth0, enp0s3
const ifaceWhiteListRegex = '^(eth.*)|(ens.*)'

function getListenIps() {
	let listenIP = [];
	const ifaces = os.networkInterfaces();
	Object.keys(ifaces).forEach(function (ifname) {
		if (ifname.match(ifaceWhiteListRegex)) {
			ifaces[ifname].forEach(function (iface) {
				if (
					(iface.family !== "IPv4" &&
						(iface.family !== "IPv6" || iface.scopeid !== 0)) ||
					iface.internal !== false
				) {
					// skip over internal (i.e. 127.0.0.1) and non-ipv4 or ipv6 non global addresses
					return;
				}
				listenIP.push({ ip: iface.address, announcedIp: null });
			});
		}
	});
	return listenIP;
}

var getIce = function (secret,url) {
    // Set to a small value.
    const PASSWORD_EXPIRY_SECONDS = 300;
    // Get the AUTH_SECRET used to configure coturns.
    const AUTH_SECRET = secret;
    // Whereever your server can be reached, (IP address, or hostname),
    // with the appropriate TLS certificates.
    const TURN_SERVERS = url;
    // Anything you want, just for documentation.
    const USERNAME = 'onlineosuru';
    const crypto = require('crypto');
  const timestamp = Math.floor(Date.now() / 1000) + PASSWORD_EXPIRY_SECONDS;
  const temporary_username = String(timestamp) + ':' + USERNAME;
  const hmac = crypto.createHmac('sha1', AUTH_SECRET)
     .update(temporary_username).digest('base64');
  return {
    urls: TURN_SERVERS,
    username: temporary_username,
    credential: hmac,
    credentialType: 'password',
  };
}

module.exports =
{

	// Auth conf
	
	auth :
	{
		// Always enabled if configured
	/*	lti :
		{
			consumerKey    : 'key',
			consumerSecret : 'secret'
		},
	    */
		// Auth strategy to use (default oidc)
		strategy : 'saml',
/*		oidc :
		{
			// The issuer URL for OpenID Connect discovery
			// The OpenID Provider Configuration Document
			// could be discovered on:
			// issuerURL + '/.well-known/openid-configuration'

			// e.g. google OIDC config
			// Follow this guide to get credential:  
			// https://developers.google.com/identity/protocols/oauth2/openid-connect
			// use this issuerURL
			// issuerURL     : 'https://accounts.google.com/',
			
/*			issuerURL     : 'https://accounts.google.com',
			clientOptions :
			{
				client_id     : '222217986111-ierjgpp2mr2li40bv2eo0.apps.googleusercontent.com',
				client_secret : 'ETONZ-J1z00225ax-oLeAx',
				scope       		: 'openid email profile',
				// where client.example.com is your edumeet server
				redirect_uri  : 'https://mcu.example.com/auth/callback'
			}*/
/*			issuerURL     : 'https://moodle.example.com',
			clientOptions :
			{
				client_id     : 'veryBIGclientID111.moodle.example.ru',
				client_secret : 'fc0b27c71b66b94d9sdf23er2xc316d0d754c5706c0f2',
				scope       		: 'openid email profile',
				// where client.example.com is your edumeet server
				redirect_uri  : 'https://online.example.ru/auth/callback'
			}

		},
*/	
		saml :
		{
			// where edumeet.example.com is your edumeet server
			callbackUrl    : 'https://example.ru/auth/callback',
			issuer         : 'https://example.ru',
			entryPoint     : 'https://moodle.example2.ru/2saml/saml2/idp/SSOService.php',
			cert: 'MIIEkDCCAvigAwIBAgIJAPo6mPbBvan1MA0GCSqGSIb3DQEBCwUAMF0xCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQxFjAUBgNVBAMMDW1vb2RsZS5vc3UucnUwHhcNMjEwNDE1MTIxNjQ1WhcNMzEwNDE1MTIxNjQ1WjBdMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRYwFAYDVQQDDA1tb29kbGUub3N1LnJ1MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAuVIhQSE3opnPY7/9mV2Yxp4KJY9qt0NBt2y35g9Hpi+7woLBJfokxQ4wUme58y6ZlAFQRIvRH51oBnpSdOvz/e8RYPxCPDTtYdB9VePMSzLIGAxBRYqRX5C4zaBVUXmzXVEeX5J9O7c1HM0mHdAkYqDUKg2GdCzGOt/SyeMgHJ3tOv1DyX9RwLyImF3a7wLi8Wcy6lJGNHHkhhgeA9KLxI8XiXvHPrrwna8kvT0O47jXqyr9dFsyb7qgg5Y0JwhwX560CfnLEuayq6em0XOWPkCDCYIIUYoz7HGxOdyM4X5na3Q+z7etfJ+7MpmsFihfxuNrsQMIzMgNJKYxrEJk81NwKQCzi7GuPwdkxDQb82iZj6gspDKxhz1rVLRaJG3uhuOmbh5pXABpxXR1GOTHYT/ZfYDD5AHRI4UGNxUW3QwDAKdecAOrMrpCmFsj+ylMQ8Iu5nKbzR6jmA09ornH7cEsQ0bewWRmNGWzOb44y8mWvVl/mvuSDEU9UzieLpK9AgMBAAGjUzBRMB0GA1UdDgQWBBQB+Fh8454WVlZgbZbp+PyA5LgAvDAfBgNVHSMEGDAWgBQB+Fh8454WVlZgbZbp+PyA5LgAvDAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBgQCZwftbB0z0g9zVsg8uN57uOp/oKpP2oTR8Q314S4lUVg5A1nyLv7Kj3VZXaxa8CqS8K7t06PbGIrJxx2hAl80RgEpw4A9BJQ8UjbwsDlq5ZflkBbat7A5NrKjl68fi0+5upcfdZ7ABD5cvSI4sXvkTjGBhrVVIv+EC/UzADma9dh7pYjm7h2fnqUvO9RRijg1K0xDT4m/ub8KI8MDlGTJ8z/rli/tGQAeV7rxgYR+RMA7DAxbUosyIgas0n1tpz67SGDH4DWEbJNo19gME+WHXdCYV2VhkO5jZxr+tdlOBO6uK+XyefKdM2KNnkRiGCQQswv/LzcRH6QbwFqvsq4loZHWAtJ+Lginj2rClZYJ2Vm/QsTjWmu+9Bho9keEpuKlDMtXH4SyZmOEh4XqjKOvNPMxnF2ZnPQIqfnC10Zd8UBu7Jko2IKsU+/cpi6YgGlV8pLPk6wIcn9GCN9Df0WrdtMsV+0R7UY7cIsBoj6u6V91IwbjMp8SXWMTC3f46l0o=',
			acceptedClockSkewMs: -1,
//			privateCert    : 'MIIFHDBOBgkqhkiG9w0BBQ0wQTApBgkqhkiG9w0BBQwwHAQIBFZJUL8BwS8CAggAMAwGCCqGSIb3DQIJBQAwFAYIKoZIhvcNAwcECD3QRt/v10d1BIIEyHu1NxWeUoidYkfLI17N2p0ViFmzx+DfjjPf+ugQ+fR3xCMsXfmUSZMY1NeJ3sJG7gk2BIurSntGd8rR1mj5qEtsmpLJNq/algKSs1VHgGB731ltQEq7cCgOXujRIxL8Kgr4miwYf/h7w3NzFTheNFS+oV360X+TLjMvGKWKjNepWczX1ZugE+xIQ5TaRfI8VEKlr7IAoSybpBI/kazzE62TuTyyLzVb4najH1HWYJ8GjdvESA3fUgpNs7DaV1TtGOzqt7ktFOQRqbLF8fCpJUeEUcG2rO871qncT7hvpQ9n5NoSHQnzeTvmwQzpR+y8MRfOwi7g9zox314fO7Ki1dMRv/PE2X85rybgKfHHe53dHlMEH/zJ32zEU+4t+1gQ258AOy3ZR6CCWp7CgzAyzet3eI4Kn9OWTj0DuIrKKkO1dH8Fqe+VTxZMBs2Jn9JjavAN9+kf9K0E3ydtTmP0LveswlREbVKftyzK4NsELEwrGvxt9/62dhuDt9z9xE3WrW3QKccmY/NY6pQ+hs62/CGbBriWr/U+YBC8N/otnl0v2NmFNfhkq8GPp7+SVygAW5I6yeMxOlXD5QFyLWKsq1PvdYIc4gI8X4z4NgDbUiUII74/lGLZGxMsphW35uAM5DepdK+kOC4QN6NPMKkaT3dbWyB1tJ0RsR8oXgH9eZQv9XsSBuRU36GaCqFYAKdSUiX1lC1ostk+LhyROKEuVbJEx5mFIRp6zu998QHTs10d9YNY4AVnBOuvhlBMvSk2VliiD6t0toU2LGgo+4S1IHaEjy4WO4HcadFEQdWrOI2+OZHxOpAPenUHozDOZeengnL1mfzd4qnu4gS1vgO6+86IbuB+B80Bl3Kdmk0JTkD0wAg9kg9I1JvI+3gbKtl4BU69jfg1jaadcqB/b1elcYAGWuSXrrhw3UE+N2dASP4pwfK3l6k/E2MYB8OlOCUaop51iyAkDFBSY6Me3YURGK2qRlVTY7n3xtZ5rO4iSE3Z2PGv26pl7h3qohiMG03UxJO5FqDYJ/wNgw8YdYLIOVTpvU3PCIQ5bwZbFEOK6fxAVnG7QUcFUiVX/dj4thxWb50Yp/iZcILwhsm2A7SOvgM3mJT935XJ5BSJyTdlOajoF5XZCHq8gFqQXXsUPjHVeEv7C/g1dIxB56gMwNeXr8oXZcfv7VAl9CZgdTGQmWArYkPL2ch2IJ/jnO28zngo0ysuqiGEwi/Nbv+0xpehSf897vG8aUcXDURACPCz564X8ejDfJQHne0QmSIvJ9+IBYKA+izqI+JDRZFsOE2XUo5rlSiP+kmMfNpHoCetfY+wzDMN1Oir5AJzi+HLud7WcvISW0GBHvSTkgXgEjkQZOPmQIIIdUgqGFebQjESumFLgLqGmH/eEfN+eLAI2UCCLnOwpxxBjzL4OQ+lHixQHqRQxzuXHUxx1/iGcarhkbkMEvMBVxjMGr/B1rXRtqmAPvRB24IarBlrFmGo+b3m2z8pFqYxLSC6N+yA8Ud8zEsJT5AEGkAxeble1R+SmhAf8HYLyBC4n1rFMH2X+JDCyDqBSXRBvBlPho/DxIVXerNoAmGsWpaAmSX90nlzoMTbEMWThQgkTN9ivgFMyjQjb6R1mqv/w7waaw==',
//			signingCert    : 'MIIEfDCCA2SgAwIBAgIBADANBgkqhkiG9w0BAQsFADCB1jEPMA0GA1UEAwwGbW9vZGxlMQswCQYDVQQGEwJBVTEUMBIGA1UEBwwLbW9vZGxldmlsbGUxITAfBgkqhkiG9w0BCQEWEm1vb2RsZUBtYWlsLm9zdS5ydTFbMFkGA1UECgxS0K3Qu9C10LrRgtGA0L7QvdC90YvQtSDQutGD0YDRgdGLINCe0JPQoyDQsiDRgdC40YHRgtC10LzQtSDQvtCx0YPRh9C10L3QuNGPIE1vb2RsZTEPMA0GA1UECAwGbW9vZGxlMQ8wDQYDVQQLDAZtb29kbGUwHhcNMjEwNDE1MTEwNDAwWhcNMzEwNDEzMTEwNDAwWjCB1jEPMA0GA1UEAwwGbW9vZGxlMQswCQYDVQQGEwJBVTEUMBIGA1UEBwwLbW9vZGxldmlsbGUxITAfBgkqhkiG9w0BCQEWEm1vb2RsZUBtYWlsLm9zdS5ydTFbMFkGA1UECgxS0K3Qu9C10LrRgtGA0L7QvdC90YvQtSDQutGD0YDRgdGLINCe0JPQoyDQsiDRgdC40YHRgtC10LzQtSDQvtCx0YPRh9C10L3QuNGPIE1vb2RsZTEPMA0GA1UECAwGbW9vZGxlMQ8wDQYDVQQLDAZtb29kbGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDT50Kyd0DT2VLQX+QWuzpjklrJ7x526UEENB94UJJSjl5eH2WwtjSZQjKIfW2BdbR8WPhxCH7StqI8zvhv6BBGwNB7zEH5Eu/FNxkVIYtjT3/lDOOwYNpDxD4veguXIyqyRVMpehzvdCNHLQh2Th4A6WH9KtQp8PlfK9J1k06nF8pquJXK+dRDm7bkJ6iKmxxpxk+Y+kBHhb2N4iXRcjvyzqrgZ4/KfUktW7ic5r5F2LO40UshoFD4H7eaUMXdw5U4FM5TbkuvCAtOZyuG7Kqq8nl5d1rcIEiRGo+vhS7JCW7l2npzupWcQO6yhazKOqYssaGnU+z4XrynnC5QknFzAgMBAAGjUzBRMB0GA1UdDgQWBBSy+id3pqqH7rOvcm/HTXqSyvSlADAfBgNVHSMEGDAWgBSy+id3pqqH7rOvcm/HTXqSyvSlADAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQA56WB6XAPkGrn0I9JRgfyWhgpJTx7f94gzgzk2wkP5Pcpe/rf5FR/Tf5/4WEZbtxEVqcM6hFJ5t2y/CoCx8IH9AI/1/AFalbmiu/bU8DeoZJ3xLPDfzO7mFilpmx4KvRVjDCgxTMYbT3suY6FKPLHlIGm+5DsZ9QbpiJ4vXDXpsiCbSK50VK+W+DqY7pA/6ZiOjxENJNr6SFBS2weKl12lZ5VbSR71kUcnnqUiOX1pYV8WIeHmAKg1YLIrfG3wkDVqtYLkFHBuIMmKl8mE7CRv7XdZBIKMCwIlRP+OhsKzgnHu4K4NkMndgAnucGEC2Ks2HnlvSnEz2guR+VYu6jWv',
//			decryptionPvk  : 'MIIFHDBOBgkqhkiG9w0BBQ0wQTApBgkqhkiG9w0BBQwwHAQIBFZJUL8BwS8CAggAMAwGCCqGSIb3DQIJBQAwFAYIKoZIhvcNAwcECD3QRt/v10d1BIIEyHu1NxWeUoidYkfLI17N2p0ViFmzx+DfjjPf+ugQ+fR3xCMsXfmUSZMY1NeJ3sJG7gk2BIurSntGd8rR1mj5qEtsmpLJNq/algKSs1VHgGB731ltQEq7cCgOXujRIxL8Kgr4miwYf/h7w3NzFTheNFS+oV360X+TLjMvGKWKjNepWczX1ZugE+xIQ5TaRfI8VEKlr7IAoSybpBI/kazzE62TuTyyLzVb4najH1HWYJ8GjdvESA3fUgpNs7DaV1TtGOzqt7ktFOQRqbLF8fCpJUeEUcG2rO871qncT7hvpQ9n5NoSHQnzeTvmwQzpR+y8MRfOwi7g9zox314fO7Ki1dMRv/PE2X85rybgKfHHe53dHlMEH/zJ32zEU+4t+1gQ258AOy3ZR6CCWp7CgzAyzet3eI4Kn9OWTj0DuIrKKkO1dH8Fqe+VTxZMBs2Jn9JjavAN9+kf9K0E3ydtTmP0LveswlREbVKftyzK4NsELEwrGvxt9/62dhuDt9z9xE3WrW3QKccmY/NY6pQ+hs62/CGbBriWr/U+YBC8N/otnl0v2NmFNfhkq8GPp7+SVygAW5I6yeMxOlXD5QFyLWKsq1PvdYIc4gI8X4z4NgDbUiUII74/lGLZGxMsphW35uAM5DepdK+kOC4QN6NPMKkaT3dbWyB1tJ0RsR8oXgH9eZQv9XsSBuRU36GaCqFYAKdSUiX1lC1ostk+LhyROKEuVbJEx5mFIRp6zu998QHTs10d9YNY4AVnBOuvhlBMvSk2VliiD6t0toU2LGgo+4S1IHaEjy4WO4HcadFEQdWrOI2+OZHxOpAPenUHozDOZeengnL1mfzd4qnu4gS1vgO6+86IbuB+B80Bl3Kdmk0JTkD0wAg9kg9I1JvI+3gbKtl4BU69jfg1jaadcqB/b1elcYAGWuSXrrhw3UE+N2dASP4pwfK3l6k/E2MYB8OlOCUaop51iyAkDFBSY6Me3YURGK2qRlVTY7n3xtZ5rO4iSE3Z2PGv26pl7h3qohiMG03UxJO5FqDYJ/wNgw8YdYLIOVTpvU3PCIQ5bwZbFEOK6fxAVnG7QUcFUiVX/dj4thxWb50Yp/iZcILwhsm2A7SOvgM3mJT935XJ5BSJyTdlOajoF5XZCHq8gFqQXXsUPjHVeEv7C/g1dIxB56gMwNeXr8oXZcfv7VAl9CZgdTGQmWArYkPL2ch2IJ/jnO28zngo0ysuqiGEwi/Nbv+0xpehSf897vG8aUcXDURACPCz564X8ejDfJQHne0QmSIvJ9+IBYKA+izqI+JDRZFsOE2XUo5rlSiP+kmMfNpHoCetfY+wzDMN1Oir5AJzi+HLud7WcvISW0GBHvSTkgXgEjkQZOPmQIIIdUgqGFebQjESumFLgLqGmH/eEfN+eLAI2UCCLnOwpxxBjzL4OQ+lHixQHqRQxzuXHUxx1/iGcarhkbkMEvMBVxjMGr/B1rXRtqmAPvRB24IarBlrFmGo+b3m2z8pFqYxLSC6N+yA8Ud8zEsJT5AEGkAxeble1R+SmhAf8HYLyBC4n1rFMH2X+JDCyDqBSXRBvBlPho/DxIVXerNoAmGsWpaAmSX90nlzoMTbEMWThQgkTN9ivgFMyjQjb6R1mqv/w7waaw==',
//			decryptionCert : 'MIIEfDCCA2SgAwIBAgIBADANBgkqhkiG9w0BAQsFADCB1jEPMA0GA1UEAwwGbW9vZGxlMQswCQYDVQQGEwJBVTEUMBIGA1UEBwwLbW9vZGxldmlsbGUxITAfBgkqhkiG9w0BCQEWEm1vb2RsZUBtYWlsLm9zdS5ydTFbMFkGA1UECgxS0K3Qu9C10LrRgtGA0L7QvdC90YvQtSDQutGD0YDRgdGLINCe0JPQoyDQsiDRgdC40YHRgtC10LzQtSDQvtCx0YPRh9C10L3QuNGPIE1vb2RsZTEPMA0GA1UECAwGbW9vZGxlMQ8wDQYDVQQLDAZtb29kbGUwHhcNMjEwNDE1MTEwNDAwWhcNMzEwNDEzMTEwNDAwWjCB1jEPMA0GA1UEAwwGbW9vZGxlMQswCQYDVQQGEwJBVTEUMBIGA1UEBwwLbW9vZGxldmlsbGUxITAfBgkqhkiG9w0BCQEWEm1vb2RsZUBtYWlsLm9zdS5ydTFbMFkGA1UECgxS0K3Qu9C10LrRgtGA0L7QvdC90YvQtSDQutGD0YDRgdGLINCe0JPQoyDQsiDRgdC40YHRgtC10LzQtSDQvtCx0YPRh9C10L3QuNGPIE1vb2RsZTEPMA0GA1UECAwGbW9vZGxlMQ8wDQYDVQQLDAZtb29kbGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDT50Kyd0DT2VLQX+QWuzpjklrJ7x526UEENB94UJJSjl5eH2WwtjSZQjKIfW2BdbR8WPhxCH7StqI8zvhv6BBGwNB7zEH5Eu/FNxkVIYtjT3/lDOOwYNpDxD4veguXIyqyRVMpehzvdCNHLQh2Th4A6WH9KtQp8PlfK9J1k06nF8pquJXK+dRDm7bkJ6iKmxxpxk+Y+kBHhb2N4iXRcjvyzqrgZ4/KfUktW7ic5r5F2LO40UshoFD4H7eaUMXdw5U4FM5TbkuvCAtOZyuG7Kqq8nl5d1rcIEiRGo+vhS7JCW7l2npzupWcQO6yhazKOqYssaGnU+z4XrynnC5QknFzAgMBAAGjUzBRMB0GA1UdDgQWBBSy+id3pqqH7rOvcm/HTXqSyvSlADAfBgNVHSMEGDAWgBSy+id3pqqH7rOvcm/HTXqSyvSlADAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQA56WB6XAPkGrn0I9JRgfyWhgpJTx7f94gzgzk2wkP5Pcpe/rf5FR/Tf5/4WEZbtxEVqcM6hFJ5t2y/CoCx8IH9AI/1/AFalbmiu/bU8DeoZJ3xLPDfzO7mFilpmx4KvRVjDCgxTMYbT3suY6FKPLHlIGm+5DsZ9QbpiJ4vXDXpsiCbSK50VK+W+DqY7pA/6ZiOjxENJNr6SFBS2weKl12lZ5VbSR71kUcnnqUiOX1pYV8WIeHmAKg1YLIrfG3wkDVqtYLkFHBuIMmKl8mE7CRv7XdZBIKMCwIlRP+OhsKzgnHu4K4NkMndgAnucGEC2Ks2HnlvSnEz2guR+VYu6jWv',
/*			decryptionPvk  : fs.readFileSync('config/saml_privkey.pem', 'utf-8'),
			decryptionCert : fs.readFileSync('config/saml_cert.pem', 'utf-8'),
			// Federation cert
			cert           : fs.readFileSync('config/federation_cert.pem', 'utf-8')*/
		},

		// to create password hash use: node server/utils/password_encode.js cleartextpassword

		local :
		{
			users : [
				{
					id           : 1,
					username     : 'alice',
					passwordHash : '$2b$10$PAXXw.6cL3zJLd7ZX.AnL.sFg2nxjQPDmMmGSOQYIJSa0TrZ9azG6',
					displayName  : 'Alice',
					emails       : [ { value: 'alice@atlanta.com' } ],
					meet_roles   : [ ]
				},
				{
					id           : 2,
					username     : 'bob',
					passwordHash : '$2b$10$BzAkXcZ54JxhHTqCQcFn8.H6klY/G48t4jDBeTE2d2lZJk/.tvv0G',
					displayName  : 'Bob',
					emails       : [ { value: 'bob@biloxi.com' } ],
					meet_roles   : [ ]
				}
			]
		}
	},
/*	*/
	// URI and key for requesting geoip-based TURN server closest to the client
	turnAPIKey    : 'examplekey',
//	turnAPIURI    : 'https://online.example2.ru:6443/api/turn',
	turnAPIparams : {
		'uri_schema' 	: 'turn',
		'transport' 		: 'tcp',
		'ip_ver'    		: 'ipv4',
		'servercount'	: '2'
	},
	turnAPITimeout    : 2 * 1000,
	// Backup turnservers if REST fails or is not configured
/*	backupTurnServers : [
		{
			urls : [
				'turns:online.example2.ru:6443?transport=tcp'
			],
			username   : 'example',
			credential : 'example'
		}
	]*/
	get backupTurnServers(){return [getIce('examplekey', [
						'turn:online.example2.ru:6444?transport=udp',
						'turn:online.example2.ru:6445?transport=tcp',
						'turns:online.example2.ru:443?transport=tcp'	
						])];
				},
//	get backupTurnServers(){return [getIce(['turn:online.example2.ru:6444?transport=udp'])];},
	
	// bittorrent tracker
//	fileTracker  : 'wss://tracker.lab.vvc.niif.hu:443',
	fileTracker  : 'wss://tracker.openwebtorrent.com:443',
	// redis server options
	redisOptions : {host: '192.168.199.159',  password: 'hd8qu31ch32131312k27s9b9allnc93u4m7umu8c2t'},
	// session cookie secret
	cookieSecret : 'T0P-S3cR3t_cook!e',
	cookieName   : 'example.ru',
	// if you use encrypted private key the set the passphrase
	tls          :
	{
		cert : `${__dirname}/../certs/mediasoup-demo.localhost.cert.pem`,
		// passphrase: 'key_password'
		key  : `${__dirname}/../certs/mediasoup-demo.localhost.key.pem`
	},
	// listening Host or IP 
	// If omitted listens on every IP. ("0.0.0.0" and "::")
	// listeningHost: 'localhost',
	// Listening port for https server.
	listeningPort         : 443,
	// Any http request is redirected to https.
	// Listening port for http server.
	//listeningRedirectPort : disabled,
	// Listens only on http, only on listeningPort
	// listeningRedirectPort disabled
	// use case: loadbalancer backend
	httpOnly              : false,
	// WebServer/Express trust proxy config for httpOnly mode
	// You can find more info:
	//  - https://expressjs.com/en/guide/behind-proxies.html
	//  - https://www.npmjs.com/package/proxy-addr
	// use case: loadbalancer backend
	trustProxy            : '1',
	// This logger class will have the log function
	// called every time there is a room created or destroyed,
	// or peer created or destroyed. This would then be able
	// to log to a file or external service.
	 StatusLogger          : class
	{
		constructor()
		{
			//this._queue = new AwaitQueue();
		}

		// rooms: rooms object
		// peers: peers object
		// eslint-disable-next-line no-unused-vars
		async log({ rooms, peers })
		{
			//this._queue.push(async () =>
			{
				// Do your logging in here, use queue to keep correct order

				// eslint-disable-next-line no-console
				console.log('Number of rooms: ', rooms.size);
				// eslint-disable-next-line no-console
				console.log('Number of peers: ', peers.size);
			}/*)
				.catch((error) =>
				{
					// eslint-disable-next-line no-console
					console.log('error in log', error);
				});*/
		}
	}, 
	// This function will be called on successful login through oidc.
	// Use this function to map your oidc userinfo to the Peer object.
	// The roomId is equal to the room name.
	// See examples below.
	// Examples:
	/*
	// All authenticated users will be MODERATOR and AUTHENTICATED
	userMapping : async ({ peer, room, roomId, userinfo }) =>
	{
		peer.addRole(userRoles.MODERATOR);
		peer.addRole(userRoles.AUTHENTICATED);
	},
	// All authenticated users will be AUTHENTICATED,
	// and those with the moderator role set in the userinfo
	// will also be MODERATOR

	userMapping : async ({ peer, room, roomId, userinfo }) =>
	{
		if (
			Array.isArray(userinfo.meet_roles) &&
			userinfo.meet_roles.includes('moderator')
		)
		{
			peer.addRole(userRoles.MODERATOR);
		}

		if (
			Array.isArray(userinfo.meet_roles) &&
			userinfo.meet_roles.includes('meetingadmin')
		)
		{
			peer.addRole(userRoles.ADMIN);
		}

		peer.addRole(userRoles.AUTHENTICATED);
	},
    */
	// First authenticated user will be moderator,
	// all others will be AUTHENTICATED

/*	userMapping : async ({ peer, room, roomId, userinfo }) =>
	{
		if (room)
		{
			const peers = room.getJoinedPeers();

			if (peers.some((_peer) => _peer.authenticated))
				peer.addRole(userRoles.AUTHENTICATED);
			else
			{
				peer.addRole(userRoles.MODERATOR);
				peer.addRole(userRoles.AUTHENTICATED);
			}
		}
	console.log(peer);
	},*/
	// All authenticated users will be AUTHENTICATED,
	// and those with email ending with @example.com
	// will also be MODERATOR
/*
	userMapping : async ({ peer, room, roomId, userinfo }) =>
	{
		if (userinfo.email && userinfo.email.endsWith('@example.com'))
		{
			peer.addRole(userRoles.MODERATOR);
		}
		peer.addRole(userRoles.AUTHENTICATED);
	},
	// All authenicated users will be AUTHENTICATED,
	// and those with email ending with @example.com
	// will also be MODERATOR
    
	userMapping : async ({ peer, room, roomId, userinfo }) =>
	{
		if (userinfo.email && userinfo.email.endsWith('@example.com'))
		{
			peer.addRole(userRoles.MODERATOR);
		}
		peer.addRole(userRoles.AUTHENTICATED);
	},
	*/
	// eslint-disable-next-line no-unused-vars
	userMapping           : async ({ peer, room, roomId, userinfo }) =>
	{
		if (userinfo.picture != null)
		{
			if (!userinfo.picture.match(/^http/g))
			{
				peer.picture = `data:image/jpeg;base64, ${userinfo.picture}`;
			}
			else
			{
				peer.picture = userinfo.picture;
			}
		}
		if (userinfo['urn:oid:0.9.2342.19200300.100.1.60'] != null)
		{
			peer.picture = `data:image/jpeg;base64, ${userinfo['urn:oid:0.9.2342.19200300.100.1.60']}`;
		}

		if (userinfo.nickname != null)
		{
			peer.displayName = userinfo.nickname;
		}

		if (userinfo.name != null)
		{
			peer.displayName = userinfo.name;
		}

		if (userinfo.displayName != null)
		{
			peer.displayName = userinfo.displayName;
		}

		if (userinfo['urn:oid:2.16.840.1.113730.3.1.241'] != null)
		{
			peer.displayName = userinfo['urn:oid:2.16.840.1.113730.3.1.241'];
		}

		if (userinfo.email != null)
		{
			peer.email = userinfo.email;
		}

		if (room) //FIRST = MODERATOR
		{
			const peers = room.getJoinedPeers();

			if (peers.some((_peer) => _peer.authenticated))
				peer.addRole(userRoles.AUTHENTICATED);
			else
			{
				peer.addRole(userRoles.MODERATOR);
				peer.addRole(userRoles.AUTHENTICATED);
			}
		}
	    if ( ! peer.displayName) {peer.displayName=userinfo.firstname+' '+userinfo.lastname;}
	    if ( ! peer.displayName) {peer.displayName='Student';}
//	console.log(peer);
//	console.log(userinfo);

	},
	// All users have the role "NORMAL" by default. Other roles need to be
	// added in the "userMapping" function. The following accesses and
	// permissions are arrays of roles. Roles can be changed in userRoles.js
	//
	// Example:
	// [ userRoles.MODERATOR, userRoles.AUTHENTICATED ]
	accessFromRoles : {
		// The role(s) will gain access to the room
		// even if it is locked (!)
		[BYPASS_ROOM_LOCK] : [ userRoles.ADMIN ],
		// The role(s) will gain access to the room without
		// going into the lobby. If you want to restrict access to your
		// server to only directly allow authenticated users, you could
		// add the userRoles.AUTHENTICATED to the user in the userMapping
		// function, and change to 
		//[BYPASS_LOBBY] : [ userRoles.AUTHENTICATED ]
		 [BYPASS_LOBBY]     : [ userRoles.NORMAL ]
	},
	permissionsFromRoles : {
		// The role(s) have permission to lock/unlock a room
		[CHANGE_ROOM_LOCK] : [ userRoles.MODERATOR ],
		// The role(s) have permission to promote a peer from the lobby
		[PROMOTE_PEER]     : [ userRoles.NORMAL ],
		// The role(s) have permission to give/remove other peers roles
		[MODIFY_ROLE]      : [ userRoles.MODERATOR ],
		// The role(s) have permission to send chat messages
		[SEND_CHAT]        : [ userRoles.NORMAL ],
		// The role(s) have permission to moderate chat
		[MODERATE_CHAT]    : [ userRoles.MODERATOR ],
		// The role(s) have permission to share audio
		[SHARE_AUDIO]      : [ userRoles.NORMAL ],
		// The role(s) have permission to share video
		[SHARE_VIDEO]      : [ userRoles.NORMAL ],
		// The role(s) have permission to share screen
		[SHARE_SCREEN]     : [ userRoles.NORMAL ],
		// The role(s) have permission to produce extra video
		[EXTRA_VIDEO]      : [ userRoles.NORMAL ],
		// The role(s) have permission to share files
		[SHARE_FILE]       : [ userRoles.NORMAL ],
		// The role(s) have permission to moderate files
		[MODERATE_FILES]   : [ userRoles.MODERATOR ],
		// The role(s) have permission to moderate room (e.g. kick user)
		[MODERATE_ROOM]    : [ userRoles.MODERATOR ]
	},
	// Array of permissions. If no peer with the permission in question
	// is in the room, all peers are permitted to do the action. The peers
	// that are allowed because of this rule will not be able to do this 
	// action as soon as a peer with the permission joins. In this example
	// everyone will be able to lock/unlock room until a MODERATOR joins.
	allowWhenRoleMissing : [ CHANGE_ROOM_LOCK ],
	// When true, the room will be open to all users as long as there
	// are allready users in the room
	activateOnHostJoin   : true,
	// When set, maxUsersPerRoom defines how many users can join
	// a single room. If not set, there is no limit.
	// maxUsersPerRoom    : 20,
	// Room size before spreading to new router
	routerScaleSize      : 40,
	// Socket timeout value
	requestTimeout       : 20000,
	// Socket retries when timeout
	requestRetries       : 3,
	// Mediasoup settings
	mediasoup            :
	{
		numWorkers : Object.keys(os.cpus()).length,
		// mediasoup Worker settings.
		worker     :
		{
//			logLevel : 'debug',
			logLevel : 'error',
			logTags  :
			[
				'info',
				'ice',
				'dtls',
				'rtp',
				'srtp',
				'rtcp'
			],
			rtcMinPort : 40000,
			rtcMaxPort : 49999
		},
		// mediasoup Router settings.
		router :
		{
			// Router media codecs.
			mediaCodecs :
			[
				{
					kind      : 'audio',
					mimeType  : 'audio/opus',
					clockRate : 48000,
					channels  : 2
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP8',
					clockRate  : 90000,
					parameters :
					{
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP9',
					clockRate  : 90000,
					parameters :
					{
						'profile-id'             : 2,
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters :
					{
						'packetization-mode'      : 1,
						'profile-level-id'        : '4d0032',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters :
					{
						'packetization-mode'      : 1,
						'profile-level-id'        : '42e01f',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				}
			]
		},
		// mediasoup WebRtcTransport settings.
		webRtcTransport :
		{	enableTcp: true,
			
			listenIps : //getListenIps(),
			[
				// change 192.0.2.1 IPv4 to your server's IPv4 address!!
				{ ip: '192.168.199.159', announcedIp: null }

				// Can have multiple listening interfaces
				// change 2001:DB8::1 IPv6 to your server's IPv6 address!!
				// { ip: '2001:DB8::1', announcedIp: null }
			],
			initialAvailableOutgoingBitrate : 1000000,
			minimumAvailableOutgoingBitrate : 600000,
			// Additional options that are not part of WebRtcTransportOptions.
			maxIncomingBitrate              : 1500000
		},
	      plainRtpTransport: {
		    listenIp: { ip: '0.0.0.0', announcedIp: undefined }, // TODO: Change announcedIp to your external IP or domain name
		    rtcpMux: true,
		    comedia: false
  }

	}

	
	,
	// Prometheus exporter
	prometheus : {
		deidentify : false, // deidentify IP addresses
		// listen     : 'localhost', // exporter listens on this address
		numeric    : false, // show numeric IP addresses
		port       : 8889, // allocated port
		quiet      : false // include fewer labels
	}
	
};

