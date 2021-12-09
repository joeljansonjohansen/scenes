import Module from "./Module.js";

/* 
    The OSPlayerModule can play audio files and does so for a ceratain amount of time
    that you define by setting length. If length is not set, then length is 0 until
    the player gets a buffer - ??
    */

export default class OSPlayerModule extends Module {
	constructor(options) {
		super(options);
		/*
		 * Title used describe the player.
		 */
		this.title = options.title ?? "OSPlayer";

		/*
		 * The channel connected to the module.
		 */
		this.channel = new Tone.Volume().toDestination();

		/*Regarding looping
		 * Offset sets the players starting position. I don't know yet how this plays
		 * with the loopLength.
		 */
		this.offset = this.valueToSeconds(options.offset);
		this.loopLength = this.valueToSeconds(options.loopLength);

		this._interval = this.valueToSeconds(options.interval, undefined);
		this.density = options.density ?? undefined;
		this.reverse = options.reverse ?? false;

		/*Regarding fades
		 * Use fadeIn and fadeOut for fading in or out of the entire module length.
		 * Use loopFadeIn and loopFadeOut to fade on every loop (for sidechain eg.).
		 */
		this.fadeIn = this.valueToSeconds(options.fadeIn);
		this.fadeOut = this.valueToSeconds(options.fadeOut);
		if (this.fadeIn + this.fadeOut >= this.length) {
			console.error(
				"Warning! You are trying to set the fadeIn and fadeOut to something bigger than the length."
			);
		}
		this.loopFadeIn = this.valueToSeconds(options.loopFadeIn);
		this.loopFadeOut = this.valueToSeconds(options.loopFadeOut);
		console.log(this.loopFadeOut);
		if (this.loopFadeIn + this.loopFadeOut >= this.loopLength) {
			console.error(
				"Warning! You are trying to set the loopFadeIn and loopFadeOut to something bigger than the length."
			);
		}

		/*
		 * This is the envelope for the entire module.
		 * The envelope is used to be able to have a separate volume control.
		 * Could also just use a volume? But this might have its perks.
		 */
		this.decay = this.valueToSeconds(options.decay);
		this._channelAmpEnv = new Tone.AmplitudeEnvelope({
			attack: this.fadeIn,
			decay: 0.1,
			sustain: 1,
			release: this.fadeOut,
		});
		this._channelAmpEnv.attackCurve = "sine";
		this._channelAmpEnv.releaseCurve = "sine";

		/*
		 * RANDOMIZED OPTIONS
		 * These are a couple of options to randomize different aspects of the sound.
		 * Eg. "Scattering" randomizes volume and pan
		 */
		this.totalRandomization = options.totalRandomization ?? false;
		this.scattering = options.scattering ?? this.totalRandomization;
		this.randomFiltering = options.randomFiltering ?? this.totalRandomization;
		this.randomDelay = options.randomDelay ?? this.totalRandomization;
		this.randomReversing = options.randomReversing ?? this.totalRandomization;
		this.randomDetune = options.randomDetune ?? this.totalRandomization;

		/*
		 * INTERNAL EFFECTS COLLECTED IN ARRAYS
		 */
		this.delays = [];

		/*Regarding pitch
		 * It should be made clear what the difference is between playbackRate and
		 * transpose. Is it really necessary to have both? Yes for the Grainplayer?
		 */
		this.detune = options.detune ?? 0;
		this.playbackRate = options.playbackRate ?? 1;
		this.transpose = options.transpose ?? 0;
		if (this.transpose != 0) {
			this.transposeBy = this.transpose;
		}
		this._transpositionChanges = [];
		this._previousTransposition = this.transpose;
	}

	set transposeBy(interval) {
		this.transpose = interval;
		this.playbackRate = Tone.intervalToFrequencyRatio(this.transpose);
		if (this._player) {
			this._player.playbackRate = this.playbackRate;
		}
	}

	get interval() {
		if (this.density) {
			/*
			 * If we have a densitiy, the interval is based on this.
			 */
			return Math.random() * (2 * this.density);
		} else if (this._interval) {
			return this._interval;
		} else {
			/*
			 *If we don't have either density or interval, return 1 second as interval.
			 */
			return 1;
		}
	}

	prepareModule(options) {
		/*
		 * This function loads the buffer from the url and schedules events.
		 */
		this.buffer = new Tone.ToneAudioBuffer({
			url: options.recordingURL,
			reverse: this.reverse,
			onload: () => {
				options.moduleReady();

				/*
				 * Set the loopLength to the buffer.duration if loopLength is 0.
				 * Also set the interval to the same if no interval is set.
				 * Then start scheduling events.
				 */
				this.loopLength =
					this.loopLength === 0 ? this.buffer.duration : this.loopLength;
				this._interval = this._interval ? this._interval : this.loopLength;

				this.scheduleEvent(this.start);

				/*
				 * There is a variable called decay. This is only used
				 * here, when the release of the envelope is triggered.
				 * And functions as a way to let the module finish.
				 */

				Tone.Transport.scheduleOnce((time) => {
					this._channelAmpEnv.triggerAttack(time);
					this._channelAmpEnv.triggerRelease(
						time + this.length - this.fadeOut + this.decay
					);
				}, this.start);

				//One way to change things would be to use Tone.js events. But maybe there is a better way?
				// const seq = new Tone.Sequence(
				// 	(time, note) => {
				// 		//console.log(note);
				// 		this.detune = parseInt(note);
				// 	},
				// 	["-1200", "-700", "-300", "200", "-800", "-50", "-400"],
				// 	this.interval
				// ).start(this.start - 0.1);
			},
			onerror: (error) => {
				console.log("Buffer error: ", error);
			},
		});
		this.reversedBuffer = new Tone.ToneAudioBuffer({
			url: options.recordingURL,
			reverse: true,
			onerror: (error) => {
				console.log("Buffer error: ", error);
			},
		});
	}

