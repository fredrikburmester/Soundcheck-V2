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
		}
		this.host = host
	}

	addUserToRoom(user, socket) {
		// Add user to socket room
		socket.join(this.code)

		// Check if user is already in room
		for (let u of this.users) {
			if (u.id === user.id || u.socketid === socket.id) {
				return
			}
		}

		// Add user to room
		this.users.push(user)
	}

	removeUserFromRoom(user) {
		this.users = this.users.filter((u) => u.id !== user.id)

		if (this.users.length == 0) {
			this.status = roomStatus[2]
		}
	}

	switchUserClient(user, socket) {
		for (let u of this.users) {
			if (u.id === user.id) {
				socket.emit('redirect', {
					status: 200,
					message: 'You have switched to another client',
					id: this.code,
				})
				u.socketid = socket.id
				socket.join(this.code)
			}
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
