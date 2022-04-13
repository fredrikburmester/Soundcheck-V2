export class Message {
	constructor(message, from) {
		this.message = message
		this.from = from
		this.sentAt = new Date()
	}
}
