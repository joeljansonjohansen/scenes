import Module from "./newmodules/Module.js";
import RecorderModule from "./newmodules/RecorderModule.js";
import PlayerModule from "./newmodules/PlayerModule.js";
import GrainPlayerModule from "./newmodules/GrainPlayerModule.js";
import MetronomeModule from "./newmodules/MetronomeModule.js";

let mic;
let modules = [];
let playerModules = [];
// let currentBar = -1;
// let lengthOfBar = 0;
// let uifont;

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

	let passedTime = Tone.Transport.seconds * 1000;
	let index = 1;
	for (let module of modules) {
		let x = 40;
		let y = 4 * index;
		let w = 320;
		let h = 5;
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

	//How to connect things really?
	//let tremolo = new Tone.Tremolo(9, 1).start().toDestination();

	/* let metro = new MetronomeModule({
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

			modules.splice(modules.indexOf(recorderModule), 1);
		},
	});
	modules.push(recorderModule); */

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

	// let timingModule = new Module({
	// 	start: 0.1,
	// 	length: "2m",
	// 	onEnd: () => {
	// 		console.log("metro module finished");
	// 		modules.splice(modules.indexOf(timingModule), 1);
	// 	},
	// });
	// modules.push(timingModule);

	let playerModule = new PlayerModule({
		start: "5m",
		length: "40m",
		transpose: -7,
		offset: "8n",
		loopLength: "1m",
		loopFadeIn: 0.01,
		loopFadeOut: Tone.Transport.toSeconds("8n") - 0.2,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModule), 1);
		},
	});
	// playerModule.addTranspositionChange("2m", -12, "4m");
	// playerModule.prepareModule({
	// 	recordingURL: "./assets/ravel.mp3",
	// 	moduleReady: () => {
	// 		// const fShift = new Tone.PitchShift(-0.5).toDestination();
	// 		// playerModule.connect(fShift);
	// 		playerModule.connect(reverb);
	// 		console.log("Recorder module connected to other module");
	// 		modules.push(playerModule);
	// 	},
	// });

	let playerModuleTwo = new PlayerModule({
		start: "5m",
		length: "40m",
		transpose: -12,
		offset: "4n",
		loopLength: "2n.",
		loopFadeIn: 0.01,
		loopFadeOut: Tone.Transport.toSeconds("2n.") - 0.2,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModuleTwo), 1);
		},
	});
	// playerModuleTwo.addTranspositionChange("2m", -12, "4m");
	// playerModuleTwo.prepareModule({
	// 	recordingURL: "./assets/ravel.mp3",
	// 	moduleReady: () => {
	// 		// const fShift = new Tone.PitchShift(-0.5).toDestination();
	// 		// playerModuleTwo.connect(fShift);
	// 		playerModuleTwo.connect(reverb);
	// 		console.log("Recorder module connected to other module");
	// 		modules.push(playerModuleTwo);
	// 	},
	// });

	let recorderModule = new RecorderModule({
		title: "Recording",
		start: "1m",
		length: "3m",
		mic: mic,
		onEnd: () => {
			playerModule.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					// const fShift = new Tone.PitchShift(-0.5).toDestination();
					// playerModuleTwo.connect(fShift);
					playerModule.connect(reverb);
					console.log("Recorder module connected to other module");
					modules.push(playerModule);
				},
			});
			playerModuleTwo.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					// const fShift = new Tone.PitchShift(-0.5).toDestination();
					// playerModuleTwo.connect(fShift);
					playerModuleTwo.connect(reverb);
					console.log("Recorder module connected to other module");
					modules.push(playerModuleTwo);
				},
			});
			modules.splice(modules.indexOf(recorderModule), 1);
		},
	});
	modules.push(recorderModule);

	/* let playerModuleThree = new PlayerModule({
		start: "1:2",
		length: "10m",
		offset: "2n",
		transpose: 0,
		loopLength: "1:2",
		loopFadeIn: 0.01,
		loopFadeOut: Tone.Transport.toSeconds("0:1") - 0.2,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModuleThree), 1);
		},
	});
	// playerModuleThree.addTranspositionChange("2m", -12, "4m");
	playerModuleThree.prepareModule({
		recordingURL: "./assets/ravel.mp3",
		moduleReady: () => {
			// const fShift = new Tone.PitchShift(-0.5).toDestination();
			// playerModuleThree.connect(fShift);
			playerModuleThree.connect(reverb);
			console.log("Recorder module connected to other module");
			modules.push(playerModuleThree);
		},
	}); */
}

document
	.getElementById("getMicrophoneAccess")
	?.addEventListener("click", async () => {
		await Tone.start();
		console.log("audio is ready");
		mic = new Tone.UserMedia();
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
