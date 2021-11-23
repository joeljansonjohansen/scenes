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
		this.transpose = options.transpose ?? 0;
		if (this.transpose != 0) {
			this.transposeBy = this.transpose;
		}
		this._transpositionChanges = [];
		this._previousTransposition = this.transpose;
	}

	set transposeBy(interval) {
		this.playbackRate = Tone.intervalToFrequencyRatio(interval);
		this.transpose = interval;
		if (this._player) {
			this._player.playbackRate = this.playbackRate;
		}
	}

	prepareModule(options) {
		//Function for any preparations that cannot be done in the setup but should be done before start to save valuable time at the starting point.
		this._player = new Tone.Player({
			loop: false,
			url: options.recordingURL,
			playbackRate: this.playbackRate,
			volume: -70,
			onload: () => {
				this._loop = new Tone.Loop((time) => {
					console.log("loop started: ", time);
					this._player.start(
						time,
						0,
						this.loopLength * this._player.playbackRate + 0.05
					);
				}, this.loopLength)
					.start(this.start)
					.stop(this.end);
				Tone.Transport.scheduleOnce((time) => {
					this._player.volume.rampTo(1, 0.1);
					console.log("module started: ", time);
				}, this.start);
				Tone.Transport.scheduleOnce((time) => {
					this._player.volume.rampTo(-70, 0.1);
					console.log("module end: ", time);
				}, this.end - 0.1);
				options.moduleReady();
			},
			onstop: () => {
				console.log("playerStopped");
			},
		}).toDestination();
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
		/*if (this._started) {
			for (let change of this._transpositionChanges) {
				if (this.progress >= change.timing) {
					if (this.transpose != change.interval) {
						this.transposeBy = change.interval;
						console.log("changed interval");
					} else {
						if (this._previousTransposition != this.transpose) {
							this._previousTransposition = this.transpose;
							this._transpositionChanges.splice(
								this._transpositionChanges.indexOf(change),
								1
							);
						}
					}
				}

				// Implementation of a portamentoversion
				// if (this.progress >= change.timing) {
				// 	if (this.transpose != change.interval) {
				// 		let direction =
				// 			change.interval - this._previousTransposition < 0 ? "down" : "up";
				// 		let computedChange;
				// 		if (direction == "up") {
				// 			this.transpose += 0.05;
				// 			computedChange = constrain(this.transpose, -48, change.interval);
				// 		} else {
				// 			this.transpose -= 0.05;
				// 			computedChange = constrain(this.transpose, change.interval, 48);
				// 		}
				// 		console.log(round(computedChange * 100) / 100);
				// 		this.transposeBy = round(computedChange * 100) / 100;
				// 	} else {
				// 		if (this._previousTransposition != this.transpose) {
				// 			this._previousTransposition = this.transpose;
				// 			this._transpositionChanges.splice(
				// 				this._transpositionChanges.indexOf(change),
				// 				1
				// 			);
				// 		}
				// 	}
				// }
			}
		}*/
	}
}
