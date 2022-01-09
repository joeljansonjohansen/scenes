import Module from "./Module.js";

/*
 * A module to test drawing things on the canvas timed to the transport.
 */

export default class GraphicTestModule extends Module {
	draw(x, y, w, h) {
		if (this._ended) {
			return;
		}
		if (this._started) {
			y = windowHeight / 2 - 100;
			x = windowWidth / 2;
			fill(204, 105, 205);
			noStroke();
			text(this.title, x, y);
			y += 20;
			let r = 40;
			let actualWidth = w - r;
			//let newX = (actualWidth / 4) * floor(this.progress * 4);
			//ellipse(x + r / 2 + newX, y, r);
			arc(x, y, 80, 80, 0, radians(360 * this.progress), PIE);
		}
	}
}
