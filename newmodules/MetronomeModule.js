import Module from "/newmodules/Module.js";

export default class MetronomeModule extends Module {
	constructor(options) {
		//Calculate the length of the metro if we only get a bpm.
		let bpm = options.bpm ?? 120;
		let count = options.count ?? 4;
		let bpmLength = (60 / bpm) * count;
		options.length = options.length ?? bpmLength;
		super(options);

		this.count = count;
		this.bpm = bpm;
		this.mode = options.mode ?? "metro";
		this.length = options.length ?? this._bpmLength ?? 0;

		// this.length =
	}

	draw(x, y, w, h) {
		if (this._ended) {
			return;
		}
		if (this._started) {
			fill(204, 105, 205);
			noStroke();
			let r = 40;
			let actualWidth = w - r;
			let newX = (actualWidth / this.count) * floor(this.progress * this.count);
			ellipse(x + r / 2 + newX, y, r);
		}
	}
}
