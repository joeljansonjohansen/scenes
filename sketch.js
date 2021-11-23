import Module from "./newmodules/Module.js";
import RecorderModule from "./newmodules/RecorderModule.js";
import PlayerModule from "./newmodules/PlayerModule.js";
import GrainPlayerModule from "./newmodules/GrainPlayerModule.js";
import MetronomeModule from "./newmodules/MetronomeModule.js";

let mic;
let modules = [];
let playerModules = [];
let startTime = Infinity;
let currentBar = -1;
let lengthOfBar = 0;
let uifont;

function preload() {
	//uifont = loadFont("./assets/inconsolata.otf");
}

function setup() {
	createCanvas(400, 400);
	background(244);
	textFont("Helvetica");
	Tone.Transport.bpm.value = 96;
}

function draw() {
	background(244);
	let tonePos = Tone.Transport.position.split(":");
	let string = parseInt(tonePos[0]) + ":" + (1 + parseInt(tonePos[1]));
	textSize(24);
	text(string, 40, height - 40);
	textSize(12);
	//text(Tone.Transport.position, 140, 140);
	//let passedTime = Date.now() - startTime;
	let passedTime = Tone.Transport.seconds * 1000;
	let index = 1;
	for (let module of modules) {
		let x = 40;
		let y = 40 * index;
		let w = 320;
		let h = 20;
		module.update(passedTime);
		module.draw(x, y, w, h);
		index++;
	}
	//console.log("passedTime = ", passedTime / 1000);
	//console.log("Tone.Transport.timeSignature = ", Tone.Transport.position);
	//console.log(currentBar);
	// if (passedTime > lengthOfBar) {
	// 	lengthOfBar =
	// 		passedTime +
	// 		(60 / Tone.Transport.bpm.value) * Tone.Transport.timeSignature * 1000;
	// 	console.log(currentBar);
	// 	currentBar++;
	// 	//console.log("Tone.Transport.position = ", Tone.Transport.position);
	// }
}

let playerEvents = [
	{ start: "6:2", length: "1:2", transpose: -19 },
	{ start: "11:0", length: "2:0", transpose: -19 },
	{ start: "16:0", length: "2:0", transpose: -19 },
	{ start: "16:3", length: "1:1", transpose: -13 },
	{ start: "19:0", length: "3:0", transpose: 0 },
	{ start: "20:2", length: "1:2", transpose: -19 },
	{ start: "20:2", length: "0:3", transpose: -24 },
	{ start: "21:1", length: "0:3", transpose: -18 },
	{ start: "21:1", length: "0:3", transpose: -26 },
	{ start: "24:0", length: "2:0", transpose: -18 },
	{ start: "24:0", length: "2:0", transpose: -19 },
	{ start: "24:0", length: "0:3", transpose: -26 },
	{ start: "24:3", length: "1:1", transpose: -27 },
	{ start: "27:0", length: "3:0", transpose: 0 },
	{ start: "27:0", length: "3:0", transpose: -2 },
	{ start: "27:0", length: "3:0", transpose: -7 },
	{ start: "27:0", length: "3:0", transpose: -10 },
	//Next
	{ start: "31:0", length: "3:0", transpose: 0 },
	{ start: "31:0", length: "3:0", transpose: -2 },
	{ start: "31:0", length: "3:0", transpose: -7 },
	{ start: "31:0", length: "3:0", transpose: -10 },
	{ start: "35:0", length: "8:0", transpose: -24, loopLength: "4n" },
	{ start: "35:0", length: "8:0", transpose: -15, loopLength: "4n" },
];

