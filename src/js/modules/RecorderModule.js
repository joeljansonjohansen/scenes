import * as Tone from "tone";
import Module from "./Module.js";

export default class RecorderModule extends Module {
	constructor(options) {
		super(options);

		console.log(
			"Recordermodule is deprecated, use OnsetRecorderModule instead"
		);

		this.pre = 0.5;
		this.after = 0.5;
		this.sliceOffset = 0.3;
		this.calculatedSliceOffset = this.pre - this.sliceOffset;

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
			this.input = options.input;
			this.input.connect(this.recorder);
			Tone.Transport.scheduleOnce((time) => {
				this.recorder.start();
				super.startModule();
				console.log("Recording started");
			}, this.start - this.pre);

			Tone.Transport.scheduleOnce(async (time) => {
				const recording = await this.recorder.stop();
				this.recordingURL = URL.createObjectURL(recording);
				this.originalBuffer = new Tone.ToneAudioBuffer({
					url: this.recordingURL,
					onload: () => {
						this.slicedBuffer = this.originalBuffer.slice(
							this.calculatedSliceOffset,
							this.length + this.after + this.calculatedSliceOffset
						);
						console.log("Recording ended");
						super.stopModule();
					},
				});
			}, this.end + this.after);
		}
	}
}
