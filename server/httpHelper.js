exports.loginHelper = function(data)
{
	const html = `<!DOCTYPE html>
	<html>
		<head>
			<meta charset='utf-8'>
			<title>edumeet</title>
		</head>
		<body>
			<script type='text/javascript'>
				let data = ${JSON.stringify(data)};
				try{
				//if (window.opener && window.opener.CLIENT){
				    window.opener.CLIENT.receiveLoginChildWindow(data);
				//}
	
				window.close();
				}
				catch(err){
				}
				finally{
					if (data.room) {
					    // window.location='/'+room;
					    setTimeout(function (){
                            window.location = '/room' + data.room + '?displayName=' + data.displayName + '&loggedIn=1'
					    }, 1000);
					} else 
					{ 
                        window.location = '/room/guestroom';
                    }
				}
			</script>
		</body>
	</html>`;

	return html;
};

exports.logoutHelper = function()
{
	const html = `<!DOCTYPE html>
	<html>
		<head>
			<meta charset='utf-8'>
			<title>edumeet</title>
		</head>
		<body>
			<script type='text/javascript'>
				try{
				window.opener.CLIENT.receiveLogoutChildWindow();

				window.close();
				}
				catch(err){
				 window.location='/'+room; 
				}
			</script>
		</body>
	</html>`;

	return html;
};