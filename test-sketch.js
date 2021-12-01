import Module from "./newmodules/Module.js";
import RecorderModule from "./newmodules/RecorderModule.js";
import PlayerModule from "./newmodules/PlayerModule.js";
import GrainPlayerModule from "./newmodules/GrainPlayerModule.js";
import MetronomeModule from "./newmodules/MetronomeModule.js";
import OneShotPlayerModule from "./newmodules/OneShotPlayerModule.js";

let mic;
let modules = [];

function setup() {
	createCanvas(400, 400);
	background(244);
	textFont("Helvetica");
	Tone.Transport.bpm.value = 96;
}

function draw() {
	let detune = map(mouseY, 0, windowHeight, 0, -1200);
	//console.log(density);
	background(244);
	let tonePos = Tone.Transport.position.split(":");
	let string = parseInt(tonePos[0]) + ":" + (1 + parseInt(tonePos[1]));
	textSize(24);
	text(string, 40, height - 40);
	textSize(12);

	let passedTime = Tone.Transport.seconds * 1000;
	let index = 1;
	for (let module of modules) {
		module.detune = detune;
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

	//How to connect things really?
	//let tremolo = new Tone.Tremolo(9, 1).start().toDestination();

	let playerModule = new OneShotPlayerModule({
		start: "5m",
		length: "54m",
		loopLength: "2n",
		loopFadeIn: "8n",
		loopFadeOut: "8n",
		density: 3.3,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModule), 1);
		},
	});
	/* playerModule.prepareModule({
		recordingURL: "./assets/ravel.mp3",
		//recordingURL: "./assets/saxophone-c4.mp3",
		moduleReady: () => {
			//playerModule.connect(reverb);
			console.log("Recorder module connected to other module");
			modules.push(playerModule);
		},
	}); */

	let playerModuleTwo = new OneShotPlayerModule({
		start: "5m",
		length: "54m",
		loopLength: 4,
		loopFadeIn: 0.1,
		loopFadeOut: 2.4,
		density: 2.3,
		volume: -10,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModuleTwo), 1);
		},
	});
	/* playerModuleTwo.prepareModule({
		//recordingURL: "./assets/ravel.mp3",
		recordingURL: "./assets/saxophone-c4.mp3",
		moduleReady: () => {
			//playerModule.connect(reverb);
			console.log("Recorder module connected to other module");
			modules.push(playerModuleTwo);
		},
	}); */

	// let playerModuleThree = new PlayerModule({
	// 	start: "5m",
	// 	length: "3m",
	// 	transpose: -12,
	// 	loopLength: "2n",
	// 	loopFadeIn: 0.05,
	// 	loopFadeOut: 0.5,
	// 	onEnd: () => {
	// 		console.log("module finished");
	// 		modules.splice(modules.indexOf(playerModuleThree), 1);
	// 	},
	// });
	// let playerModuleFour = new PlayerModule({
	// 	start: "8m",
	// 	length: "40m",
	// 	transpose: -19,
	// 	loopLength: "2n",
	// 	loopFadeIn: 0.05,
	// 	loopFadeOut: 0.5,
	// 	onEnd: () => {
	// 		console.log("module finished");
	// 		modules.splice(modules.indexOf(playerModuleFour), 1);
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
					//playerModule.connect(reverb);
					console.log("Recorder module connected to other module");
					modules.push(playerModule);
				},
			});
			playerModuleTwo.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					// const fShift = new Tone.PitchShift(-0.5).toDestination();
					// playerModuleTwo.connect(fShift);
					//playerModuleTwo.connect(reverb);
					console.log("Recorder module connected to other module");
					modules.push(playerModuleTwo);
				},
			});
			playerModuleThree.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					console.log("Recorder module connected to other module");
					playerModuleThree.connect(reverb);
					modules.push(playerModuleThree);
				},
			});
			playerModuleFour.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					console.log("Recorder module connected to other module");
					playerModuleFour.connect(reverb);
					modules.push(playerModuleFour);
				},
			});
			modules.splice(modules.indexOf(recorderModule), 1);
		},
	});
	modules.push(recorderModule);
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
