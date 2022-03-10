import * as Tone from "tone";

export default class AMGrainPlayer extends Tone.GrainPlayer {
	constructor(options) {
		super(options);
		this.frequency = options.frequency;
	}

	_tick(time) {
		// check if it should stop looping
		//console.log(this._clock.frequency.value);
		const ticks = this._clock.getTicksAtTime(time);
		const offset = ticks * this._grainSize;
		this.log("offset", offset);

		if (!this.loop && offset > this.buffer.duration) {
			this.stop(time);
			return;
		}

		// at the beginning of the file, the fade in should be 0
		const fadeIn = offset < this._overlap ? 0 : this._overlap;

		// create a buffer source
		const source = new Tone.ToneBufferSource({
			context: this.context,
			url: this.buffer,
			//reverse: this.reverse,
			fadeIn: fadeIn,
			fadeOut: this._overlap,
			loop: false,
			//loopStart: this._loopStart,
			//loopEnd: this._loopEnd,
			// compute the playbackRate based on the detune
			playbackRate: Tone.intervalToFrequencyRatio(this.detune / 100),
		}).connect(this.output);
		//console.log(source.start);
		//source._gainNode.gain.setValueAtTime(0.1,time+0.1);

		//console.log(this.buffer.duration);
		let end = this._loopEnd > 0 ? this._loopEnd : this.buffer.duration;
		let random = this._loopStart + Math.random() * (end - this._loopStart);
		//console.log(Tone.gainToDb(0.005));
		//The gain does not work as expected.
		//Set in oneshot buffersource
		//This should be calculated
		source.start(time, random);
		//console.log(source._gainNode.gain.value);
		//source.output.gain.setValueAtTime(-70,time);
		//source.start(time, this._grainSize * ticks);
		source.stop(time + this._grainSize / this.playbackRate);

		// add it to the active sources
		this._activeSources.push(source);
		// remove it when it's done
		source.onended = () => {
			const index = this._activeSources.indexOf(source);
			if (index !== -1) {
				this._activeSources.splice(index, 1);
			}
		};
	}

	/**
	 * The size of each chunk of audio that the
	 * buffer is chopped into and played back at.
	 */
	get grainSize() {
		return this._grainSize;
	}
	set grainSize(size) {
		this._grainSize = this.toSeconds(size);
	}

	get frequency() {
		return this._frequency;
	}

	set frequency(freq) {
		this._frequency = freq;
		this._clock.frequency.setValueAtTime(1 / freq, this.now());
	}
}
