import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import queryString from 'query-string'
import fetch from 'node-fetch'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { Room, roomStatus } from './room.js'
import { User } from './user.js'
import { Song } from './song.js'

const app = express()
const httpServer = createServer()
const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
	path: '/ws',
})

const PORT = process.env.PORT

console.log(`PORT: ${process.env.PORT}`)
console.log(`Callback URL: ${process.env.CALLBACK_URL}`)
console.log(`CLIENT_ID: ${process.env.CLIENT_ID}`)
console.log(`CLIENT_SECRET: ${process.env.CLIENT_SECRET}`)

app.use(cors())

var USERS = []
var ROOMS = []
var ACTIVE_USERS = 0

const firstConnect = (id, socket) => {
	// Handles the first connection before log in.
}

const broadcastRoomUpdates = (room) => {
	io.to(room.code).emit('roomStatus', room)
}

io.on('connection', (socket) => {
	ACTIVE_USERS++
	var id = socket.id
	firstConnect(id, socket)
	socket.emit('connected')

	socket.on('disconnect', () => {
		console.log(`User disconnected`)
		ACTIVE_USERS--
	})

	socket.on('getStats', () => {
		let activeGames = 0
		for (let r in ROOMS) {
			if (r.status == 'active') {
				activeGames++
			}
		}
		socket.emit('stats', {
			activeUsers: ACTIVE_USERS,
			activeGames: activeGames,
		})
	})

	socket.on(
		'createRoom',
		({ userId, roomCode, nrOfSongs, showCorrectGuesses, timeRange }) => {
			if (
				roomCode !== undefined &&
				nrOfSongs !== undefined &&
				showCorrectGuesses !== undefined
			) {
				let user = USERS.find((user) => user.id === userId)
				let room = ROOMS.find((room) => room.code === roomCode)

				if (!user) {
					socket.emit('logout', {
						status: 500,
						msg: 'Could not find your user, plase log in again.',
					})
					return
				}

				if (room) {
					if (room.status === roomStatus[0]) {
						socket.emit('redirect', {
							status: 303,
							msg: 'Game created but not started',
							id: room.code,
						})
					} else if (room.status === roomStatus[1]) {
						socket.emit('error', {
							status: 401,
							msg: 'Game already started',
						})
					} else if (room.status === roomStatus[2]) {
						// socket redirect to result page
						socket.emit('redirect', {
							status: 303,
							msg: 'Game has ended',
							id: room.code,
						})
					}
				} else {
					// create new room
					let room = new Room(roomCode, user)
					room.settings.timeRange = timeRange
					room.settings.nrOfSongs = nrOfSongs
					room.settings.showCorrectGuesses = showCorrectGuesses

					// add room to rooms
					ROOMS.push(room)

					// redirect user to room
					socket.emit('redirect', {
						status: 303,
						msg: '',
						id: room.code,
					})

					console.log(`\n${userId} created a room: ${roomCode}\n`)
				}
			} else {
				socket.emit('error', {
					status: 500,
					msg: 'Missing parameters',
				})
			}
		}
	)

	socket.on('login', ({ id, img, name }) => {
		console.log('User logged in: ', id, img, name)

		// Check if user is alredy logged in
		let user = USERS.find((user) => user.id === id)

		if (user && user.socketid != socket.id) {
			console.log('Found old client, logging it out.')
			io.to(user.socketid).emit('logout', {
				status: 303,
				msg: 'You have switched to another client',
			})

			user.id = id
			user.img = img
			user.name = name
			user.socketid = socket.id
		} else {
			user = new User(id, img, name, socket.id)
			USERS.push(user)
		}

		if (
			user.room &&
			(user.room.status === roomStatus[0] ||
				user.room.status === roomStatus[1])
		) {
			socket.emit('redirect', {
				status: 303,
				msg: 'Game created',
				route: `/room/${user.room}`,
			})
		}

		return
	})

	socket.on('makePlayerGuess', ({ roomId, userId, songId, guess }) => {
		console.log(roomId, userId, songId, guess)
		let room = ROOMS.find((room) => room.code === roomId)
		let user = USERS.find((user) => user.id === userId)

		if (room && user) {
			if (room.status === roomStatus[1]) {
				user.makeGuess(songId, guess)
			}
		}
	})

	socket.on('joinRoom', ({ userId, roomCode }, callback) => {
		console.log(`[${roomCode}] ${userId} want's to join the room`)

		let user = USERS.find((user) => user.id === userId)
		let room = ROOMS.find((room) => room.code === roomCode)

		if (!user) {
			console.log('[ERROR] No user')
			socket.emit('error', {
				status: 404,
				msg: 'The user does not exist',
			})
			return
		}

		if (!room) {
			console.log('[ERROR] No room')
			socket.emit('redirect', {
				status: 404,
				msg: 'This room does not exist',
			})
			return
		}

		if (room.status === roomStatus[0]) {
			user.clearGuesses()
		}

		if (room.status === roomStatus[1] && user.room != room.code) {
			console.log('[REDIRECT] Game has already started')
			socket.emit('error', {
				status: 303,
				msg: 'Game has already started',
			})
			return
		}

		if (room.status === roomStatus[2]) {
			callback({
				status: 200,
				room: room,
			})
			return
		}

		if (room.hasUser(user)) {
			console.log(`[${roomCode}] User is already in room`)

			room.switchUserClient(user, socket)
			broadcastRoomUpdates(room)
			return
		}

		console.log(`[${roomCode}] Adding user ${user.id} to room`)

		// Add room to user object
		user.room = room.code

		// Add user in list of users in the room
		room.addUserToRoom(user, socket)

		// Update everyone in the room that a new user has joined
		broadcastRoomUpdates(room)

		callback({
			status: 200,
			room: room,
		})
	})

	socket.on('leaveRoom', ({ userId, roomCode }) => {
		let user = USERS.find((user) => user.id === userId)
		let room = ROOMS.find((room) => room.code === roomCode)

		if (!user) {
			console.log('[ERROR] No user')
			socket.emit('error', {
				status: 404,
				msg: 'The user does not exist',
			})
			return
		}

		if (!room) {
			console.log('[ERROR] No room')
			socket.emit('redirect', {
				status: 404,
				msg: 'This room does not exist',
			})
			return
		}

		room.removeUserFromRoom(user)
		socket.leave(room.code)
		user.room = null
		broadcastRoomUpdates(room)

		console.log(`[${roomCode}] ${userId} left the room`)
		return
	})

	socket.on('login-step-1', () => {
		const client_id = process.env.CLIENT_ID
		const redirect_uri = process.env.CALLBACK_URL

		const auth_url =
			'https://accounts.spotify.com/authorize?' +
			queryString.stringify({
				response_type: 'code',
				client_id: client_id,
				redirect_uri: redirect_uri,
				scope: 'user-top-read user-read-email user-read-private user-library-read user-modify-playback-state user-read-playback-state user-read-currently-playing streaming app-remote-control',
			})
		socket.emit('login', auth_url)
	})

	socket.on('refresh-token', async (refresh_token) => {
		const client_id = process.env.CLIENT_ID
		const client_secret = process.env.CLIENT_SECRET
		if (
			refresh_token == null ||
			refresh_token == '' ||
			refresh_token == undefined
		) {
			socket.emit('error', { status: 500, msg: 'Missing parameters' })
			return
		}

		const url = 'https://accounts.spotify.com/api/token'
		const body = {
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
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
		socket.emit('refreshToken', result)
	})

	socket.on('startGame', ({ roomCode }) => {
		console.log(`[${roomCode}] Starting game`)
		let room = ROOMS.find((room) => room.code === roomCode)
		room.compileSongList()
		room.status = roomStatus[1]

		broadcastRoomUpdates(room)

		// io.to(roomCode).emit('startGame', room)
	})

	socket.on('topSongs', ({ userId, songs }) => {
		console.log(`[${userId}] Top songs`, songs.length)
		let user = USERS.find((user) => user.id === userId)
		let room = ROOMS.find((room) => room.code === user.room)
		user.songs = songs

		broadcastRoomUpdates(room)
	})

	socket.on('nextQuestion', ({ roomCode }) => {
		console.log(`[${roomCode}] Next question`)
		let room = ROOMS.find((room) => room.code === roomCode)
		room.nextQuestion()

		if (room.status === roomStatus[2]) {
			room.endGame()
		}

		broadcastRoomUpdates(room)
	})

	socket.on('login-step-2', async (code) => {
		const client_id = process.env.CLIENT_ID
		const redirect_uri = process.env.CALLBACK_URL
		const client_secret = process.env.CLIENT_SECRET
		const scope =
			'user-top-read user-read-email user-read-private user-library-read user-modify-playback-state user-read-playback-state user-read-currently-playing streaming app-remote-control'

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

			socket.emit('loginData', result)
		}
	})
})

httpServer.listen(PORT, '0.0.0.0')
