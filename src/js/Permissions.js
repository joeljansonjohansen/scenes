import * as Tone from "tone";

export default class Permissions {
	constructor(...args) {
		args.forEach((arg) => {
			console.log(arg);
		});
	}
	async getPermissions() {
		await this.startTone();
		await this.getMicrophone();
		//await this.getGyroscope();
		console.log("Permissions granted");
	}

	async startTone() {
		await Tone.start();
		console.log("Tone was started!");
	}

	async getMicrophone() {
		this.mic = new Tone.UserMedia();
		try {
			await this.mic.open();
			console.log("got microphone access");
		} catch (error) {
			console.log("mic not open: ", error);
		}
	}

	async getGyroscope() {
		console.log(rotationX);
	}
}
