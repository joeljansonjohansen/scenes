export default class Module {
	constructor(options) {
		//Public
		this.title = options.title ?? "Module";
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
		this.start = this.valueToSeconds(Tone.Transport.toSeconds(options.start));
		this.length = this.valueToSeconds(Tone.Transport.toSeconds(options.length));
		this.end = this.start + this.length;
		// console.log(this.end);
		// console.log(this.length);

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

		// this._dur = 500;
		// this._timing = 342;
	}
	valueToSeconds(value, chosenValue = 0) {
		return value
			? Tone.Transport.toSeconds(value)
			: Tone.Transport.toSeconds(chosenValue);
	}

	get progress() {
		return this.progressInMs / this._lengthInMs;
	}

	get progressInMs() {
		if (!this._initialTime) {
			return 0;
		}
		let passedTime = Tone.Transport.seconds * 1000 - this._initialTime;
		return passedTime;
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
		if (this._started) {
			fill(204, 105, 205);
			noStroke();
			text(this.title, x, y);
			y += 20;
			rect(x, y, w * this.progress, h);
		}
	}
}
