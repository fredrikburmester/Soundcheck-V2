export class Clients {
	constructor() {
		this.clients = []
	}
	saveClient(client) {
		this.clientList[client.id] = client
	}
}
