import css from "./css/main.scss";

import PlayerModule from "../src/js/modules/PlayerModule.js";
import Permissions from "../src/js/Permissions.js";
import { backgroundColor, complementaryColor } from "./js/Globals.js";

import wssax from "./assets/wssax.mp3";
import dulc from "./assets/dulcimer.mp3";

import font from "./assets/fonts/Forum-Regular.ttf";
import lato from "./assets/fonts/Lato-Regular.ttf";

import p5 from "p5";
import * as Tone from "tone";
import Mixer from "./js/Mixer.js";

let modules = [];
let permissions = new Permissions("microphone", "gyroscope");
const mixer = new Mixer();

let fontRegular;
var fontLato;
function preload() {
	fontRegular = loadFont(font);
	fontLato = loadFont(lato);
}

function setup() {
	let height = parseInt(document.documentElement.clientHeight);
	let width = parseInt(document.documentElement.clientWidth);
	document.body.style.width = width + "px";
	document.body.style.height = height + "px";

	let canvas = createCanvas(width, height);

	Tone.Transport.bpm.value = 120;
}

function windowResized() {
	let height = parseInt(document.documentElement.clientHeight);
	let width = parseInt(document.documentElement.clientWidth);

	document.body.style.width = width + "px";
	document.body.style.height = height + "px";

	// document.html.style.width = width + "px";
	// document.html.style.height = height + "px";
	resizeCanvas(width, height);
}

function drawMainGui() {
	let bg = color(backgroundColor[0]);
	let comp = color(
		complementaryColor[0],
		complementaryColor[1],
		complementaryColor[2]
	);

	background(bg);
	noFill();
	stroke(comp);
	rect(10, 10, windowWidth - 20, windowHeight - 20);
	noStroke();
	fill(comp);
	let tonePos = Tone.Transport.position.split(":");
	let string = parseInt(tonePos[0]) + ":" + (1 + parseInt(tonePos[1]));
	textSize(40);
	textAlign(RIGHT, TOP);
	textFont(fontRegular);
	//text(string, windowWidth - 60, 50);
	text(string, windowWidth - 120, 25, 100, 100);
	textAlign(LEFT, TOP);
	text("A", 30, 25, 100, 100);
	textSize(20);
	textAlign(CENTER, TOP);
	text("INFINITE LEISURE", 10, 38, windowWidth - 20, 100);

	textSize(12);
	textFont("Helvetica");
	textAlign(LEFT);
}

function draw() {
	drawMainGui();
	/* let value = mixer.meter.getValue();
	//text(value, 10, 138, windowWidth - 20, 100);
	if (mixer.meter.value < 0 && mixer.meter.value > -50) {
		mixer.limiterGain.gain.value = Math.abs(mixer.meter.getValue());
	} else {
		mixer.limiterGain.gain.value = 5;
	} */
	let passedTime = Tone.Transport.seconds;
	let index = 1;
	for (let module of modules) {
		//module.detune = detune;
		//module.density = density;
		module.update(passedTime);
		module.draw();
		index++;
	}
}

function setupModules() {
	console.log("buffers should load");

	let newPlayerModule = new PlayerModule({
		start: "2:0",
		length: "25m",
		interval: "random",
		density: 1.3,
		buffer: dulc,
		detune: [
			-1200, -1100, -1000, -900, -800, -700, -600, -500, -400, -300, -200, -100,
		],
		regions: {
			scattering: true,
		},
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModule), 1);
		},
	});
	console.log("playermodule", newPlayerModule);
	newPlayerModule.channel.connect(mixer.input);
	modules.push(newPlayerModule);
}

document
	.getElementById("getMicrophoneAccess")
	?.addEventListener("click", async () => {
		let infoHeader = document.getElementById("information-header");
		let infoBread = document.getElementById("information-bread");
		try {
			await permissions.getPermissions();
			infoHeader.innerHTML = "Permission Granted";
			infoBread.innerHTML =
				"Perfect — the piece can now begin. Once you push the start button below, you will have a 2 bar count in, 8 quarter notes and then you are in bar number one of the score.";
			document.getElementById("getMicrophoneAccess").style.display = "none";
			document.getElementById("startButton").style.display = "block";
		} catch (error) {
			infoHeader.innerHTML = "Permission Denied";
			infoBread.innerHTML =
				"Something went wrong. Did you press “Don't allow”? If so refresh the page and try again, this piece needs access to the microphone.<br /><br />Worst case scenario is that your device doesn't support what is needed for this piece. You can try with your computer or another device. You could also visit the link below to see more possible solutions.";
			console.log(error);
			document.getElementById("getMicrophoneAccess").style.display = "none";
			let startButton = document.getElementById("startButton");
			startButton.style.display = "block";
			startButton.innerText = "Refresh";
		}
	});

document.getElementById("startButton")?.addEventListener("click", (e) => {
	let canvas = document.getElementById("defaultCanvas0");
	let stopButton = document.getElementById("stopButton");
	canvas.style.display = "block";

	canvas.style.opacity = "1";
	stopButton.style.opacity = "1";
	document.getElementById("stopButton").style.display = "block";
	setupModules();
	Tone.Transport.start();
});

document.getElementById("stopButton")?.addEventListener("click", (e) => {
	if (Tone.Transport.state === "started") {
		Tone.Transport.stop();
		console.log(Tone.Transport.position);
		let masterOut = Tone.getDestination();
		masterOut.volume.value = -Infinity;
		e.target.innerText = "Refresh page to start over";
		e.target.style.width = "unset";
		e.target.style.minWidth = "unset";
		e.target.style.maxWidth = "unset";
		e.target.style.padding = "0px 30px";
		for (let module of modules) {
			console.log(module);
			//module.channel?.disconnect(reverb);
			module.implicitStop();
		}
	} else {
		//modules = [];
		/* console.log(modules);
		//setupModules();
		Tone.Transport.start();
		console.log(Tone.Transport.position);
		let masterOut = Tone.getDestination();
		masterOut.volume.value = 0;
		e.target.innerText = "Stop"; */
		location.reload();
	}
});

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.preload = preload;