	scheduleEvent(eventTime) {
		Tone.Transport.scheduleOnce((time) => {
			//Create an array to collect all the effects for connecting them to the channel later.
			let effectsToConnect = [];
			//Create an internal volume that is used (and randomized if scattering is on.)
			let volume = 0;
			let bufferToPlay = this.buffer;

			if (this.randomReversing) {
				if (Math.random() > 0.5) {
					bufferToPlay = this.reversedBuffer;
				}
			}

			if (this.scattering) {
				/*
				 * Setup pan values. First the randomized initial pan and then the destination pan.
				 * Then setup the panner.
				 */
				let panRange = 2;
				let initialPan = -1 + Math.random() * 2;
				let panDest =
					initialPan < 0
						? initialPan + Math.random() * panRange
						: initialPan - Math.random() * panRange;
				panDest = panDest < -1 ? -1 : panDest;
				panDest = panDest > 1 ? 1 : panDest;

				const panner = new Tone.Panner(initialPan);
				panner.pan.rampTo(panDest, this.loopLength, time);
				effectsToConnect.push(panner);

				/*
				 * Randomize a volume value that goes between -20db and 0db.
				 */
				volume = -20 + Math.random() * 20;
			}

			if (this.randomFiltering) {
				/*
				 * Setup the filter
				 */
				const filter = new Tone.Filter(500 + Math.random() * 1500, "lowpass");
				effectsToConnect.push(filter);
			}

			if (this.randomDelay && Math.random() > 0.2) {
				/*
				 * Setup the delay and add it to the internal delay-array for disposing them later.
				 * The random value in the if-statement above makes that every note is not affected by this.
				 * Some kind of randomization option should be available. Probablilty thing.
				 */
				const feedbackDelay = new Tone.FeedbackDelay(0.2, 0.5);
				feedbackDelay.wet.value = 0.5;
				//This creates some interesting effects but should perhaps be optional?
				let destVal = 0.2 + Math.random();
				destVal = destVal < 1 ? destVal : 1;
				feedbackDelay.delayTime.rampTo(
					destVal,
					2.5 + Math.random() * 2.5,
					time
				);
				this.delays.push(feedbackDelay);
				effectsToConnect.push(feedbackDelay);
			}

			let detune = this.detune;
			if (this.randomDetune) {
				detune = this.detune + (-50 + Math.random() * 50);
			}

			/*
			 * Being able to randomize the offset is very interesting but should be made into a variable.
			 */
			let _offset = Math.random() * this.buffer.duration;
			_offset = _offset + this.loopLength > this.buffer.duration ? 0 : _offset;

			const playerEnv = new Tone.AmplitudeEnvelope({
				attack: this.loopFadeIn,
				decay: 0.1,
				sustain: 1,
				release: this.loopFadeOut,
			});
			/*
			 * Setup the Player, this could be a Player or a GrainPlayer
			 * dispose the effects and the player in the onStop.
			 */
			let player = new Tone.GrainPlayer({
				loop: false,
				//reverse: true,
				url: bufferToPlay,
				volume: volume,
				detune: detune,
				//playbackRate: this.playbackRate,
				//detune: this.detune, // + (-50 + Math.random() * 50),
				//detune: -1200 + Math.random() * 1200,
				//detune: -1200,
				// playbackRate: 1.0,
				//playbackRate: Tone.intervalToFrequencyRatio(this.detune / 100),
				onstop: () => {
					player.dispose();
					playerEnv.dispose();
					effectsToConnect.forEach((effect) => {
						if (!this.delays.includes(effect)) {
							effect?.dispose();
						}
					});
				},
			})
				.start(time, _offset)
				.stop(time + this.loopLength + 0.1);
			playerEnv.triggerAttack(time);
			playerEnv.triggerRelease(time + this.loopLength - this.loopFadeOut);

			/*
			 * Perhaps this could be changed into an envelope. Or maybe this is good for now.
			 */
			// player.volume.rampTo(volume, this.loopFadeIn, time);
			// player.volume.rampTo(
			// 	-Infinity,
			// 	this.loopFadeOut,
			// 	time + (this.loopLength - this.loopFadeOut) - 0.1
			// );

			player.chain(
				playerEnv,
				...effectsToConnect,
				this._channelAmpEnv,
				this.channel
			);
		}, eventTime);

		/*
		 * If we have a measured time, as a fixed value, quarter note or so. We take that value.
		 * Otherwise we randomize a time based on the density that has been set before.
		 * Then we schedule it if it's inside of the modules timeframe.
		 */
		let nextTime = eventTime + this.interval;
		//console.log(nextTime);
		if (nextTime < this.end) {
			this.scheduleEvent(nextTime);
		}
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

	/*
	 * We should keep track of all the event-IDs and cancel here if the module is stopped.
	 */
	async stopModule() {
		super.stopModule();
	}

	/*
	 * Cleaning up all the delays and buffers (and other things)
	 */
	moduleFinished() {
		for (let feedbackDelay of this.delays) {
			feedbackDelay.dispose();
		}
		this.buffer.dispose();
		super.moduleFinished();
	}
}
