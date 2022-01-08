import * as Tone from "tone";

export default class Permissions {
	constructor(...args) {
		args.forEach((arg) => {
			console.log(arg);
		});
	}
	async getPermissions() {
		await this.startTone();
		try {
			await this.getMicrophone();
		} catch (error) {
			throw new Error("Could not open microphone");
		}
		//await this.getGyroscope();
		//console.log("Permissions granted");
	}

	async startTone() {
		try {
			await Tone.start();
		} catch (error) {
			throw new Error("Could not start Tone");
		}
		console.log("Tone was started!");
	}

	async getMicrophone() {
		this.mic = new Tone.UserMedia();
		try {
			await this.mic.open();
			console.log("got microphone access");
		} catch (error) {
			console.log("mic not open: ", error);
			throw new Error("Could not open microphone");
		}
	}

	async getGyroscope() {
		console.log(rotationX);
	}
}
