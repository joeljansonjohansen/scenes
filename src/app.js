import PlayerModule from "../src/js/modules/PlayerModule.js";
import ProcessingModule from "../src/js/modules/ProcessingModule.js";
import RecorderModule from "../src/js/modules/RecorderModule.js";
import Permissions from "../src/js/Permissions.js";
import setupDomEvents from "../src/js/DomInteraction.js";
import GraphicTestModule from "./js/modules/GraphicTestModule.js";

import ravel from "./assets/saxophone-c4.mp3";
import font from "./assets/fonts/Forum-Regular.ttf";
import p5 from "p5";
import * as Tone from "tone";

let modules = [];
let permissions = new Permissions("microphone", "gyroscope");
let animationsOn = false;

let reverb;

let fontRegular;
function preload() {
	fontRegular = loadFont(font);
}

function setup() {
	let canvas = createCanvas(windowWidth, windowHeight);
	//canvas.parent("main");
	//background(244);
	Tone.Transport.bpm.value = 114;
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw() {
	// let density = map(mouseY, 0, windowHeight, 0.1, 3.2);
	// let detune = map(mouseX, 0, windowWidth, 700, -2400);
	// console.log(density);
	let bg = color(229);
	let comp = color(255, 109, 109);
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
	let passedTime = Tone.Transport.seconds;
	let index = 1;
	for (let module of modules) {
		//module.detune = detune;
		//module.density = density;
		let x = 40;
		let y = windowHeight / 2 + 4 * index;
		let w = windowWidth - 80;
		let h = 5;
		module.update(passedTime);
		module.draw(x, y, w, h);
		index++;
	}
}

function setupModules() {
	//Setup effects
	reverb = new Tone.Reverb(5.5, 1.0).toDestination();

	let gtm = new GraphicTestModule({
		start: "1:0",
		length: "2m",
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(gtm), 1);
		},
	});
	modules.push(gtm);

	let gtm2 = new GraphicTestModule({
		start: "3:0",
		length: "5m",
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(gtm2), 1);
		},
	});
	modules.push(gtm2);

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

	if (animationsOn) {
		let mainTitle = document.getElementById("main-title");
		let info = document.getElementById("info");
		let instrument = document.getElementById("instrument");
		let written = document.getElementById("written");
		let informationHolder = document.getElementById("information-holder");

		mainTitle.style.transform = "translateY(-600px)";
		info.style.transform = "translateY(-500px)";
		instrument.style.transform = "translateY(-400px)";
		written.style.transform = "translateY(-300px)";
		informationHolder.style.opacity = "0";

		e.target.style.width = "45px";
		e.target.style.maxWidth = "45px";
		e.target.style.minWidth = "45px";
		e.target.style.color = "rgba(255, 109, 109, 0)";
		e.target.style.opacity = "0";

		setTimeout(() => {
			console.log("Animation finished");
			canvas.style.opacity = "1";
			stopButton.style.opacity = "1";
			setupModules();
			setTimeout(() => {
				Tone.Transport.start();
			}, 2500);
		}, 1500);
	} else {
		canvas.style.opacity = "1";
		stopButton.style.opacity = "1";
		setupModules();
		Tone.Transport.start();
	}

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
