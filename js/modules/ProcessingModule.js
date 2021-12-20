import AudioModule from "./AudioModule.js";

/* 
    The ProcessingModule can 
    */

export default class ProcessingModule extends AudioModule {
	constructor(options) {
		super(options);
		this.getDefaults(options);

		this.processingUnits = [];

		if (!options.input) {
			console.error("has no input");
			this.moduleFinished();
		} else {
			this.scheduleEvent(this.start);
		}
	}

	getDefaults(options) {
		Object.assign(
			this,
			{
				title: "ProcessingModule",
				decay: 0,
			},
			options
		);
	}

	scheduleEvent(eventTime) {
		Tone.Transport.scheduleOnce((time) => {
			const filter = new Tone.Filter(5000, "lowpass");
			let ps = new Tone.PitchShift(-12);
			this.processingUnits.push(filter);
			this.processingUnits.push(ps);
			this.input.chain(ps, filter, this._channelAmpEnv, this.channel);
		}, eventTime);
	}
	/*
	 * We should keep track of all the event-IDs and cancel here if the module is stopped.
	 */
	async stopModule() {
		super.stopModule();
	}

	dispose() {
		console.log("disposes ProcessingModule");
		console.log(this);
		Tone.Transport.scheduleOnce((time) => {
			for (const processingUnit of this.processingUnits) {
				processingUnit.dispose();
				console.log(processingUnit);
			}
		}, "+" + (this.decay + 0.1));
	}
}
