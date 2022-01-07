import * as Tone from "tone";
import AudioModule from "./AudioModule.js";
import Region from "../sources/Region.js";

/* 
    The PlayerModule can play audio files and does so for a ceratain amount of time
    that you define by setting length. If length is not set, then length is 0 until
    the player gets a buffer - ??
    */

export default class PlayerModule extends AudioModule {
	constructor(options) {
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
				fadeIn: 0,
				fadeOut: 0.1, //Default fade-out, to avoid click at the end.
				decay: "3m", //Always setting the decay to 3 measures to let the module ring out.
				detune: 0,
				pitch: "C3", // Default pitch that the oscillators will start from
				interval: "1m",
				//loopPlaybackRate: 1,
				harmony: undefined,
				lpbrSignal: 1,
			},
			options
		);
	}

	prepareModule(options) {
		/*Deprecating this function*/
		this.recordingURL = options.recordingURL;
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

		this._loop = new Tone.Loop((time) => {
			// for (let index = 0; index < 4; index++) {
			// 	this.regions.detune = this.detune + index * -300;
			// 	let regionChannel = this.regions.playRegion(time);
			// 	regionChannel.chain(this._channelAmpEnv, this.channel);
			// }
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

	set recordingURL(value) {
		/*
		 * This function loads the buffer from the url and schedules events.
		 * It also loads an additional version of the buffer that is reversed.
		 * This is because setting the reverse to true on the player itself
		 * can lead to clicks.
		 */
		this.buffer = new Tone.ToneAudioBuffer({
			url: value,
			onload: () => {
				this.regions.buffer = this.buffer;
			},
			onerror: (error) => {
				console.log("Buffer error: ", error);
			},
		});

		this.reversedBuffer = new Tone.ToneAudioBuffer({
			url: value,
			reverse: true,
			onload: () => {
				this.regions.reversedBuffer = this.reversedBuffer;
			},
			onerror: (error) => {
				console.log("Buffer error: ", error);
			},
		});
	}

	set interval(val) {
		this._interval = val;
	}

	set density(val) {
		this._density = val;
	}

	get interval() {
		if (this._interval === "random") {
			return 4;
		} else {
			return this.toSeconds(this._interval);
		}
	}

	get loopPlaybackRate() {
		if (this._interval === "random") {
			//TODO: This needs a better algoritm
			return this._density + Math.random() * this._density;
		} else {
			return 1;
		}
	}

	set lpbrSignal(val) {
		this._lpbrSignal = new Tone.Signal(val);
	}

	get lpbrSignal() {
		return this._lpbrSignal;
	}

	dispose() {
		console.log("disposes PlayerModule");
		Tone.Transport.scheduleOnce((time) => {
			this.buffer?.dispose();
			this.regions?.dispose();
		}, "+" + (this.decay + 0.1));
	}
}