function setupModules() {
	//Setup effects
	let reverb = new Tone.Reverb(5.5, 1.0).toDestination();

	let metro = new MetronomeModule({
		title: "Counting in",
		start: 0.1,
		length: "1m",
		onEnd: () => {
			console.log("metro module finished");
			modules.splice(modules.indexOf(metro), 1);
		},
	});
	modules.push(metro);

	for (let event of playerEvents) {
		let playerModule = new GrainPlayerModule({
			start: event.start,
			length: event.length,
			transpose: event.transpose,
			loopLength: event.loopLength,
			onEnd: () => {
				console.log("module finished");
				modules.splice(modules.indexOf(playerModule), 1);
			},
		});
		modules.push(playerModule);
		playerModules.push(playerModule);
	}

	// let playerModule = new GrainPlayerModule({
	// 	start: "6:2",
	// 	length: "1:2",
	// 	transpose: -19,
	// 	onEnd: () => {
	// 		console.log("module finished");
	// 		modules.splice(modules.indexOf(playerModule), 1);
	// 	},
	// });
	// //playerModule.addTranspositionChange(0.2, -7);
	// //playerModule.addTranspositionChange(0.4, 0);
	// modules.push(playerModule);

	// let playerModulet = new GrainPlayerModule({
	// 	start: "6:3",
	// 	length: "1:1",
	// 	transpose: -13,
	// 	onEnd: () => {
	// 		console.log("module finished");
	// 		modules.splice(modules.indexOf(playerModulet), 1);
	// 	},
	// });
	// playerModulet.addTranspositionChange(0.2, -3);
	// playerModulet.addTranspositionChange(0.4, 3);
	//modules.push(playerModulet);

	// let playerModulee = new GrainPlayerModule({
	// 	start: metro.end + 5,
	// 	length: 40,
	// 	transpose: 7,
	// 	onEnd: () => {
	// 		console.log("module finished");
	// 		modules.splice(modules.indexOf(playerModulee), 1);
	// 	},
	// });
	// modules.push(playerModulee);

	let recorderModule = new RecorderModule({
		title: "Recording",
		start: metro.end,
		length: "3m",
		mic: mic,
		onEnd: () => {
			for (let playerModule of playerModules) {
				playerModule.prepareModule({
					recordingURL: recorderModule.recordingURL,
					moduleReady: () => {
						playerModule.connect(reverb);
						console.log("Recorder module connected to other module");
					},
				});
			}

			// console.log("module finished");
			// playerModule.prepareModule({
			// 	recordingURL: recorderModule.recordingURL,
			// 	moduleReady: () => {
			// 		playerModule.connect(reverb);
			// 		console.log("this is run");
			// 	},
			// });
			// playerModulet.prepareModule({
			// 	recordingURL: recorderModule.recordingURL,
			// 	moduleReady: () => {
			// 		playerModulet.connect(reverb);
			// 		console.log("this is run");
			// 	},
			// });
			// playerModulee.prepareModule({
			// 	recordingURL: recorderModule.recordingURL,
			// 	moduleReady: () => {
			// 		playerModulee.connect(reverb);
			// 		console.log("this is run");
			// 	},
			// });
			// playerModuleTwo.prepareModule({ recordingURL: recorderModule.recordingURL });
			modules.splice(modules.indexOf(recorderModule), 1);
		},
	});
	modules.push(recorderModule);

	// let playerModuleThree = new PlayerModule({
	// 	start: 5000,
	// 	length: 2000,
	// 	audiofile: "recording-1",
	// 	recordings: recordings,
	// 	playbackRate: 0.84,
	// 	onEnd: () => {
	// 		console.log("module finished");
	// 		modules.splice(modules.indexOf(playerModuleThree), 1);
	// 	},
	// });
	// modules.push(playerModuleThree);

	/*

    Parent:
    Title
    Start
    Length

    needs to be able to show progress
    callback on finished
    callback on started



    Metro / timer module:
    bpm optional
    beats 

    Recorder module:
    filename

    Player module:
    playbackrate
    filename
    loop

    Synthplayingmodule:
    Needs to be written from scratch
    Start
    Length



    */
}

document
	.getElementById("getMicrophoneAccess")
	?.addEventListener("click", async () => {
		await Tone.start();
		console.log("audio is ready");
		mic = new Tone.UserMedia(-10);
		mic
			.open()
			.then(() => {
				console.log("got microphone access");
			})
			.catch((e) => {
				// promise is rejected when the user doesn't have or allow mic access
				console.log("mic not open");
			});
	});

document.getElementById("startButton")?.addEventListener("click", () => {
	setupModules();
	Tone.Transport.start();
});

window.setup = setup;
window.draw = draw;
