import Module from "./Module.js";

export default class PlayerModule extends Module {
	constructor(options) {
		super(options);
		this.playbackRate = options.playbackRate ?? 1;
		this.transposed = options.transpose ?? 0;
		this.transposeBy = this.transposed;
	}

	set transposeBy(interval) {
		this.playbackRate = Tone.intervalToFrequencyRatio(interval);
		this.transposed = interval;
	}

	get progress() {
		if (!this._initialTime) {
			return 0;
		}
		let passedTime = Date.now() - this._initialTime;
		return passedTime / this._lengthInMs;
	}

	prepareModule(options) {
		//Function for any preparations that cannot be done in the setup but should be done before start to save valuable time at the starting point.
		this._player = new Tone.Player({
			loop: true,
			fadeIn: 0.1,
			fadeOut: 0.1,
			url: options.recordingURL,
			playbackRate: this.playbackRate,
			onload: () => {
				console.log("player loaded");
				options.moduleReady();
			},
			onstop: () => {
				console.log("playerStopped");
			},
		}).toDestination();
	}

	startModule() {
		this._player.start().stop("+" + this.length);
		super.startModule();
	}

	connect(toneAudioStream) {
		this._player.connect(toneAudioStream);
		return this;
	}

	// get rate() {
	// 	this.playbackRate -= 0.00025;
	// 	return this.playbackRate > 0.5 ? this.playbackRate : 0.5;
	// }

	// update(passedTime) {
	// 	super.update(passedTime);
	// 	// if (this.progress >= 0.2) {
	// 	// 	this._player.playbackRate = 0.5;
	// 	// }
	// 	// if (this._player && this._player.state == "started") {
	// 	// 	//console.log(this.rate);
	// 	// 	this._player.playbackRate = this.rate;
	// 	// }
	// }
}
