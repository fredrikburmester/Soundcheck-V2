import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { Room, roomStatus } from './room.js'
import { Song } from './song.js'
import { loginStep2 } from './auth.js'
import { createLoginUrl } from './auth.js'
import { Notification, Invite } from './Notification.js'
import { Message } from './Message.js'

import loki from 'lokijs'

import * as cron from 'node-cron'

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

const currentVersion = 3

app.use(cors())

var users = null
var rooms = null

var db = new loki('soundcheck.db', {
	autoload: true,
	autoloadCallback: databaseInitialize,
	autosave: true,
	autosaveInterval: 4000,
})

cron.schedule('0 * * * *', () => {
	console.log('[info] Running scheduled tasks')
	clearOldRooms()
	console.log('[info] Done with scheduled tasks')
})

const clearOldRooms = () => {
	try {
		let db_rooms = rooms.where(
			(room) =>
				room.status != roomStatus[2] &&
				new Date(room.date).getTime() < Date.now() - 1000 * 60 * 60 * 24
		)

		for (let room of db_rooms) {
			io.to(room.code).emit('redirect', {
				status: 303,
				msg: 'This room has been removed due to inactivity.',
				route: `/`,
			})
			console.log(`[info] Removed room ${room.code}. Reason: Old`)
			rooms.remove(room)
		}
	} catch (error) {
		console.log(error)
	}
}

// Implement the autoloadback referenced in loki constructor
function databaseInitialize() {
	users = db.getCollection('users')
	rooms = db.getCollection('rooms')

	if (users === null) {
		users = db.addCollection('users')
	}
	if (rooms === null) {
		rooms = db.addCollection('rooms')
	}
}

const broadcastRoomUpdates = (room) => {
	io.to(room.code).emit('roomStatus', room)
}

const getActiveUsers = () => {
	return users.where((user) => user.online).length
}

const getActiveGames = () => {
	return rooms.where((room) => {
		if (room.status == roomStatus[0] || room.status == roomStatus[1])
			return true
	}).length
}

