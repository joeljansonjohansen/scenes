import * as Tone from "tone";
import AudioModule from "./AudioModule.js";
import Region from "../sources/Region.js";
import { ToneAudioBuffer, ToneAudioBuffers } from "tone";

/* 
    The PlayerModule can play audio files and does so for a ceratain amount of time
    that you define by setting length. If length is not set, then length is 0 until
    the player gets a buffer - ??
    */

export default class PlayerModule extends AudioModule {
	constructor(options) {
		console.log(options);
		super(options);

		this.getDefaults(options);
		this.regions = new Region(options.regions);
		this.regions.pitch = this.pitch;
		this.regions.interval = this.interval;

		this.scheduleEvent(this.start);
	}

	getDefaults(options) {
		Object.assign(
			this,
			{
				title: "OSPlayer",
				density: 0.5,
				fadeIn: 0.001,
				fadeOut: 0.001, //Default fade-out, to avoid click at the end.
				decay: "3m", //Always setting the decay to 3 measures to let the module ring out.
				detune: 0,
				pitch: "C3", // Default pitch that the oscillators will start from
				interval: "1m",
				//loopPlaybackRate: 1,
				harmony: undefined,
			},
			options
		);
	}

	/* nextEvent(eventTime) {
		Tone.Transport.scheduleOnce((time) => {
			let diff = Tone.now() - time;
			console.log(this.interval);
			this.nextEvent("+" + this.interval / this._lpbrSignal.value);
			let regionChannel = this.regions.playRegion(time);
			regionChannel.chain(this._channelAmpEnv, this.channel);
		}, eventTime);
	} */

	scheduleEvent(eventTime) {
		console.log("schedule event happens");
		//this.nextEvent(eventTime);
		//Implement interval-array like this kindof:
		/* let iter = 0;
		let array = ["1m", "4n", "8n", "2n", "1m", "16n"];
		const loop = new Tone.Loop((time) => {
			// triggered every eighth note.
			console.log(time);
			loop.interval = array[iter];
			iter++;
			iter = iter % array.length;
		}).start(0);
		Tone.Transport.start(); */
		let currentIndexOfBuffers = 0;

		this._loop = new Tone.Loop((time) => {
			// for (let index = 0; index < 4; index++) {
			// 	this.regions.detune = this.detune + index * -300;
			// 	let regionChannel = this.regions.playRegion(time);
			// 	regionChannel.chain(this._channelAmpEnv, this.channel);
			// }
			//console.log("Buffers are:", this.buffers);

			this.regions.detune = this.detune;

			if (this.buffers) {
				this.regions.buffer = this.buffers.get(currentIndexOfBuffers);
				//console.log(this.regions.buffers._buffers.size);
				currentIndexOfBuffers++;
				currentIndexOfBuffers =
					currentIndexOfBuffers > this.buffers._buffers.size - 1
						? 0
						: currentIndexOfBuffers;
			}
			let regionChannel = this.regions.playRegion(time);
			regionChannel.chain(this._channelAmpEnv, this.channel);
			//console.log(this._loop.playbackRate);

			this._loop.playbackRate = this.loopPlaybackRate;
		}, this.interval);
		this._loop.start(eventTime).stop(this.end);

		// let testloop = new Tone.Loop((time) => {
		// 	console.log(Tone.Transport.position);
		// }, this.interval);
		// testloop.start(eventTime);
	}

	/*
	 * We should keep track of all the event-IDs and cancel here if the module is stopped.
	 */
	async stopModule() {
		console.log("Stopping playermodule");
		super.stopModule();
	}

	/*
	 * Cleaning up all the delays and buffers (and other things)
	 * TODO: Perhaps wait to clean up the delays? What happens if we have a decay?
	 */
	moduleFinished() {
		this.dispose();
		super.moduleFinished();
	}

	set buffer(value) {
		/*
		 * This function loads the buffer from the url and schedules events.
		 * It should also load an additional version of the buffer that is reversed.
		 * This is because setting the reverse to true on the player itself
		 * can lead to clicks.
		 */
		//console.log("value is:", value);
		/* this.buffer = value;
		this.regions.buffer = this.buffer;
		this.reversedBuffer = value;
		this.reversedBuffer.reverse = true;
		this.regions.reversedBuffer = this.reversedBuffer; */
		if (value instanceof ToneAudioBuffer) {
			this._buffer = new Tone.ToneAudioBuffer({
				url: value,
			});
			this.regions.buffer = this.buffer;
		} else {
			this._buffer = new Tone.ToneAudioBuffer({
				url: value,
				onload: () => {
					this.regions.buffer = this.buffer;
				},
				onerror: (error) => {
					console.log("Buffer error: ", error);
				},
			});
			/* 
			this.reversedBuffer = new Tone.ToneAudioBuffer({
				url: value,
				reverse: true,
				onload: () => {
					this.regions.reversedBuffer = this.reversedBuffer;
				},
				onerror: (error) => {
					console.log("Buffer error: ", error);
				},
			}); */
		}
	}

	get buffer() {
		return this._buffer;
	}

	set buffers(value) {
		if (value instanceof ToneAudioBuffers) {
			this._buffers = value;
		} else {
			console.log(
				"If using the buffers property on PlayerModule, it must be of type ToneAudioBuffers"
			);
		}
	}

	get buffers() {
		return this._buffers;
	}

	set interval(val) {
		this._interval = val;
	}

	get interval() {
		if (this._interval === "random") {
			return 4;
		} else {
			return this.toSeconds(this._interval);
		}
	}

	set density(val) {
		this._density = val;
	}

	get density() {
		return this._density;
	}

	/**
	 * Detune is either an array with intervals or a single interval. These are defined in cents.
	 * Example [-1200, 500, 200] or just 300;
	 * These are later read continously - should be able to set to random as well.
	 */

	set detune(value) {
		this._detune = value;
		this._currentDetuneIndex = 0;
	}

	get detune() {
		if (this._detune instanceof Array) {
			let returnValue = this._detune[this._currentDetuneIndex];
			this._currentDetuneIndex++;
			this._currentDetuneIndex =
				this._currentDetuneIndex > this._detune.length - 1
					? 0
					: this._currentDetuneIndex;
			return returnValue;
		} else {
			return this._detune;
		}
	}

	/**
	 * Loopplaybackrate is used to get non-linear intervals. It works by setting the
	 * interval of the module to the arbitrary number 4 - as in 4 seconds. Then
	 * the rate of the loop that plays back the sounds varies based on the density.
	 * That way, the interval of 4 seconds is multiplied with this density and varies in length.
	 */

	get loopPlaybackRate() {
		if (this._interval === "random") {
			//TODO: This needs a better algoritm
			return this.density + Math.random() * this.density;
		} else {
			return 1;
		}
	}

	dispose() {
		console.log("disposes PlayerModule");
		Tone.Transport.scheduleOnce((time) => {
			this.buffer?.dispose();
			this.buffers?.dispose();
			this.regions?.dispose();
			this.channel?.dispose();
		}, "+" + (this.decay + 0.1));
	}
}
