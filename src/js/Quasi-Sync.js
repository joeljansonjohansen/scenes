export default class Syncronizer {
	constructor(options) {
		this.bpm = options.bpm;
		this.beat = Math.round(60000 / this.bpm);
		this.fire = 0;
		this.count = 0;
		this.measure = 0;
		this.currentBar = 0;
		this.play = 0;
		this.gate = options.gate ?? 4;
	}

	update() {
		let now = new Date(),
			then = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				0,
				0,
				0
			),
			diff = now.getTime() - then.getTime(),
			time = Math.round(diff / this.beat),
			mark = time / 4,
			one = mark / 4;

		this.currentBar = mark;

		//console.log("currentBar", this.currentBar);

		// Start on the one
		if (one % 1 == 0) {
			this.play = 1;
		}
		//console.log("One:", one);
		//console.log("Mark:", mark);

		if (this.fire < time && this.play === 1) {
			if (mark % 1 == 0) {
				console.log("This happens every measure", this.measure);
				this.count = 1;
				//if (this.measure !== 0) {
				this.measure++;
				//}
				if (this.measure >= this.gate) {
					this.onNextBeat();
				}
			} else {
				this.count++;
			}
			// if (one % 1 == 0) {
			// 	this.measure = 1;
			// }
		}
		this.fire = time;
	}

	onNextBeat() {
		console.log("On next beat");
	}
}

// function draw() {
// 	clear();
// 	jam();
// 	//console.log(currentBar % 25 * 10);
// 	background(
// 		(currentBar % 15) * 10,
// 		(currentBar % 20) * 10,
// 		(currentBar % 25) * 10
// 	);
// 	textSize(26);
// 	text(measure + " " + count, 50, 50);
// 	text(currentBar, 50, 150);
// }
