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

		this.currentHarmonyIndex = 0;

		/*
		 * Schedule all of the modules events in the constructor.
		 * There is a variable called decay. This is only used
		 * here, when the release of the envelope is triggered.
		 * And functions as a way to let the module finish.
		 */

		Tone.Transport.scheduleOnce((time) => {
			this._channelAmpEnv.triggerAttack(time);
			this._channelAmpEnv.triggerRelease(
				time + (this.length - this.fadeOut) + this.decay
			);
		}, this.start);

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
				playbackRate: 1,
				detune: 0,
				pitch: 0,
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
		Tone.Transport.scheduleOnce((time) => {
			let regionChannel = this.regions.playRegion(time);
			regionChannel.chain(this._channelAmpEnv, this.channel);
			// if (this.harmony) {
			// 	for (let pitch of this.harmony[this.currentHarmonyIndex]) {
			// 		this.regions.detune = pitch;
			// 		console.log(pitch);
			// 		let regionChannel = this.regions.playRegion(time);
			// 		regionChannel.chain(this._channelAmpEnv, this.channel);
			// 	}
			// 	this.currentHarmonyIndex =
			// 		this.currentHarmonyIndex < this.harmony.length - 1
			// 			? this.currentHarmonyIndex + 1
			// 			: 0;
			// 	console.log("this.currentHarmonyIndex: ", this.currentHarmonyIndex);
			// } else {
			// let regionChannel = this.regions.playRegion(time);
			// regionChannel.chain(this._channelAmpEnv, this.channel);
			// }
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

	get interval() {
		if (this._interval === "random") {
			/*
			 * If we have a densitiy, the interval is based on this.
			 */
			return Math.random() * (2 * this.density);
		} else if (this._interval) {
			return this.toSeconds(this._interval);
		} else {
			/*
			 *If we don't have either density or interval, return 1 second as interval.
			 */
			return 1;
		}
	}

	dispose() {
		Tone.Transport.scheduleOnce((time) => {
			this.buffer.dispose();
			this.regions.dispose();
		}, "+" + this.decay + 0.1);
	}
}
