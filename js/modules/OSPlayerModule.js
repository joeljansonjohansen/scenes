import Module from "./Module.js";
import OSRegion from "./OSRegion.js";

/* 
    The OSPlayerModule can play audio files and does so for a ceratain amount of time
    that you define by setting length. If length is not set, then length is 0 until
    the player gets a buffer - ??
    */

export default class OSPlayerModule extends Module {
	constructor(options) {
		super(options);
		this.getDefaults(options);
		/*
		 * The channel connected to the module.
		 */
		this.channel = new Tone.Volume().toDestination();

		/*
		 * This is the envelope for the entire module.
		 * The envelope is used to be able to have a separate volume control.
		 * Could also just use a volume? But this might have its perks.
		 */
		// this.decay = this.valueToSeconds(options.decay);
		this._channelAmpEnv = new Tone.AmplitudeEnvelope({
			attack: this.fadeIn,
			decay: 0.1,
			sustain: 1,
			release: this.fadeOut,
		});
		this._channelAmpEnv.attackCurve = "sine";
		this._channelAmpEnv.releaseCurve = "sine";

		this.regions = new OSRegion(options.regions);
		this.regions.pitch = this.pitch;
		this.regions.interval = this.interval;
		//this.regions.detune = this.detune;

		this.currentHarmonyIndex = 0;

		/*
		 * Schedule all of the modules events in the constructor.
		 * There is a variable called decay. This is only used
		 * here, when the release of the envelope is triggered.
		 * And functions as a way to let the module finish.
		 */

		//For looping functionality use "schedule instead".
		Tone.Transport.scheduleOnce((time) => {
			this._channelAmpEnv.triggerAttack(time);
		}, this.start);

		Tone.Transport.scheduleOnce((time) => {
			this._channelAmpEnv.triggerRelease(time);
		}, this.end - this.fadeOut + this.decay);

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
			},
			options
		);
	}

	prepareModule(options) {
		/*Deprecating this function*/
		this.recordingURL = options.recordingURL;
	}

	scheduleEvent(eventTime) {
		this._loop = new Tone.Loop((time) => {
			// for (let index = 0; index < 4; index++) {
			// 	this.regions.detune = this.detune + index * -300;
			// 	let regionChannel = this.regions.playRegion(time);
			// 	regionChannel.chain(this._channelAmpEnv, this.channel);
			// }
			let regionChannel = this.regions.playRegion(time);
			regionChannel.chain(this._channelAmpEnv, this.channel);
			this._loop.playbackRate = this.loopPlaybackRate;
		}, this.interval);
		this._loop.start(eventTime).stop(this.end);

		let testloop = new Tone.Loop((time) => {
			console.log(Tone.Transport.position);
		}, this.interval);
		testloop.start(eventTime);
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

	set fadeIn(val) {
		this._fadeIn = val;
	}

	get fadeIn() {
		return this.toSeconds(this._fadeIn);
	}

	set fadeOut(val) {
		this._fadeOut = val;
	}

	get fadeOut() {
		return this.toSeconds(this._fadeOut);
	}

	set decay(val) {
		this._decay = val;
	}

	get decay() {
		return this.toSeconds(this._decay);
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

	dispose() {
		console.log("disposes OSPlayerModule");
		Tone.Transport.scheduleOnce((time) => {
			this.buffer.dispose();
			this.regions.dispose();
		}, "+" + this.decay + 0.1);
	}
}
