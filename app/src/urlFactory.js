export function getSignalingUrl(peerId, roomId)
{
	const port =
		process.env.NODE_ENV !== 'production' ?
			window.config.developmentPort
			:
			window.config.productionPort;
	const host = window.config.host || window.location.hostname;
	const url = `wss://${host}:${port}/?peerId=${peerId}&roomId=${roomId}`;

	return url;
}
