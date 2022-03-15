import * as Tone from "tone";
import Module from "./Module.js";

export default class OnsetRecorderModule extends Module {
	constructor(options) {
		super(options);
		if (!options.input) {
			console.error("has no access to input");
			this.moduleFinished();
		} else {
			if (this.start < 1) {
				console.error("Recorder should start at least 1 second in.");
			}

			if (MediaRecorder.isTypeSupported("audio/mp4;codecs:opus")) {
				this.recorder = new Tone.Recorder({
					mimeType: "audio/mp4;codecs:opus",
				});
			} else if (MediaRecorder.isTypeSupported("audio/webm;codecs:opus")) {
				this.recorder = new Tone.Recorder("audio/webm;codecs:opus");
			} else {
				this.recorder = new Tone.Recorder();
			}

			/*
			 * The channel connected to the module.
			 */
			this.channel = new Tone.Volume();
			this.channel.volume.value = -Infinity;
			this.input = options.input;

			this.input.chain(this.channel, this.recorder);
			console.log("Onset recorder happens");
			this.setupRecorder();
		}
	}

	setupRecorder() {
		//Internal variables
		const osc = new Tone.Oscillator();
		osc.connect(this.recorder);
		//This is how much time will be added before the actual recording starts.
		const addedTime = Tone.Time("1m");
		//This is the calculated time of the actual triggertime for the transport.
		const actualStartOfRecording = this.start - addedTime;
		//This is the startTime added to the transporttime.
		const oscStartTime = Tone.Time("4n");
		//This is the length of the oscillator-tone.
		const lengthOfOsc = Tone.Time("4n");
		//This is the calculated starttime of the actual recording.
		const actualStartTime = addedTime - oscStartTime;

		//Add 0.1 seconds to make sure we get the entire recording time.
		const lengthOfRecordingTime = this.end + 0.1;

		Tone.Transport.scheduleOnce((time) => {
			// use the callback time to schedule events
			this.recorder.start();
			osc.start(time + oscStartTime).stop(time + oscStartTime + lengthOfOsc);
			this.channel.volume.rampTo(0, 1 / 22050, time + addedTime);
			console.log("recording started");
		}, actualStartOfRecording);

		Tone.Transport.scheduleOnce(async (time) => {
			console.log("recording ended");
			const recording = await this.recorder.stop();
			this.recordingURL = URL.createObjectURL(recording);
			let loadBuffer = new Tone.ToneAudioBuffer({
				url: this.recordingURL,
				onload: () => {
					//console.log("Buffer is loaded");
					console.log(loadBuffer);
					let onset = this.findOnset(loadBuffer);
					//console.log("onset is: ", onset);
					let newBuffer = loadBuffer.slice(
						onset + actualStartTime,
						onset + actualStartTime + this.length
					);
					//console.log("newbuffer: ", newBuffer);
					//newBuffer.normalizeBuffer();
					this.originalBuffer = newBuffer;
					this.normalizedBuffer = this.normalize(newBuffer);
					//console.log("Recording ended");
					super.stopModule();
				},
			});
		}, lengthOfRecordingTime);
	}

	findOnset(buffer) {
		let arrayOfData = buffer.getChannelData(0);
		let timesign;
		/*This should ideally have a db value, a threshold
		 * and maybe be in a while loop for optimization? So that it ends as
		 * soon as it finds the value?
		 */
		arrayOfData.forEach((item, index) => {
			if (item > 0 && timesign === undefined) {
				timesign = index / buffer.sampleRate;
			}
		});
		return timesign;
	}

	normalize(buffer) {
		let totalMax = 0;
		let buffersArray;
		console.log(buffer.numberOfChannels);
		if (buffer.numberOfChannels < 2) {
			buffersArray = [buffer.getChannelData(0)];
		} else if (buffer.numberOfChannels > 1) {
			buffersArray = buffer.toArray();
		}

		buffersArray.forEach((currentBuffer) => {
			let currentMax = currentBuffer.reduce(function (a, b) {
				return Math.max(a, b);
			}); // 4
			totalMax = totalMax > currentMax ? totalMax : currentMax;
		});

		//console.log("totalMax: ", totalMax);

		let normalizedBuffers = [];

		buffersArray.forEach((currentBuffer) => {
			let newBuffer = [];
			currentBuffer.forEach((element) => {
				newBuffer.push(element * (1 / totalMax));
			});
			let normalizedCurrentBuffer = Float32Array.from(newBuffer);
			normalizedBuffers.push(normalizedCurrentBuffer);
		});

		const finalBuffer = Tone.Buffer.fromArray(normalizedBuffers);
		//console.log(finalBuffer);
		return finalBuffer;
	}
}
