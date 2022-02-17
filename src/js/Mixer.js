import * as Tone from "tone";
export default class Mixer {
	constructor() {
		this.input = new Tone.Channel();
		this.output = new Tone.Channel().toDestination();
		this.effects = [];
		//this.setupLowPassFilter();
		this.setupReverb();
		this.setupLimiterGain();
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
	setupLimiter() {
		this.limiter = new Tone.Limiter(0);
		this.effects.push(this.limiter);
	}
	setupLimiterGain() {
		this.limiterGain = new Tone.Gain(5, "decibels");
		this.effects.push(this.limiterGain);
	}
}
