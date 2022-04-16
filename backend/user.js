export class User {
	constructor(id, img, name, socketid) {
		this.id = id
		this.socketid = socketid
		this.name = name
		this.host = false
		this.img = img
		this.songs = []
		this.guesses = []
		this.points = 0
		this.online = false
		this.leftGame = false
	}

	makeGuess(songId, userId) {
		console.log(`[${this.room}] ${this.name} guessed ${userId}'s song`)
		let guess = this.guesses.find((guess) => guess.songId === songId)
		if (guess) {
			guess.userId = userId
		} else {
			this.guesses.push({
				songId,
				userId,
				correct: null,
			})
			return true
		}
		return false
	}

	clearUser() {
		this.guesses = []
		this.points = 0
		this.host = false
		this.songs = []
		this.guesses = []
		this.points = 0
		this.leftGame = false
	}
}
