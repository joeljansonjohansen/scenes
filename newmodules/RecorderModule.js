import Module from "./newmodules/Module.js";

export default class RecorderModule extends Module {
	constructor(options) {
		super(options);
		if (!options.mic) {
			console.error("has no access to mic");
			this.moduleFinished();
		} else {
			this.recorder = new Tone.Recorder();
			this.mic = options.mic;
			this.mic.connect(this.recorder);
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
