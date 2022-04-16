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
import { loginStep2 } from './auth.js'
import { createLoginUrl } from './auth.js'
import { Notification, Invite } from './Notification.js'
import { Message } from './Message.js'

const app = express()
const httpServer = createServer()
const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
	path: '/ws',
})

const PORT = process.env.PORT || 5005

console.log(`PORT: ${process.env.PORT}`)
console.log(`Callback URL: ${process.env.CALLBACK_URL}`)
console.log(`CLIENT_ID: ${process.env.CLIENT_ID}`)
console.log(`CLIENT_SECRET: ${process.env.CLIENT_SECRET}`)

app.use(cors())

var USERS = []
var ROOMS = []
var ACTIVE_USERS = 0

const broadcastRoomUpdates = (room) => {
	io.to(room.code).emit('roomStatus', room)
}

io.on('connection', (socket) => {
	ACTIVE_USERS++
	socket.emit('connected', socket.id)

	socket.on('updateUser', ({ id, name, img }) => {
		if (id && name && img) {
			let user = USERS.find((user) => user.id === id)
			if (user) {
				user.socketid = socket.id
				user.online = true
			} else {
				let new_user = new User(id, img, name, socket.id)
				USERS.push(new_user)
			}
		}
	})

	socket.on('newMessage', (message, roomCode) => {
		let user = USERS.find((user) => user.socketid === socket.id)
		let room = ROOMS.find((room) => room.code === roomCode)

		if (user && room) {
			if (room.users.find((u) => u.id === user.id)) {
				let newMessage = new Message(message, user)
				room.messages.push(newMessage)
				io.to(room.code).emit('newMessage', newMessage)
			} else {
				socket.emit('warning', {
					msg: 'You are not permitted to send messages in this room',
				})
			}
		} else {
			console.log('[message error]', user, room)
		}
	})

	socket.on('getInvitablePlayers', () => {
		let invitablePlayers = USERS.filter(
			(user) => user.socketid !== socket.id && user.online
		)
		socket.emit('invitablePlayers', invitablePlayers)
	})

	socket.on('disconnect', () => {
		let user = USERS.find((user) => user.socketid === socket.id)
		if (user) user.online = false
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

	socket.on('invite', ({ from, to, roomCode }) => {
		let room = ROOMS.find((r) => r.code == roomCode)
		// if (room) {
		let invite = new Invite(from, to, roomCode)
		let user = USERS.find((u) => u.id == to)
		if (user) {
			// TODO: implement storing of notifications
			// user.notifications.push(invite)

			io.to(user.socketid).emit('invite', invite)
		} else {
			console.log('[Error] User was not found...')
		}
		// }
	})

	socket.on(
		'createRoom',
		({
			userId,
			roomCode,
			nrOfSongs,
			showCorrectGuesses,
			timeRange,
			allowSongSeeking,
		}) => {
			if (
				roomCode !== undefined &&
				nrOfSongs !== undefined &&
				showCorrectGuesses !== undefined &&
				timeRange !== undefined &&
				allowSongSeeking !== undefined
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
							msg: 'The room already exists and was not created by you. Redirecting you to the active room',
							route: `/room/${room.code}`,
						})
					} else if (room.status === roomStatus[1]) {
						socket.emit('error', {
							status: 401,
							msg: 'The room already exists and is in progress. Try creating a new room!',
						})
					} else if (room.status === roomStatus[2]) {
						// socket redirect to result page
						socket.emit('redirect', {
							status: 303,
							msg: 'Game has ended. Check out the results!',
							route: `/room/${room.code}`,
						})
					}
				} else {
					// create new room
					let room = new Room(roomCode)
					room.settings.timeRange = timeRange
					room.settings.nrOfSongs = nrOfSongs
					room.settings.showCorrectGuesses = showCorrectGuesses
					room.settings.allowSongSeeking = allowSongSeeking

					// add room to rooms
					ROOMS.push(room)

					// redirect user to room
					socket.emit('redirect', {
						status: 303,
						msg: '',
						route: `/room/${room.code}`,
					})
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
		// Check if user is alredy logged in
		let user = USERS.find((user) => user.id === id)

		if (user) {
			if (user.socketid != socket.id) {
				io.to(user.socketid).emit('logout', {
					status: 303,
					msg: 'You have switched to another client',
				})
			}

			user.id = id
			user.img = img
			user.name = name
			user.socketid = socket.id
			user.online = true
		} else {
			user = new User(id, img, name, socket.id)
			user.online = true
			USERS.push(user)
		}

		if (
			user.room &&
			(user.room.status === roomStatus[0] ||
				user.room.status === roomStatus[1])
		) {
			socket.emit('redirect', {
				status: 303,
				msg: 'You have an active game, redirecting you now.',
				route: `/room/${user.room}`,
			})
		}
		return
	})

	socket.on('makePlayerGuess', ({ roomId, userId, songId, guess }) => {
		let room = ROOMS.find((room) => room.code === roomId)
		let user = USERS.find((user) => user.id === userId)

		if (room && user) {
			if (room.status === roomStatus[1]) {
				user.makeGuess(songId, guess)
				// add user.id to room.usersGuessedOnCurrentQuestion if they don't exist
				if (!room.usersGuessedOnCurrentQuestion.includes(user.id)) {
					room.usersGuessedOnCurrentQuestion.push(user.id)
				}

				io.to(room.code).emit('playerGuessed', user.id)
			}
		}
	})

	socket.on('joinRoom', ({ userId, roomCode }, callback) => {
		let user = USERS.find((user) => user.id === userId)
		let room = ROOMS.find((room) => room.code === roomCode)

		if (!user) {
			socket.emit('error', {
				status: 404,
				msg: 'Could not find this user. Please log in again.',
			})
			return
		}

		if (!room) {
			socket.emit('redirect', {
				status: 404,
				msg: 'This room does not exist',
				route: '/',
			})
			return
		}

		// Make sure the user object has nothing left from old games
		// TODO: Implement database later
		if (room.status === roomStatus[0]) {
			user.clearUser()
		}

		if (room.status === roomStatus[1] && user.room != room.code) {
			socket.emit('error', {
				status: 303,
				msg: 'Game has already started',
			})
			return
		}

		// Add room to user object
		if (room.status !== roomStatus[2]) {
			user.room = room.code
		}

		// Add user in list of users in the room
		room.addUserToRoom(user, socket)

		// Update everyone in the room that a new user has joined
		broadcastRoomUpdates(room)

		// Send a callback to the client with the room object, telling the client that they have joined the room
		callback({
			status: 200,
			room: room,
		})
	})

	socket.on('leaveRoom', ({ userId, roomCode }) => {
		let user = USERS.find((user) => user.id === userId)
		let room = ROOMS.find((room) => room.code === roomCode)

		if (!user) {
			socket.emit('error', {
				status: 404,
				msg: 'The user does not exist',
			})
			return
		}

		if (!room) {
			socket.emit('redirect', {
				status: 404,
				msg: 'This room does not exist',
				route: '/',
			})
			return
		}

		room.removeUserFromRoom(user)
		socket.leave(room.code)
		user.room = null
		broadcastRoomUpdates(room)

		return
	})

	socket.on('login-step-1', () => {
		let auth_url = createLoginUrl()
		socket.emit('login', auth_url)
	})

	// socket.on('refresh-token', async (refresh_token) => {
	// 	const client_id = process.env.CLIENT_ID
	// 	const client_secret = process.env.CLIENT_SECRET
	// 	if (
	// 		refresh_token == null ||
	// 		refresh_token == '' ||
	// 		refresh_token == undefined
	// 	) {
	// 		socket.emit('error', { status: 500, msg: 'Missing parameters' })
	// 		return
	// 	}

	// 	const url = 'https://accounts.spotify.com/api/token'
	// 	const body = {
	// 		grant_type: 'refresh_token',
	// 		refresh_token: refresh_token,
	// 		client_id: client_id,
	// 		client_secret: client_secret,
	// 	}

	// 	var result = null

	// 	await fetch(url, {
	// 		method: 'POST',
	// 		headers: {
	// 			Accept: 'application/json',
	// 			'Content-Type':
	// 				'application/x-www-form-urlencoded;charset=UTF-8',
	// 		},
	// 		body: queryString.stringify(body),
	// 	})
	// 		.then((response) => {
	// 			return response.json()
	// 		})
	// 		.then((data) => {
	// 			result = data
	// 		})
	// 	socket.emit('refreshToken', result)
	// })

	socket.on('startGame', ({ roomCode }) => {
		let room = ROOMS.find((room) => room.code === roomCode)
		room.compileSongList()
		room.status = roomStatus[1]

		broadcastRoomUpdates(room)
	})

	socket.on('typing', ({ userId, roomCode }) => {
		io.to(roomCode).emit('userTyping', userId)
	})

	socket.on('topSongs', ({ userId, songs }) => {
		let user = USERS.find((user) => user.id === userId)
		let room = ROOMS.find((room) => room.code === user.room)

		if (user && room) {
			user.songs = songs
			broadcastRoomUpdates(room)
		} else {
			console.log('[top songs] user or room not found', user, room)
		}
	})

	socket.on('nextQuestion', ({ roomCode }) => {
		let room = ROOMS.find((room) => room.code === roomCode)
		room.nextQuestion()

		if (room.status === roomStatus[2]) {
			room.endGame()
		}

		broadcastRoomUpdates(room)
	})

	socket.on('login-step-2', async (code) => {
		let result = await loginStep2(socket, code)
		socket.emit('loginData', result)
	})
})

httpServer.listen(PORT, '0.0.0.0')
