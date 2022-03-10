import * as Tone from "tone";

export default class AMToneAudioBuffer extends Tone.ToneAudioBuffer {
	constructor(options) {
		super(options);
	}

	findOnset() {
		let arrayOfData = this.getChannelData(0);
		let timesign;
		/*This should ideally have a db value, a threshold
		 * and maybe be in a while loop for optimization? So that it ends as
		 * soon as it finds the value?
		 */
		arrayOfData.forEach((item, index) => {
			if (item > 0 && timesign === undefined) {
				timesign = index / this.sampleRate;
			}
		});
		return timesign;
	}

	normalize() {
		let totalMax = 0;
		let buffersArray;
		console.log(this.numberOfChannels);
		if (this.numberOfChannels < 2) {
			buffersArray = [this.getChannelData(0)];
		} else if (this.numberOfChannels > 1) {
			buffersArray = this.toArray();
		}

		buffersArray.forEach((currentBuffer) => {
			let currentMax = currentBuffer.reduce(function (a, b) {
				return Math.max(a, b);
			}); // 4
			totalMax = totalMax > currentMax ? totalMax : currentMax;
		});

		if (totalMax === 0 || totalMax === 1) {
			//Buffer is normalized or empty. Return
			return this;
		}

		let normalizedBuffers = [];

		buffersArray.forEach((currentBuffer) => {
			let newBuffer = [];
			currentBuffer.forEach((element) => {
				newBuffer.push(element * (1 / totalMax));
			});
			let normalizedCurrentBuffer = Float32Array.from(newBuffer);
			normalizedBuffers.push(normalizedCurrentBuffer);
		});

		this._buffer = Tone.Buffer.fromArray(normalizedBuffers)._buffer;
		//console.log(finalBuffer);
		return this;
	}
}
