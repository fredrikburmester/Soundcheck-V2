export class User {
	constructor(id, img, name, socketid) {
		this.id = id
		this.socketid = socketid
		this.name = name
		this.host = false
		this.img = img
	}
}
