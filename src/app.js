import PlayerModule from "../src/js/modules/PlayerModule.js";
import RecorderModule from "../src/js/modules/RecorderModule.js";
import OnsetRecorderModule from "../src/js/modules/OnsetRecorderModule.js";
import GraphicModule from "../src/js/modules/GraphicModule.js";
import Permissions from "../src/js/Permissions.js";
import { backgroundColor, complementaryColor } from "./js/Globals.js";

import Syncronizer from "./js/Quasi-Sync.js";

import wssax from "./assets/wssax.mp3";
import ravel from "./assets/ravel.mp3";
import dulc from "./assets/dulcimer.mp3";
import saxc4 from "./assets/saxophone-c4.mp3";
import font from "./assets/fonts/Forum-Regular.ttf";
import lato from "./assets/fonts/Lato-Regular.ttf";

import p5 from "p5";
import * as Tone from "tone";
import Mixer from "./js/Mixer.js";
import { random } from "./js/sources/Source.js";
import AMGrainPlayer from "./js/tone-extensions/AMGrainPlayer.js";

let modules = [];
let permissions = new Permissions("microphone", "gyroscope");
let animationsOn = false;

let sync = new Syncronizer({ bpm: 114 });
const mixer = new Mixer();
//let recModule;

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

function getAllSupportedMimeTypes(...mediaTypes) {
	if (!mediaTypes.length) mediaTypes.push(...["video", "audio"]);
	const FILE_EXTENSIONS = ["webm", "ogg", "mp4", "x-matroska"];
	const CODECS = [
		"vp9",
		"vp9.0",
		"vp8",
		"vp8.0",
		"avc1",
		"av1",
		"h265",
		"h.265",
		"h264",
		"h.264",
		"opus",
	];

	return [
		...new Set(
			FILE_EXTENSIONS.flatMap((ext) =>
				CODECS.flatMap((codec) =>
					mediaTypes.flatMap((mediaType) => [
						`${mediaType}/${ext};codecs:${codec}`,
						`${mediaType}/${ext};codecs=${codec}`,
						`${mediaType}/${ext};codecs:${codec.toUpperCase()}`,
						`${mediaType}/${ext};codecs=${codec.toUpperCase()}`,
						`${mediaType}/${ext}`,
					])
				)
			)
		),
	].filter((variation) => MediaRecorder.isTypeSupported(variation));
}

let player;

function draw() {
	if (player) {
		let loopStart = constrain(
			map(mouseX, 0, 400, 0, player.buffer.duration),
			0,
			player.buffer.duration
		);
		if (reverse) {
			//loopStart = map(loopStart,0,player.buffer.duration,player.buffer.duration,0);
		}
		//player.reverse = reverse;
		//console.log(loopStart);
		player.loopStart = loopStart;
		player.loopEnd = constrain(loopStart + 0.02, 0, player.buffer.duration);
		//console.log("player.loopStart: ", player.loopStart)
		//console.log("player.loopEnd: ", player.loopEnd)
		player.detune = map(mouseY, 0, 400, -1200, 1200);
		//player.playbackRate = map(mouseY,0,400,0.01,2);
	}
	//console.log(mixer.limiter.red)

	drawMainGui();
	let allSupportedTypes = getAllSupportedMimeTypes("audio");
	//console.log(allSupportedTypes);
	//text("issupported:" + getAllSupportedMimeTypes("audio"), 50, 100, 200, 200);
	allSupportedTypes.forEach((element, i) => {
		text(element, 20, 100 + i * 10, windowWidth - 20, 100);
	});
	let value = mixer.meter.getValue();
	//text(value, 10, 138, windowWidth - 20, 100);
	if (mixer.meter.value < 0 && mixer.meter.value > -50) {
		mixer.limiterGain.gain.value = Math.abs(mixer.meter.getValue());
	} else {
		mixer.limiterGain.gain.value = 5;
	}
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
	const pianoSamples = new Tone.ToneAudioBuffers(
		{
			0: dulc,
			1: ravel,
			2: saxc4,
		},
		() => {
			console.log("buffers are loaded");
			let newPlayerModule = new PlayerModule({
				start: "2:0",
				length: "25m",
				interval: "random",
				density: 1.3,
				buffer: dulc,
				onEnd: () => {
					console.log("module finished");
					modules.splice(modules.indexOf(playerModule), 1);
				},
			});
			console.log("playermodule", newPlayerModule);
			newPlayerModule.channel.connect(mixer.input);
			modules.push(newPlayerModule);
		}
	);
}

