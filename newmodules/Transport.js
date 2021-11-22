export default class Transport {
	constructor(options) {
		this.bpm = options.bpm ?? 120;
		this.timeSignature = options.timeSignature ?? "4/4";
	}
}
