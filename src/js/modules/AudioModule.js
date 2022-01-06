import Module from "./Module.js";

/* 
    The AudioModule is the base class for both audio players, and audio that uses effects.
    */

export default class AudioModule extends Module {
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
		 */
		this._channelAmpEnv = new Tone.AmplitudeEnvelope({
			attack: this.fadeIn,
			decay: 0.1,
			sustain: 1,
			release: this.fadeOut,
		});
		this._channelAmpEnv.attackCurve = "sine";
		this._channelAmpEnv.releaseCurve = "sine";

		/*
		 * Schedule all of the modules events in the constructor.
		 * There is a variable called decay. This is only used
		 * here, when the release of the envelope is triggered.
		 * And functions as a way to let the module finish.
		 */

		Tone.Transport.scheduleOnce((time) => {
			this._channelAmpEnv.triggerAttack(time);
		}, this.start);

		Tone.Transport.scheduleOnce((time) => {
			this._channelAmpEnv.triggerRelease(time);
		}, this.end - this.fadeOut + this.decay);

		// this.scheduleEvent(this.start);
	}

	getDefaults(options) {
		Object.assign(
			this,
			{
				title: "AudioModule",
				fadeIn: 0,
				fadeOut: 0.1, //Default fade-out, to avoid click at the end.
				decay: 0,
			},
			options
		);
	}

	scheduleEvent(eventTime) {}

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

	dispose() {
		console.log("Disposes AudioModule");
	}
}
