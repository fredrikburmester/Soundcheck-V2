import { Song } from './song.js'

export const roomStatus = {
	0: 'lobby',
	1: 'playing',
	2: 'finished',
}

export class Room {
	constructor(code, host) {
		this.code = code
		this.name = ''
		this.users = []
		this.status = roomStatus[0]
		this.settings = {
			nrOfSongs: 0,
			showCorrectGuesses: true,
			timeRange: 'short_term',
			allowSongSeeking: true,
		}
		this.host = host
		this.songs = []
		this.currentQuestion = 0
		this.messages = []
		this.usersGuessedOnCurrentQuestion = []
		this.date = ''
	}

	compileSongList() {
		let songs = []
		// For all users in a room
		for (let u of this.users) {
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
						s.name,
						s.artists[0].name,
						s.album.images[0].url
					)
					song.users.push(u.id)
					songs.push(song)
				}
			}
		}
		this.songs = songs.sort(() => Math.random() - 0.5)
		return songs
	}

	endGame() {
		// set room status to finished
		this.status = roomStatus[2]

		// compile results
		this.compileResults()

		// set user.room to null for all users in the room
		for (let u of this.users) {
			u.room = null
		}
	}

	compileResults() {
		for (let s of this.songs) {
			let currentSongCorrectAnswers = s.users // answers

			for (let u of this.users) {
				for (let g of u.guesses) {
					// get guess for current song
					if (g.songId === s.id) {
						// if g.userId is in currentSongCorrectAnswers
						if (currentSongCorrectAnswers.includes(g.userId)) {
							// add points
							u.points += 1
							g.correct = true
						}
					}
				}
			}
		}
	}

	addUserToRoom(user, socket) {
		// Add user to socket room
		socket.join(this.code)

		if (this.status !== roomStatus[2]) {
			user.leftGame = false
		}

		// Check if room in empty and if so, set the joining player to the host of the room
		if (this.users.length == 0) {
			this.host = user
		}

		// Check if user is already in room
		for (let u of this.users) {
			if (u.id === user.id || u.socketid === socket.id) {
				// Update the socketid of the user in case the user joined from another client
				u.socketid = socket.id
				return
			}
		}

		// Add user to room
		this.users.push(user)
	}

	removeUserFromRoom(user) {
		if (this.status === roomStatus[0]) {
			this.users = this.users.filter((u) => u.id !== user.id)
		} else if (this.status === roomStatus[1]) {
			user.leftGame = true
		}

		if (this.users.length == 0) {
			this.status = roomStatus[2]
		}
	}

	nextQuestion() {
		this.usersGuessedOnCurrentQuestion = []
		this.nrOfGuesses = 0
		this.currentQuestion++
		if (this.currentQuestion >= this.songs.length) {
			this.status = roomStatus[2]
		}
	}

	previousQuestion() {
		this.usersGuessedOnCurrentQuestion = []
		this.nrOfGuesses = 0
		if (this.currentQuestion != 0) {
			this.currentQuestion--
		}
	}

	hasUser(user) {
		for (let u of this.users) {
			if (u.id === user.id) {
				return true
			}
		}
		return false
	}
}
