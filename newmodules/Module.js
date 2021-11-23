export default class Module {
	constructor(options) {
		//Public
		this.title = options.title;
		if (options.start === undefined) {
			console.error(
				"A module has to have a start time. Module will not work as expected."
			);
		}
		if (options.length === undefined) {
			console.error(
				"A module has to have a length. Module will not work as expected."
			);
		}
		this.start = Tone.Transport.toSeconds(options.start);
		this.length = Tone.Transport.toSeconds(options.length);
		this.loopLength = options.loopLength
			? Tone.Transport.toSeconds(options.loopLength)
			: this.length;
		this.end = this.start + this.length;

		//Private
		this._onEnd = options.onEnd;
		this._started = false;
		this._ended = false;
		this._startInMs = this.start * 1000;
		this._lengthInMs = this.length * 1000;
		this._progress = 0;
		// needs to be able to show progress
		// callback on finished
		// callback on started
		// way to stop the module
	}

	get progress() {
		if (!this._initialTime) {
			return 0;
		}
		let passedTime = Tone.Transport.seconds * 1000 - this._initialTime;
		return passedTime / this._lengthInMs;
	}

	startModule() {
		this._initialTime = Tone.Transport.seconds * 1000;
		console.log("Module started, do we need a callback?");
		this._started = true;
	}
	moduleFinished() {
		console.log("Module was finished");
		this._onEnd(this);
	}
	async stopModule() {
		console.log("Waits until ready to stop");
		this._ended = true;
		this.moduleFinished();
	}

	connect(toneAudioStream) {
		console.error(
			"This module does not support connecting, try player module or..."
		);
		return;
	}

	update(passedTime) {
		if (passedTime >= this._startInMs && !this._started) {
			this.startModule();
		}
		if (this.progress >= 1 && !this._ended) {
			this.stopModule();
		}
	}

	draw(x, y, w, h) {
		if (this._ended) {
			return;
		}
		fill(204, 105, 205);
		noStroke();
		rect(x, y, w * this.progress, h);
	}
}
