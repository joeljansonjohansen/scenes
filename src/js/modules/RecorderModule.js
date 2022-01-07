import * as Tone from "tone";
import Module from "./Module.js";

export default class RecorderModule extends Module {
	constructor(options) {
		super(options);
		if (!options.input) {
			console.error("has no access to input");
			this.moduleFinished();
		} else {
			this.recorder = new Tone.Recorder();
			this.input = options.input;
			this.input.connect(this.recorder);
		}
	}

	startModule() {
		this.recorder.start();
		super.startModule();
		console.log("Recording started");
	}

	async stopModule() {
		const recording = await this.recorder.stop();
		this.recordingURL = URL.createObjectURL(recording);
		console.log("Recording ended");
		super.stopModule();
	}
}
