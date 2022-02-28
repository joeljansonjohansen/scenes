import * as Tone from "tone";
export default class Mixer {
	constructor() {
		this.input = new Tone.Channel();
		this.output = new Tone.Channel().toDestination();
		this.effects = [];
		//this.setupReverb();
		//this.setupStereoWidener();
		this.setupMeter();
		this.setupLimiterGain();
		//this.setupLowPassFilter();
		this.setupLimiter();
		this.input.chain(...this.effects, this.output);
	}

	setupReverb() {
		this.reverb = new Tone.Reverb(5.5);
		this.reverb.wet.value = 0.5;
		this.effects.push(this.reverb);
	}
	setupLowPassFilter(frequency = 2347, rolloff = -48) {
		this.lpfilter = new Tone.Filter(frequency, "lowpass");
		this.lpfilter.rolloff = rolloff;
		this.effects.push(this.lpfilter);
	}
	setupMeter() {
		this.meter = new Tone.Meter();
		this.effects.push(this.meter);
	}
	setupLimiter() {
		this.limiter = new Tone.Limiter(0);
		this.effects.push(this.limiter);
	}
	setupLimiterGain() {
		this.limiterGain = new Tone.Gain(5, "decibels");
		this.effects.push(this.limiterGain);
	}
	/* setupStereoWidener() {
		this.stereoWidener = new Tone.StereoWidener(0.9);
		this.effects.push(this.stereoWidener);
	} */
}
