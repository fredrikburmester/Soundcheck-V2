export class Notification {
	constructor(message) {
		this.message = message
		this.type = 'message'
	}
}

export class Invite extends Notification {
	constructor(from, to, roomCode) {
		super()
		this.type = 'invite'
		this.message = `You have been invited by ${from} to join room ${roomCode}`
		this.from = from
		this.to = to
		this.roomCode = roomCode
	}
}
