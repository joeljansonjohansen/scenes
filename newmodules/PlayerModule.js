import Module from "./Module.js";

/* 
    The PlayerModule can play audio files and does so for a ceratain amount of time
    that you define by setting length. If length is not set, then length is 0 until
    the player gets a buffer - ??
    */

export default class PlayerModule extends Module {
	constructor(options) {
		super(options);
		this.title = options.title ?? "Player";
		this.volume = options.volume ?? 0;
		this.channel = new Tone.Volume(-60).toDestination();
		/*Regarding pitch
		 * It should be made clear what the difference is between playbackRate and
		 * transpose. Is it really necessary to have both? Yes for the Grainplayer?
		 */
		this.playbackRate = options.playbackRate ?? 1;
		this.transpose = options.transpose ?? 0;
		if (this.transpose != 0) {
			this.transposeBy = this.transpose;
		}
		this._transpositionChanges = [];
		this._previousTransposition = this.transpose;

		/*Regarding looping
		 * Offset sets the players starting position. I don't know yet how this plays
		 * with the loopLength.
		 */
		this.offset = this.checkForValueAndConvertToSeconds(options.offset);
		this.loopLength = options.loopLength
			? Tone.Transport.toSeconds(options.loopLength)
			: this.length;

		/*Regarding fades
		 * Use fadeIn and fadeOut for fading in or out of the entire module length.
		 * Use loopFadeIn and loopFadeOut to fade on every loop (for sidechain eg.).
		 */
		this.fadeIn = this.checkForValueAndConvertToSeconds(options.fadeIn);
		this.fadeOut = this.checkForValueAndConvertToSeconds(options.fadeOut);
		if (this.fadeIn + this.fadeOut >= this.length) {
			console.error(
				"Warning! You are trying to set the fadeIn and fadeOut to something bigger than the length."
			);
		}
		this.loopFadeIn = this.checkForValueAndConvertToSeconds(options.loopFadeIn);
		this.loopFadeOut = this.checkForValueAndConvertToSeconds(
			options.loopFadeOut
		);
		console.log(this.loopFadeOut);
		if (this.loopFadeIn + this.loopFadeOut >= this.loopLength) {
			console.error(
				"Warning! You are trying to set the loopFadeIn and loopFadeOut to something bigger than the length."
			);
		}
	}

	checkForValueAndConvertToSeconds(value) {
		return value ? Tone.Transport.toSeconds(value) : 0;
	}

	set transposeBy(interval) {
		this.transpose = interval;
		this.playbackRate = Tone.intervalToFrequencyRatio(this.transpose);
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
					this._player.start(time, this.offset, this.loopLength + 0.05);
					this._player.volume.rampTo(0, this.loopFadeIn, time);
					this._player.volume.rampTo(
						-Infinity,
						this.loopFadeOut,
						time + this.loopLength - (this.loopFadeOut + 0.05)
					);
				}, this.loopLength)
					.start(this.start)
					.stop(this.end);
				this.channel.volume.rampTo(0, this.fadeIn, this.start);
				this.channel.volume.rampTo(
					-Infinity,
					this.fadeOut,
					this.end - this.fadeOut
				);
				// Tone.Transport.scheduleOnce((time) => {
				// 	// this._player.volume.rampTo(0, 0.1);
				// 	console.log("module started: ", time);
				// }, this.start);
				// Tone.Transport.scheduleOnce((time) => {
				// 	// this._player.volume.rampTo(-Infinity, 0.1);
				// 	console.log("module end: ", time);
				// }, this.end - 0.1);
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

	addTranspositionChange(timing, interval, duration = 0.05) {
		this._transpositionChanges.push({
			timing: Tone.Transport.toSeconds(timing) * 1000,
			interval: interval,
			duration: Tone.Transport.toSeconds(duration) * 1000,
		});
		console.log(this._transpositionChanges);
	}

	update(passedTime) {
		super.update(passedTime);
		if (this._ended) {
			return;
		}
		if (this._started) {
			//Go through all the transposition changes planned
			for (let change of this._transpositionChanges) {
				//Check if their timing is bigger than the progress
				if (this.progressInMs >= change.timing) {
					//Check so that the current transposition is not the same as the change.
					if (this.transpose != change.interval) {
						if (this.progressInMs - change.timing <= change.duration) {
							let internalProcess =
								(this.progressInMs - change.timing) / change.duration;
							//let roundedInternal =
							//	Math.round((internalProcess + Number.EPSILON) * 100) / 100;
							let roundedInternal =
								internalProcess >= 0.9 ? 1 : internalProcess;
							let direction = change.interval - this._previousTransposition;
							let dtransposition =
								this._previousTransposition + direction * roundedInternal;
							this.transposeBy = dtransposition;
						}
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
			}
		}
	}
}
