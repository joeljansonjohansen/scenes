import * as Tone from "tone";
import * as Source from "./Source.js";

export default class OSRegion {
	constructor(options) {
		this.getDefaults(options);
		this._channel = new Tone.Volume();
		this._activeSources = [];
		this._delays = [];
	}

	getDefaults(options) {
		Object.assign(
			this,
			{
				sourceType: undefined,
				offset: 0,
				length: 0,
				fadeIn: 0,
				fadeOut: 0.05, //Setting default fade to avoid clicks
				detune: 0,
				volume: 0,
				reverse: false,
				scattering: false,
				randomFiltering: false,
				randomDelay: false,
				randomReversing: false,
				randomDetune: false,
			},
			options
		);
	}

	playRegion(time) {
		this.checkFinishedSources();

		let currentEffects = this.createEffects(time);
		let currentDelay = this.createDelay(time);

		let currentEnvelope = new Tone.AmplitudeEnvelope({
			attack: this.fadeIn,
			decay: 0.1,
			sustain: 1,
			release: this.fadeOut,
		});
		/*
		 * Setup the Player, this could be a Player or a GrainPlayer
		 * dispose the effects and the player in the onStop.
		 */

		let source = Source.getSource({
			sourceType: this.sourceType,
			buffer: this.buffer,
			volume: this.volume,
			detune: this.detune,
			pitch: this.pitch,
			onstop: () => {
				currentEffects.forEach((effect) => {
					effect.dispose();
					//console.log("disposes effect");
				});
				currentEnvelope.dispose();
			},
		});
		//console.log(source);

		source.start(time, this.offset);
		currentEnvelope.triggerAttack(time);
		source.stop(time + this.length + 0.1);
		currentEnvelope.triggerRelease(time + this.length - this.fadeOut);

		if (currentDelay) {
			source.chain(
				currentEnvelope,
				...currentEffects,
				currentDelay,
				this._channel
			);
		} else {
			source.chain(currentEnvelope, ...currentEffects, this._channel);
		}
		this._activeSources.push(source);
		//console.log("in the start: ", this._activeSources);
		return this._channel;
	}

	checkFinishedSources() {
		let indexesToRemove = [];
		for (let index in this._activeSources) {
			let source = this._activeSources[index];
			if (source.state === "stopped") {
				source.dispose();
				indexesToRemove.push(index);
				//console.log(indexesToRemove);
			}
		}
		for (let i = 0; i < indexesToRemove.length; i++) {
			this._activeSources.splice(indexesToRemove[i], 1);
		}
	}

	createDelay(time) {
		if (this.randomDelay && Math.random() > 0.8) {
			/*
			 * Setup the delay and add it to the internal delay-array for disposing them later.
			 * The random value in the if-statement above makes that every note is not affected by this.
			 * Some kind of randomization option should be available. Probablilty thing.
			 */
			const feedbackDelay = new Tone.FeedbackDelay(0.2, 0.5);
			feedbackDelay.wet.value = 0.5;
			// This creates some interesting effects but should perhaps be optional?
			let destVal = 0.2 + Math.random();
			destVal = destVal < 1 ? destVal : 1;
			feedbackDelay.delayTime.rampTo(destVal, 2.5 + Math.random() * 2.5, time);
			this._delays.push(feedbackDelay);
			return feedbackDelay;
		}
		return undefined;
	}

	createEffects(time) {
		let currentEffects = [];

		if (this.randomFiltering) {
			/*
			 * Setup the filter
			 */
			const filter = new Tone.Filter(500 + Math.random() * 1500, "lowpass");
			currentEffects.push(filter);
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
			panner.pan.rampTo(panDest, this.length, time);
			currentEffects.push(panner);

			/*
			 * Randomize a volume value that goes between -20db and 0db.
			 */
			this.volume = -20 + Math.random() * 20;
		}
		return currentEffects;
	}

	get length() {
		if (!this.buffer) {
			return Tone.Transport.toSeconds(this.interval);
		} else {
			return Tone.Transport.toSeconds(this._length);
		}
	}

	set length(value) {
		this._length = value;
	}

	get channel() {
		return this._channel;
	}

	set detune(val) {
		this._detune = val;
	}

	get detune() {
		if (this.randomDetune) {
			return this._detune + (-25 + Math.random() * 25);
		} else {
			return this._detune;
		}
	}

	set buffer(val) {
		this._buffer = val;
		if (!this.sourceType) {
			this.sourceType = "grainPlayer";
		}
		this.length = this.length === 0 ? this._buffer.duration : this.length;
	}

	set reversedBuffer(val) {
		this._reversedBuffer = val;
	}

	get buffer() {
		if ((this.randomReversing && Math.random() > 0.5) || this.reverse) {
			return this._reversedBuffer;
		} else {
			return this._buffer;
		}
	}

	set offset(val) {
		this._offset = val;
	}

	get offset() {
		if (this._offset === "random") {
			let randomOffset = Math.random() * this.buffer.duration;
			return randomOffset + this.length > this.buffer.duration
				? 0
				: randomOffset;
		} else {
			return Tone.Transport.toSeconds(this._offset);
		}
	}

	set fadeIn(val) {
		this._fadeIn = val;
	}

	get fadeIn() {
		if (this._fadeIn === "random") {
			let randomFadeIn = 0.05 + Math.random() * (this.length / 2);
			return randomFadeIn;
		} else {
			return Tone.Transport.toSeconds(this._fadeIn);
		}
	}

	set fadeOut(val) {
		this._fadeOut = val;
	}

	get fadeOut() {
		if (this._fadeOut === "random") {
			let randomFadeOut = 0.05 + Math.random() * (this.length / 2);
			return randomFadeOut;
		} else {
			return Tone.Transport.toSeconds(this._fadeOut);
		}
	}

	set totalRandomization(value) {
		this.scattering = true;
		this.randomFiltering = true;
		this.randomDelay = true;
		this.randomReversing = true;
		this.randomDetune = true;
	}

	dispose() {
		this._buffer?.dispose();
		this._reversedBuffer?.dispose();
		for (const source of this._activeSources) {
			source.dispose();
		}
		for (const delay of this._delays) {
			delay.dispose();
		}
		// console.log("all is disposed");
		// console.log(this._delays);
		// console.log(this._buffer);
		// console.log(this._activeSources);
	}
}