io.on('connection', (socket) => {
	socket.emit('connected', socket.id)

	socket.emit('currentVersion', {
		version: currentVersion,
	})

	socket.on('getPlayerGames', ({ userId }) => {
		var db_rooms = rooms.where(function (room) {
			if (room.status == roomStatus[2]) {
				for (let u of room.users) {
					if (u.id == userId) {
						return true
					}
				}
			}
		})

		socket.emit('playerGames', db_rooms)
	})

	socket.on('updateUser', ({ id, name, img }) => {
		if (id && name && img) {
			var db_user = users.findOne({ id: id })

			if (db_user) {
				db_user.socketid = socket.id
				db_user.online = true
				users.update(db_user)
			} else {
				let new_user = {
					id: id,
					img: img,
					name: name,
					socketid: socket.id,
					online: true,
					topTracks: [],
					topItems: [],
				}
				users.insert(new_user)
			}
		}
	})

	socket.on('newMessage', (message, roomCode) => {
		var db_user = users.findOne({ socketid: socket.id })
		var db_room = rooms.findOne({ code: roomCode })

		if (db_user && db_room) {
			if (db_room.users.find((u) => u.id === db_user.id)) {
				let newMessage = new Message(message, db_user)
				db_room.messages.push(newMessage)
				rooms.update(db_room)
				io.to(db_room.code).emit('newMessage', newMessage)
			} else {
				socket.emit('warning', {
					msg: 'You are not permitted to send messages in this room',
				})
			}
		} else {
			console.log('[message error]')
		}
	})

	socket.on('getInvitablePlayers', () => {
		const invitablePlayers = users.where((u) => {
			return u.socketid !== socket.id && u.online
		})
		socket.emit('invitablePlayers', invitablePlayers)
	})

	socket.on('disconnect', () => {
		var db_user = users.findOne({ socketid: socket.id })

		if (db_user) {
			db_user.online = false
			users.update(db_user)
		}
	})

	socket.on('getStats', () => {
		socket.emit('stats', {
			activeUsers: getActiveUsers(),
			activeGames: getActiveGames(),
		})
	})

	socket.on('invite', ({ from, to, roomCode }) => {
		var db_user = users.findOne({ id: to })

		let invite = new Invite(from, to, roomCode)
		if (db_user) {
			// TODO: implement storing of notifications
			// user.notifications.push(invite)

			io.to(db_user.socketid).emit('invite', invite)
		} else {
			console.log('[Error] User was not found...')
		}
	})

	socket.on('deleteRoom', ({ roomCode }) => {
		console.log('[deleteRoom]', roomCode)
		var db_room = rooms.findOne({ code: roomCode })

		if (db_room) {
			rooms.remove(db_room)
		}

		socket.emit('roomDeleted', roomCode)
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
				var db_user = users.findOne({ id: userId })
				var db_room = rooms.findOne({ code: roomCode })

				if (!db_user) {
					socket.emit('logout', {
						status: 500,
						msg: 'Could not find your user, plase log in again.',
					})
					return
				}

				const currentRoom = rooms.findOne({ code: db_user.room })

				if (currentRoom && currentRoom.status != roomStatus[2]) {
					socket.emit('redirect', {
						status: 303,
						msg: 'You already have a room in progress, if you want to create a new room, please leave the current room first.',
						route: `/room/${db_user.room}`,
					})
					return
				}

				if (db_room) {
					if (db_room.status === roomStatus[0]) {
						socket.emit('redirect', {
							status: 303,
							msg: 'The room already exists and was not created by you. Redirecting you to the active room',
							route: `/room/${db_room.code}`,
						})
						return
					} else if (db_room.status === roomStatus[1]) {
						socket.emit('error', {
							status: 401,
							msg: 'The room already exists and is in progress. Try creating a new room!',
						})
						return
					} else if (db_room.status === roomStatus[2]) {
						// socket redirect to result page
						socket.emit('redirect', {
							status: 303,
							msg: 'Game has ended. Check out the results!',
							route: `/room/${db_room.code}`,
						})
						return
					}
				} else {
					const today = new Date()
					const yyyy = today.getFullYear()
					let mm = today.getMonth() + 1 // Months start at 0!
					let dd = today.getDate()

					if (dd < 10) dd = '0' + dd
					if (mm < 10) mm = '0' + mm

					const formattedToday = `${yyyy}/${mm}/${dd}`

					// create new room
					let new_room = {
						status: roomStatus[0],
						host: null,
						songs: [],
						currentQuestion: 0,
						messages: [],
						usersGuessedOnCurrentQuestion: [],
						users: [],
						code: roomCode,
						guesses: [],
						date: Date.now(),
						prettyDate: formattedToday,
						settings: {
							timeRange: timeRange,
							nrOfSongs: nrOfSongs,
							showCorrectGuesses: showCorrectGuesses,
							allowSongSeeking: allowSongSeeking,
						},
					}

					rooms.insert(new_room)

					// redirect user to room
					socket.emit('redirect', {
						status: 303,
						msg: '',
						route: `/room/${new_room.code}`,
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
		var db_user = users.findOne({ id: id })

		if (db_user) {
			// User exists and might have switched client
			if (db_user.socketid != socket.id) {
				io.to(db_user.socketid).emit('logout', {
					status: 303,
					msg: 'You have switched to another client',
				})
			}

			db_user.id = id
			db_user.img = img
			db_user.name = name
			db_user.socketid = socket.id
			db_user.online = true
			db_user.guesses = []

			users.update(db_user)
		} else {
			// Create user and save in database
			let new_user = {
				id: id,
				img: img,
				name: name,
				socketid: socket.id,
				online: true,
				guesses: [],
				topTracks: [],
				topItems: [],
			}
			users.insert(new_user)
		}

		if (
			db_user.room &&
			(db_user.room.status === roomStatus[0] ||
				db_user.room.status === roomStatus[1])
		) {
			socket.emit('redirect', {
				status: 303,
				msg: 'You have an active game, redirecting you now.',
				route: `/room/${db_user.room}`,
			})
		}
		return
	})

	socket.on('makeGuess_v2', ({ roomID, guess }) => {
		var db_user = users.findOne({ socketid: socket.id })
		var db_room = rooms.findOne({ code: roomID })

		if (!db_user || !db_room) {
			socket.emit('error', {
				status: 500,
				msg: 'Missing parameters room or user',
			})
			return
		}

		if (
			guess.songID &&
			guess.questionNumber != null &&
			guess.questionNumber != undefined &&
			guess.playerWhoGuessed &&
			guess.playerGuessedOn &&
			guess.roomID &&
			guess.timestamp
		) {
			const existingGuess = db_room.guesses.find((existingGuess) => {
				if (
					existingGuess.songID === guess.songID &&
					existingGuess.questionNumber === guess.questionNumber &&
					existingGuess.playerWhoGuessed === guess.playerWhoGuessed
				) {
					return true
				}
			})

			if (existingGuess) {
				// Changed guess
				existingGuess.playerGuessedOn = guess.playerGuessedOn
				existingGuess.timestamp = guess.timestamp
				io.to(db_room.code).emit('playerGuessed', db_user.id)
			} else {
				// New guess
				db_room.guesses.push(guess)
				io.to(db_room.code).emit('playerGuessed', db_user.id)
			}

			rooms.update(db_room)
			return
		} else {
			socket.emit('error', {
				status: 500,
				msg: `Missing parameters: ${missingParams.join(', ')}`,
			})
			return
		}
	})

	socket.on('makePlayerGuess', ({ roomId, userId, songId, guess }) => {
		var db_user = users.findOne({ id: userId })
		var db_room = rooms.findOne({ code: roomId })

		if (db_user && db_room) {
			if (db_room.status === roomStatus[1]) {
				console.log(
					`[${db_room.code}] ${db_user.name} guessed ${userId}'s song`
				)

				const userGuesses = db_room.users.find(
					(user) => user.id === userId
				).guesses

				// Check if user has already guessed on this question
				let guess = userGuesses.find((guess) => guess.songId === songId)

				if (guess) {
					guess.userId = userId
				} else {
					db_user.guesses.push({
						songId,
						userId,
						correct: null,
					})
				}

				users.update(db_user)

				// add user.id to room.usersGuessedOnCurrentQuestion if they don't exist
				if (
					!db_room.usersGuessedOnCurrentQuestion.includes(db_user.id)
				) {
					db_room.usersGuessedOnCurrentQuestion.push(db_user.id)
				}

				rooms.update(db_room)

				io.to(db_room.code).emit('playerGuessed', db_user.id)
			}
		}
	})

	socket.on('joinRoom', ({ userId, roomCode }, callback) => {
		var db_user = users.findOne({ id: userId })
		var db_room = rooms.findOne({ code: roomCode })

		if (!db_user) {
			socket.emit('error', {
				status: 404,
				msg: 'Could not find this user. Please log in again.',
			})
			return
		}

		if (!db_room) {
			socket.emit('redirect', {
				status: 303,
				msg: 'This room does not exist',
				route: '/play',
			})
			return
		}

		console.log(`[${roomCode}] ${userId} is trying to join room`)

		if (db_room.status === roomStatus[0]) {
			// clearUser
			db_user.guesses = []
			db_user.points = 0
			db_user.host = false
			db_user.songs = []
			db_user.room = null

			users.update(db_user)
		}

		if (db_room.status === roomStatus[1] && db_user.room != db_room.code) {
			socket.emit('error', {
				status: 303,
				msg: 'Game has already started',
			})
			return
		}

		// Add room to user object
		if (db_room.status !== roomStatus[2]) {
			db_user.room = db_room.code
		}

		// Add the user socket to the room
		socket.join(db_room.code)

		// Set host status
		if (db_room.users.length == 0) {
			db_room.host = db_user
			db_user.host = true
			users.update(db_user)
		}

		// Check if user is already in room
		let userReconnected = false
		for (let u of db_room.users) {
			if (u.id === db_user.id || u.socketid === socket.id) {
				// Update the socketid of the user in case the user joined from another client
				userReconnected = true
				u.socketid = socket.id
				rooms.update(db_room)
				break
			}
		}

		if (!userReconnected) {
			db_room.users.push(db_user)
			console.log(`[${db_room.code}] ${db_user.name} joined`)
		}

		rooms.update(db_room)
		users.update(db_user)

		console.log(`[${db_room.code}] ${db_user.name} re-connected`)

		// Update everyone in the room that a new user has joined
		broadcastRoomUpdates(db_room)

		// Send a callback to the client with the room object, telling the client that they have joined the room
		callback({
			status: 200,
			room: db_room,
		})
	})

	socket.on('leaveRoom', ({ userId, roomCode }) => {
		var db_user = users.findOne({ id: userId })
		var db_room = rooms.findOne({ code: roomCode })

		if (!db_user) {
			socket.emit('error', {
				status: 404,
				msg: 'The user does not exist',
			})
			return
		}

		if (!db_room) {
			socket.emit('redirect', {
				status: 404,
				msg: 'This room does not exist',
				route: '/',
			})
			return
		}

		// Remove the user from the room
		for (let i = 0; i < db_room.users.length; i++) {
			if (db_room.users[i].id == db_user.id) {
				db_room.users.splice(i, 1)
				rooms.update(db_room)
			}
		}

		socket.leave(db_room.code)

		// Clear user
		db_user.guesses = []
		db_user.points = 0
		db_user.host = false
		db_user.songs = []
		db_user.guesses = []
		db_user.points = 0
		db_user.room = null

		// find another user in the room and assign host to that user
		console.log(`[${db_room.code}] ${db_user.name} left the room`)

		io.to(db_room.code).emit('notification', {
			status: 'success',
			msg: `${db_user.name} left the room. Make sure they re-join before you start the game!`,
		})

		// If the room is empty, end the game
		if (db_room.users.length == 0) {
			rooms.remove(db_room)
			// Else if the host left, choose a new host
		} else if (db_user.id == db_room.host.id) {
			var db_user = users.findOne({ id: db_room.users[0].id })
			db_room.host = db_user
			db_user.host = true

			rooms.update(db_room)
			users.update(db_user)

			io.to(db_user.socketid).emit('warning', {
				status: 'warning',
				msg: 'You are now host',
			})
		}

		broadcastRoomUpdates(db_room)

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
		var db_room = rooms.findOne({ code: roomCode })

		const songs = compileSongList(db_room)

		db_room.songs = songs
		db_room.status = roomStatus[1]

		rooms.update(db_room)

		broadcastRoomUpdates(db_room)
	})

	socket.on('typing', ({ userId, roomCode }) => {
		io.to(roomCode).emit('userTyping', userId)
	})

	socket.on('topSongs', ({ userId, songs }) => {
		var db_user = users.findOne({ id: userId })

		if (!db_user) {
			console.log('[error] user not found')
			return
		}

		var db_room = rooms.findOne({ code: db_user.room })

		if (!db_room) {
			console.log('[error] room not found', db_room)
			return
		}

		db_user.songs = songs
		users.update(db_user)

		for (let i = 0; i < db_room.users.length; i++) {
			if (db_room.users[i].id == db_user.id) {
				db_room.users[i] = db_user
				rooms.update(db_room)
				break
			}
		}

		broadcastRoomUpdates(db_room)
	})

	socket.on('nextQuestion', ({ roomCode }) => {
		var db_room = rooms.findOne({ code: roomCode })

		db_room.usersGuessedOnCurrentQuestion = []
		db_room.nrOfGuesses = 0
		db_room.currentQuestion++
		if (db_room.currentQuestion >= db_room.songs.length) {
			db_room.status = roomStatus[2]
		}

		// End game
		if (db_room.status === roomStatus[2]) {
			console.log(`[${roomCode}] compiling results...`)
			db_room = compileResults(db_room)
		}

		rooms.update(db_room)

		broadcastRoomUpdates(db_room)
	})

	socket.on('previousQuestion', ({ roomCode }) => {
		var db_room = rooms.findOne({ code: roomCode })

		db_room.usersGuessedOnCurrentQuestion = []
		db_room.nrOfGuesses = 0
		if (db_room.currentQuestion != 0) {
			db_room.currentQuestion--
		}

		rooms.update(db_room)

		broadcastRoomUpdates(db_room)
	})

	socket.on('login-step-2', async (code) => {
		let result = await loginStep2(socket, code)
		socket.emit('loginData', result)
	})

	socket.on('getStoredSongInformation', ({ uuid }) => {
		var db_user = users.findOne({ socketid: socket.id })

		if (!db_user) {
			socket.emit('logout', {
				status: 500,
				msg: 'Could not find your user, plase log in again.',
			})
			console.log('[error] user not found')
			return
		}

		if (!uuid) {
			return
		}

		for (let item of db_user.topItems) {
			if (item.uuid === uuid) {
				socket.emit('getStoredSongInformation', {
					uuid: uuid,
					item: item,
				})
				return
			}
		}
	})

	socket.on('getOldestSavedSong', ({ timeRange, itemType }) => {
		var db_user = users.findOne({ socketid: socket.id })

		let oldestSongUUID = null
		let oldestDate = null

		for (let item of db_user.topItems) {
			if (item.itemType !== itemType || item.timeRange !== timeRange) {
				continue
			}

			if (oldestSongUUID === null) {
				oldestSongUUID = item.uuid
				oldestDate = item.dateAdded
			} else if (item.dateAdded < oldestDate) {
				oldestSongUUID = item.uuid
				oldestDate = item.dateAdded
			}
		}

		socket.emit('getOldestSavedSong', {
			uuid: oldestSongUUID,
		})
	})

	socket.on(
		'topItemsMapFromClient',
		({ topItemsMap, timeRange, itemType, limit }, callback) => {
			var db_user = users.findOne({ socketid: socket.id })

			if (!db_user) {
				socket.emit('logout', {
					status: 500,
					msg: 'Could not find your user, plase log in again.',
				})
				console.log('[error] user not found')
				return
			}

			for (let i = 0; i < db_user.topItems.length; i++) {
				const storedItem = db_user.topItems[i]

				// Ignore songs with incorrect itemType and timeRange
				if (
					storedItem.itemType != itemType ||
					storedItem.timeRange != timeRange
				) {
					continue
				}

				// Don't remove songs that are not in scope (i.e. under the limit of items)
				// i.e. don't remove song with index 26 just because it's not included in this
				// request with 25 songs
				if (storedItem.index >= limit) {
					continue
				}

				let found = false
				for (let j = 0; j < topItemsMap.length; j++) {
					const newItem = topItemsMap[j]
					if (newItem.uuid == storedItem.uuid) {
						found = true
					}
				}

				if (!found) {
					db_user.topItems.splice(i, 1)
				}
			}

			for (let newItem of topItemsMap) {
				let found = false
				// if item is not in db_user.topItems, add it to the list
				for (let oldItem of db_user.topItems) {
					if (oldItem.uuid === newItem.uuid) {
						found = true
						// update the index of olditem
						if (oldItem.index != newItem.index) {
							console.log(
								`[info] ${db_user.name} is updating index`
							)
							oldItem.previousIndex.push(oldItem.index)
							oldItem.index = newItem.index
						}
						break
					}
				}
				if (!found) {
					db_user.topItems.push(newItem)
				}
			}

			// Remove double items based on uuid
			// db_user.topItems = db_user.topItems.filter(
			// 	(item, index) =>
			// 		db_user.topItems.findIndex(
			// 			(item2) => item2.uuid === item.uuid
			// 		) === index
			// )

			users.update(db_user)

			callback({
				status: 200,
			})
		}
	)

	socket.on('getActiveGames', () => {
		let activeGames = rooms.find({
			status: roomStatus[0],
		})

		socket.emit('getActiveGames', {
			activeGames: activeGames,
		})
	})

	socket.on('searchForUser', ({ name }) => {
		console.log(`[info] searching for user ${name}`)
		var res = users.find((user) => {
			// loose match
			return user.name.toLowerCase().includes(name.toLowerCase())
		})

		if (res.length == 0) {
			socket.emit('searchForUser', {
				status: 404,
				msg: 'Could not find user',
			})
			return
		}

		socket.emit('searchForUser', {
			status: 200,
			searchResults: res,
		})
	})
})

const compileResults = (room) => {
	/*
	@input a room
	@output a room with compiled results for each user
	*/

	const songs = room.songs

	/*
	For each guess in the room, check if the guess is correct, add the guess to the user and calculate the score
	*/
	for (let guess of room.guesses) {
		const song = songs.find((song) => song.id == guess.songID)
		if (song.users.includes(guess.playerGuessedOn)) {
			const user = room.users.find(
				(user) => user.id == guess.playerWhoGuessed
			)
			if (user) {
				user.points += 1
				guess['correct'] = song.users
			}
		} else {
			guess['correct'] = song.users
		}
	}
	return room
}

const compileSongList = (room) => {
	let songs = []

	// For all users in a room
	for (let u of room.users) {
		// Check all their songs
		for (let s of u.songs) {
			// If a user song is already in the list of songs
			let song = songs.find((song) => song.id === s.id)
			if (song) {
				// Add the user to that song
				song.users.push(u.id)
			} else {
				// Create the song and add the user to it
				let song = new Song(
					s.id,
					s.data.name,
					s.data.artists[0].name,
					s.data.album.images[0].url
				)
				song.users.push(u.id)
				songs.push(song)
			}
		}
	}

	// Randomize song order
	return songs.sort(() => Math.random() - 0.5)
}

httpServer.listen(PORT, '0.0.0.0')
