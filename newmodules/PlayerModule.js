import Module from "./Module.js";

/* 
    The PlayerModule can play audio files and does so for a ceratain amount of time
    that you define by setting length. If length is not set, then length is 0 until
    the player gets a buffer - ??
    */

export default class PlayerModule extends Module {
	constructor(options) {
		super(options);
		this.playbackRate = options.playbackRate ?? 1;
		this.transposed = options.transpose ?? 0;
		this.transposeBy = this.transposed;
		this._transpositionChanges = [];
		this._previousTransposition = this.transposed;
	}

	set transposeBy(interval) {
		this.playbackRate = Tone.intervalToFrequencyRatio(interval);
		this.transposed = interval;
		if (this._player) {
			this._player.playbackRate = this.playbackRate;
		}
	}

	prepareModule(options) {
		//Function for any preparations that cannot be done in the setup but should be done before start to save valuable time at the starting point.
		this._player = new Tone.Player({
			loop: true,
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

	addTranspositionChange(timing, interval) {
		this._transpositionChanges.push({ timing: timing, interval: interval });
	}

	update(passedTime) {
		super.update(passedTime);
		if (this._ended) {
			return;
		}
		if (this._started) {
			for (let change of this._transpositionChanges) {
				if (this.progress >= change.timing) {
					if (this.transposed != change.interval) {
						this.transposeBy = change.interval;
						console.log("changed interval");
					} else {
						if (this._previousTransposition != this.transposed) {
							this._previousTransposition = this.transposed;
							this._transpositionChanges.splice(
								this._transpositionChanges.indexOf(change),
								1
							);
						}
					}
				}

				// Implementation of a portamentoversion
				// if (this.progress >= change.timing) {
				// 	if (this.transposed != change.interval) {
				// 		let direction =
				// 			change.interval - this._previousTransposition < 0 ? "down" : "up";
				// 		let computedChange;
				// 		if (direction == "up") {
				// 			this.transposed += 0.05;
				// 			computedChange = constrain(this.transposed, -48, change.interval);
				// 		} else {
				// 			this.transposed -= 0.05;
				// 			computedChange = constrain(this.transposed, change.interval, 48);
				// 		}
				// 		console.log(round(computedChange * 100) / 100);
				// 		this.transposeBy = round(computedChange * 100) / 100;
				// 	} else {
				// 		if (this._previousTransposition != this.transposed) {
				// 			this._previousTransposition = this.transposed;
				// 			this._transpositionChanges.splice(
				// 				this._transpositionChanges.indexOf(change),
				// 				1
				// 			);
				// 		}
				// 	}
				// }
			}
		}
	}
}
