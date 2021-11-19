export default class Module {
	constructor(options) {
		//Public
		this.title = options.title;
		this.start = options.start;
		this.length = options.length;
		this.end = this.start + this.length;

		//Private
		this._onEnd = options.onEnd;
		this._started = false;
		this._ended = false;
		this._startInMs = options.start * 1000;
		this._lengthInMs = options.length * 1000;
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
		let passedTime = Date.now() - this._initialTime;
		return passedTime / this._lengthInMs;
	}

	startModule() {
		this._initialTime = Date.now();
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
		console.error("This module does not support connecting, try player module or...");
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
