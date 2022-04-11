import fetch from 'node-fetch'
import queryString from 'query-string'

export const loginStep2 = async (socket, code) => {
	const client_id = process.env.CLIENT_ID
	const redirect_uri = process.env.CALLBACK_URL
	const client_secret = process.env.CLIENT_SECRET
	const scope =
		'playlist-modify-public playlist-modify-private user-top-read user-read-email user-read-private user-library-read user-modify-playback-state user-read-playback-state user-read-currently-playing streaming app-remote-control'

	if (code === null) {
		socket.emit('error', {
			status: 500,
			msg: 'Missing parameters',
		})
		return
	} else {
		const url = 'https://accounts.spotify.com/api/token'
		const body = {
			grant_type: 'authorization_code',
			code: code,
			scope: scope,
			redirect_uri: redirect_uri,
			client_id: client_id,
			client_secret: client_secret,
		}

		var result = null

		await fetch(url, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type':
					'application/x-www-form-urlencoded;charset=UTF-8',
			},
			body: queryString.stringify(body),
		})
			.then((response) => {
				return response.json()
			})
			.then((data) => {
				result = data
			})

		return result
	}
}

export const createLoginUrl = () => {
	const client_id = process.env.CLIENT_ID
	const redirect_uri = process.env.CALLBACK_URL

	const auth_url =
		'https://accounts.spotify.com/authorize?' +
		queryString.stringify({
			response_type: 'code',
			client_id: client_id,
			redirect_uri: redirect_uri,
			scope: 'playlist-modify-public playlist-modify-private user-top-read user-read-email user-read-private user-library-read user-modify-playback-state user-read-playback-state user-read-currently-playing streaming app-remote-control',
		})

	return auth_url
}
