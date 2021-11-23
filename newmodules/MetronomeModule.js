import Module from "./Module.js";

/* 
    The MetronomeModule can be used as a timer or a metronome.
    * If set to "timer", it shows a progress from 0-1 to guide a musician more freely.
    * If set to "metro" (default) it uses the bpm and count to create as many counts wanted in the set bpm.
    */

export default class MetronomeModule extends Module {
	constructor(options) {
		//Calculate the length of the metro if we only get a bpm.
		let bpm = options.bpm ?? Tone.Transport.bpm.value;
		let count = options.count ?? 4;
		//This should be made clearer
		options.length =
			Tone.Transport.toSeconds(options.length) ??
			Tone.Transport.toSeconds("1m");
		super(options);

		this.count = count;
		this.bpm = bpm;
		this.mode = options.mode ?? "metro";
	}

	draw(x, y, w, h) {
		if (this.mode === "timer") {
			super.draw(x, y, w, h);
		} else {
			if (this._ended) {
				return;
			}
			if (this._started) {
				fill(204, 105, 205);
				noStroke();
				let r = 40;
				let actualWidth = w - r;
				let newX =
					(actualWidth / this.count) * floor(this.progress * this.count);
				ellipse(x + r / 2 + newX, y, r);
			}
		}
	}
}
