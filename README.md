# Modified edumeet with recording features

A WebRTC meeting service using [mediasoup](https://mediasoup.org).


## Features

* Audio/Video
* Chat
* Screen sharing
* File sharing
* Different layouts
* Internationalization support

NEW:
* Separate chat button
* Separate many login system buttons
* Configurable side panel
* Seen videos scale up to 32 on screen
* build the app not remove all in /public folder on server

## Manual installation

* Prerequisites:
1) Install NODE
To install see here [here](https://github.com/nodesource/distributions/blob/master/README.md#debinstall).

2) Install ffmpeg or gstreamer
2.1) ffmpeg - `apt install ffmpeg`
Known bugs - ffmpeg not start recording imegiately, got error `cur_dts is invalid`. Sometimes recording start for 1-3 minutes.

2.2) gstreamer - `apt install libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-tools gstreamer1.0-plugins-rtp` 
We recommended using gstreamer

### If use docker - skip this 
```bash
$ sudo apt install git npm build-essential redis
$ git clone https://github.com/osuru/edumeet-osu.git
$ cd edumeet-osu
$ cp server/config/config.example.js server/config/config.js
$ cp app/public/config/config.example.js app/public/config/config.js
```


* Edit your two `server/config/config.js` ans `app/public/config.js` with appropriate settings (listening IP/port, logging options, **valid** TLS certificate, don't forget ip setting in last section in server config: (webRtcTransport), etc).

* Build up the browser app:

```bash
$ cd app
$ npm install
$ npm run build
```

This will build the client application and copy everythink to `server/public` from where the server can host client code to browser requests.

* Prepare up the server:

```bash
$ cd ..
$ cd server
$ npm install
```

## Run it locally

* Run the Node.js server application in a terminal:

```bash
$ cd server
$ npm start
```

* Note: Do not run the server as root. If you need to use port 80/443 make a iptables-mapping for that or use systemd configuration for that (see further down this doc).
* Test your service in a webRTC enabled browser: `https://yourDomainOrIPAdress:3443/roomname`


## Ports and firewall

* 3443/tcp (default https webserver and signaling - adjustable in `server/config.js`)
* 4443/tcp (default `npm start` port for developing with live browser reload, not needed in production environments - adjustable in app/package.json)
* 40000-49999/udp/tcp if server httpOnly=false (media ports - adjustable in `server/config.js`)

## Load balanced installation

To deploy this as a load balanced cluster, have a look at https://github.com/osuru/edumeet-docker-osu

## Learning management integration

To integrate with an LMS (e.g. Moodle), have a look at [LTI](LTI/LTI.md).

## TURN configuration

* You need an additional [TURN](https://github.com/coturn/coturn)-server for clients located behind restrictive firewalls! Add your server and credentials to `server/config/config.js`

if you want dynamic credentials with turn see this function https://github.com/osuru/edumeet-docker-osu/blob/47636ce6147204d91e770ef6e2a76b1319799132/configs/server/config.js#L53

and this config settings  https://github.com/osuru/edumeet-docker-osu/blob/47636ce6147204d91e770ef6e2a76b1319799132/configs/server/config.js#L178

For coturn use this lines:

```
log-file=stdout
tls-listening-port=6443
listening-port=6444
external-ip=111.111.11.111

use-auth-secret
realm=site.example.ru
static-auth-secret=VerySecret

```

## Authors of original system

* Håvar Aambø Fosstveit
* Stefan Otto
* Mészáros Mihály
* Roman Drozd
* Rémai Gábor László
* Piotr Pawałowski

## Authors of fork changes

* Ushakov Yuriy


## License

MIT License (see `LICENSE.md`)


