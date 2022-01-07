import PlayerModule from "../src/js/modules/PlayerModule.js";
import ProcessingModule from "../src/js/modules/ProcessingModule.js";
import RecorderModule from "../src/js/modules/RecorderModule.js";
import Permissions from "../src/js/Permissions.js";
import setupDomEvents from "../src/js/DomInteraction.js";

import ravel from "./assets/ravel.mp3";
import p5 from "p5";
import * as Tone from "tone";

let modules = [];
let permissions = new Permissions("microphone", "gyroscope");

function setup() {
	createCanvas(400, 400);
	background(244);
	textFont("Helvetica");
	Tone.Transport.bpm.value = 120;
}

function draw() {
	// let density = map(mouseY, 0, windowHeight, 0.1, 3.2);
	// let detune = map(mouseX, 0, windowWidth, 700, -2400);
	// console.log(density);
	background(244);
	let tonePos = Tone.Transport.position.split(":");
	let string = parseInt(tonePos[0]) + ":" + (1 + parseInt(tonePos[1]));
	textSize(24);
	text(string, 40, height - 40);
	textSize(12);

	let passedTime = Tone.Transport.seconds;
	let index = 1;
	for (let module of modules) {
		//module.detune = detune;
		//module.density = density;
		let x = 40;
		let y = 4 * index;
		let w = 320;
		let h = 5;
		module.update(passedTime);
		module.draw(x, y, w, h);
		index++;
	}
}

function setupModules() {
	//Setup effects
	let reverb = new Tone.Reverb(5.5, 1.0).toDestination();

	/* let processingModule = new ProcessingModule({
		start: "1:0",
		length: "4m",
		fadeIn: "1m",
		fadeOut: "1m",
		input: permissions.mic,
		setup: () => {
			const filter = new Tone.Filter(5000, "lowpass");
			const ps = new Tone.PitchShift(-12);
			processingModule.processingUnits.push(filter);
			processingModule.processingUnits.push(ps);
		},
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(processingModule), 1);
		},
	});
	processingModule.channel.connect(reverb);
	modules.push(processingModule); */

	/* let playerModuleClick = new PlayerModule({
		start: "1:0",
		length: "25m",
		interval: "4n",
		regions: {
			length: "4n",
			fadeOut: "8n",
			sourceType: "osc",
		},
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModuleClick), 1);
		},
	});
	playerModuleClick.channel.connect(reverb);
	modules.push(playerModuleClick);
	playerModuleClick._lpbrSignal.rampTo(0.5, "1:0", "3:0");
	playerModuleClick._lpbrSignal.rampTo(1, "1:0", "6:0"); */

	let playerModuleThree = new PlayerModule({
		start: "1:0",
		length: "10m",
		interval: "4n",
		//density: 0.8,
		fadeOut: 0.1,
		decay: "3m",
		pitch: "C4",
		recordingURL: ravel,
		regions: {
			length: "1m",
			scattering: true,
			totalRandomization: false,
			fadeIn: "4n",
			// randomDetune: true,
		},
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModuleThree), 1);
		},
	});
	playerModuleThree.channel.connect(reverb);
	modules.push(playerModuleThree);

	/* let recorderModule = new RecorderModule({
		title: "Recording",
		start: "1m",
		length: "3m",
		input: permissions.mic,
		onEnd: () => {
			playerModuleThree.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					console.log("Recorder module connected to other module");
				},
			});

			modules.splice(modules.indexOf(recorderModule), 1);
		},
	});
	modules.push(recorderModule); */

	// let playerModule = new PlayerModule({
	// 	start: "1:0",
	// 	length: "5m",
	// 	interval: "random",
	// 	fadeOut: 1.1,
	// 	density: 0.3,
	// 	decay: "3m",
	// 	pitch: "C4",
	// 	detune: -1200,
	// 	// harmony: [
	// 	// 	[-2400, -3600, -1200, -500, -300, 0],
	// 	// 	[-2000, -3200, -800, -100, 100, 400],
	// 	// ],
	// 	// harmony: [[-1200], [-1600], [-1200], [-500], [-300]],
	// 	recordingURL: "../assets/dulcimer.mp3",
	// 	// recordingURL: "../assets/saxophone-c4.mp3",
	// 	// recordingURL: "../assets/ravel.mp3",
	// 	regions: {
	// 		length: "8n",
	// 		scattering: true,
	// 		sourceType: "noise",
	// 		totalRandomization: true,
	// 	},
	// 	onEnd: () => {
	// 		console.log("module finished");
	// 		modules.splice(modules.indexOf(playerModule), 1);
	// 	},
	// });
	// playerModule.channel.connect(reverb);
	// modules.push(playerModule);
}

document
	.getElementById("getMicrophoneAccess")
	?.addEventListener("click", async () => {
		await permissions.getPermissions();
	});

document.getElementById("startButton")?.addEventListener("click", () => {
	setupModules();
	Tone.Transport.start();
	// Tone.Transport.loop = true;
	// Tone.Transport.loopEnd = "4:0";
	// Tone.Transport.loopStart = "3:0";
	// let count = 0;
	// Tone.Transport.scheduleRepeat((time) => {
	// 	if (count > 4) {
	// 		Tone.Transport.loop = false;
	// 	}
	// 	count++;
	// }, "1m");
});

window.setup = setup;
window.draw = draw;
