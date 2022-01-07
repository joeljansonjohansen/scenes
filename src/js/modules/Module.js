import * as Tone from "tone";

export default class Module {
	constructor(options) {
		//Public
		this.getDefaults(options);
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
		this._start = options.start;
		this._length = options.length;
		this.end = this.start + this.length;
		// console.log(this.end);
		// console.log(this.length);

		//Private
		this._onEnd = options.onEnd;
	}

	getDefaults(options) {
		Object.assign(
			this,
			{
				title: "Module",
				_started: false,
				_ended: false,
				_progress: 0,
			},
			options
		);
	}

	toSeconds(time) {
		return Tone.Transport.toSeconds(time);
	}

	startModule() {
		this._initialTime = Tone.Transport.seconds;
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
		this._initialTime = undefined;
		this._progress = 0;
		this._started = false;
		this.moduleFinished();
	}

	update(passedTime) {
		if (passedTime >= this.start && !this._started) {
			console.log("starts module");
			this.startModule();
		}
		if (this.progress >= 1 && !this._ended) {
			console.log("ends module");
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

	get start() {
		return this.toSeconds(this._start);
	}

	set start(value) {
		this._start = value;
	}

	get length() {
		return this.toSeconds(this._length);
	}

	set length(value) {
		this._length = value;
	}

	get progress() {
		if (!this._initialTime) {
			return 0;
		}
		let passedTime = Tone.Transport.seconds - this._initialTime;
		return passedTime / this.length;
	}
}