function createPlayer(start = "1m", detune, length = "50m", slicedBuffer) {
	console.log("what is buffer here?", slicedBuffer);
	let playerModule = new PlayerModule({
		start: start,
		length: length,
		interval: "random",
		density: 0.3,
		fadeOut: "3m",
		decay: "3m",
		//pitch: "C4",
		//recordingURL: slicedBuffer,
		regions: {
			length: "16m",
			scattering: true,
			randomReversing: false,
			randomDelay: false,
			fadeIn: "2m",
			fadeOut: "2m",
			detune: detune,
			//sourceType: "grainPlayer",
			sourceType: "player",
			randomDetune: true,
		},
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModule), 1);
		},
	});
	playerModule.recordingURL = slicedBuffer;
	playerModule.channel.connect(mixer.input);
	modules.push(playerModule);
}

function createPlayerForCluster(detune, start, density = 0.2) {
	let playerModule = new PlayerModule({
		start: start,
		length: "50m",
		interval: "random",
		density: density,
		fadeOut: 0.1,
		decay: "3m",
		//pitch: "C4",
		//recordingURL: ravel,
		regions: {
			length: "8m",
			scattering: true,
			randomReversing: true,
			fadeIn: "8n",
			fadeOut: "2m",
			detune: detune,
			sourceType: "grainPlayer",
			//sourceType: "player",
			// randomDetune: true,
		},
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModule), 1);
		},
	});
	return playerModule;
}

function createClusterTest() {
	let octavePlayerModule = createPlayerForCluster(-1200, "20:0", 0.5);
	let seventhPlayerModule = createPlayerForCluster(-1000, "22:2", 0.4);
	//let minorSixthPlayerModule = createPlayerForCluster(-800, "20:2");
	let majorSixthPlayerModule = createPlayerForCluster(-900, "21:2");
	let fifthPlayerModule = createPlayerForCluster(-700, "21:0");
	let fourthPlayerModule = createPlayerForCluster(-500, "20:1");
	let thirdPlayerModule = createPlayerForCluster(-300, "20:0");
	let secondPlayerModule = createPlayerForCluster(-100, "20:1");

	let players = [];
	players.push(octavePlayerModule);
	players.push(seventhPlayerModule);
	players.push(majorSixthPlayerModule);
	players.push(fifthPlayerModule);
	players.push(fourthPlayerModule);
	players.push(thirdPlayerModule);
	players.push(secondPlayerModule);

	for (const player of players) {
		player.channel.connect(mixer.input);
		modules.push(player);
	}
	console.log(modules);

	let recorderModule = new RecorderModule({
		title: "Recording",
		start: "2m",
		length: "16m",
		input: permissions.mic,
		onEnd: () => {
			console.log("recorderModule ended");
			for (const player of players) {
				player.prepareModule({
					recordingURL: recorderModule.recordingURL,
					moduleReady: () => {
						console.log("Recorder module connected to other module");
					},
				});
			}
			modules.splice(modules.indexOf(recorderModule), 1);
		},
	});
	console.log(recorderModule);
	modules.push(recorderModule);
	//reverb.toDestination();
	//reverb.connect(filter);
}

function createPlayerForAltissimo(detune, start) {
	let playerModule = new PlayerModule({
		start: start,
		length: "64m",
		interval: "16m",
		fadeOut: 0.1,
		decay: "3m",
		//pitch: "C4",
		//recordingURL: ravel,
		regions: {
			length: "16m",
			fadeIn: "16n",
			fadeOut: "1m",
			detune: detune,
			sourceType: "grainPlayer",
			//sourceType: "player",
			// randomDetune: true,
		},
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModule), 1);
		},
	});
	return playerModule;
}

function createAltissimoTest() {
	let octavePlayerModule = createPlayerForAltissimo(-1200, "20:0");
	//let vbPlayerModule = createPlayerForAltissimo(-2400, "20:0");

	let players = [];
	players.push(octavePlayerModule);
	//players.push(vbPlayerModule);

	for (const player of players) {
		player.channel.connect(mixer.input);
		modules.push(player);
	}
	console.log(modules);

	let recorderModule = new RecorderModule({
		title: "Recording",
		start: "2m",
		length: "16m",
		input: permissions.mic,
		onEnd: () => {
			console.log("recorderModule ended");
			for (const player of players) {
				player.prepareModule({
					recordingURL: recorderModule.recordingURL,
					moduleReady: () => {
						console.log("Recorder module connected to other module");
					},
				});
			}
			modules.splice(modules.indexOf(recorderModule), 1);
		},
	});
	console.log(recorderModule);
	modules.push(recorderModule);
	//reverb.connect(filter);
	//reverb.toDestination();
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
			document.getElementById("stopButton").style.display = "block";
			setupModules();
			setTimeout(() => {
				Tone.Transport.start();
			}, 2500);
		}, 1500);
	} else {
		canvas.style.opacity = "1";
		stopButton.style.opacity = "1";
		document.getElementById("stopButton").style.display = "block";
		setupModules();
		Tone.Transport.start();
	}

	/* Tone.Transport.loop = true;
	Tone.Transport.loopEnd = "23:0";
	Tone.Transport.loopStart = "1:0"; */
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
