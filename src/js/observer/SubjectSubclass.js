const Subject = require("./subject");

export default class SubjectSubclass extends Subject {
	constructor(first, last) {
		super();
		this.start = first;
		this.state = first;
		this.end = last;
	}

	run() {
		for (this.state = this.start; this.state < this.end; this.state++) {
			this.notifyObservers({
				evntName: "new-index",
				value: this.state,
			});
		}
	}
}
