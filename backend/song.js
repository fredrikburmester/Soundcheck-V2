export class Song {
	constructor(id, name, artist, img, url) {
		this.id = id
		this.name = name
		this.artist = artist
		this.img = img
		this.users = []
		this.url = url
	}
}
