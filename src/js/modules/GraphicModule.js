import Module from "./Module.js";
import {
	backgroundColor,
	complementaryColor,
	secondComplementaryColor,
} from "../Globals.js";

/*
 * A module to test drawing things on the canvas timed to the transport.
 */

export default class GraphicModule extends Module {
	constructor(options) {
		super(options);
		this.getDefaults(options);
		console.log(this.title);
		console.log(this);
	}

	getDefaults(options) {
		Object.assign(
			this,
			{
				title: "GraphicModule",
				x: 0,
				y: 0,
				width: 320,
				height: 320,
				showsCircle: false,
				showsLine: false,
			},
			options
		);
	}

	draw() {
		if (this._ended) {
			return;
		}
		if (this._started) {
			//These variables should be moved out to a different class or singleton
			let bg = color(backgroundColor[0]);
			let comp = color(
				complementaryColor[0],
				complementaryColor[1],
				complementaryColor[2]
			);
			let secondComp = color(
				secondComplementaryColor[0],
				secondComplementaryColor[1],
				secondComplementaryColor[2]
			);

			fill(secondComp);

			if (this.showsCircle) {
				arc(
					this.centerX + this.width / 2,
					this.centerY + this.height / 2,
					200,
					200,
					0,
					radians(360 * this.progress),
					PIE
				);
			}
			if (this.showsLine) {
				rect(this.centerX, this.centerY, this.width * this.progress, 40);
			}

			textWrap(WORD);
			textAlign(CENTER, TOP);
			textSize(20);

			//How to import fonts globally in p5?
			//textFont(fontLato);
			//Maybe use p5.Font and "textBounds()" to see how much space a line of text will take.

			fill(comp);
			text(this.title.toUpperCase(), this.centerX, this.centerY, this.width);

			//Adding in a variable to this class that says "should show timer"
			//let r = 40;
		}
	}

	set x(val) {
		this._x = val;
	}
	get x() {
		return this._x;
	}
	set y(val) {
		this._y = val;
	}
	get y() {
		return this._y;
	}
	set width(val) {
		this._width = val;
	}
	get width() {
		return this._width;
	}
	set height(val) {
		this._height = val;
	}
	get height() {
		return this._height;
	}
	get centerX() {
		return windowWidth / 2 - this.width / 2;
	}
	get centerY() {
		return windowHeight / 2 - this.height / 2;
	}
}
