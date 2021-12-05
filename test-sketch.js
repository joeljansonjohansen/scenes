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
		//module.detune = detune;
		let x = 40;
		let y = 4 * index;
		let w = 320;
		let h = 5;
		module.update(passedTime);
		module.draw(x, y, w, h);
		index++;
	}
}

let players = [
	{ detune: 0, triggerLength: "1m", start: "10m", length: "8m" },
	//{ detune: -700, triggerLength: "8n", start: "2m", length: "8m" },
	{
		detune: -1200,
		offset: "1m",
		triggerLength: "4n",
		start: "10m",
		length: "8m",
	},
	{ detune: 0, randomize: true, offset: "1m", start: "2m", length: "28m" },
	{ detune: -700, randomize: true, offset: "1m", start: "2m", length: "8m" },
	{ detune: -400, randomize: true, offset: "1m", start: "10m", length: "8m" },
	{ detune: -700, triggerLength: "1m", start: "10m", length: "8m" },
	// { detune: -400, triggerLength: "8n", start: "10m", length: "8m" },
	{ detune: -400, triggerLength: "4n", start: "18m", length: "8m" },
	{ detune: -800, triggerLength: "8t", start: "24m", length: "8m" },
	{ detune: -1200, triggerLength: "1m", start: "28m", length: "8m" },
	{ detune: -700, triggerLength: "8n", start: "32m", length: "8m" },
	{ detune: -3600, triggerLength: "4n", start: "36m", length: "8m" },
	{ detune: 0, triggerLength: "8t", start: "40m", length: "8m" },
];
let actualPlayers = [];

function setupModules() {
	//Setup effects
	let reverb = new Tone.Reverb(5.5, 1.0).toDestination();

	//How to connect things really?
	// let tremolo = new Tone.Tremolo(9, 1).start().toDestination();

	for (let player of players) {
		let playerModule = new OneShotPlayerModule({
			start: player.start,
			length: player.length,
			loopLength: "1m",
			loopFadeIn: 0.01,
			loopFadeOut: 0.01,
			randomize: player.randomize,
			offset: player.offset ?? 0,
			density: 0.5,
			detune: player.detune,
			triggerLength: player.triggerLength,
			onEnd: () => {
				console.log("module finished");
				modules.splice(modules.indexOf(playerModule), 1);
			},
		});
		actualPlayers.push(playerModule);
	}

	/* playerModule.prepareModule({
		recordingURL: "./assets/ravel.mp3",
		//recordingURL: "./assets/saxophone-c4.mp3",
		moduleReady: () => {
			//playerModule.connect(reverb);
			console.log("Recorder module connected to other module");
			modules.push(playerModule);
		},
	}); */

	/* let playerModuleTwo = new OneShotPlayerModule({
		start: "25m",
		length: "20m",
		loopLength: "1m",
		// loopFadeIn: "2n",
		// loopFadeOut: "2n",
		//density: 0.3,
		// detune: -1600,
		measured: true,
		triggerLength: "1m",
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModuleTwo), 1);
		},
	}); */
	/* playerModuleTwo.prepareModule({
		// recordingURL: "./assets/ravel.mp3",
		recordingURL: "./assets/saxophone-c4.mp3",
		moduleReady: () => {
			//playerModule.connect(reverb);
			console.log("Recorder module connected to other module");
			modules.push(playerModuleTwo);
		},
	}); */

	let recorderModule = new RecorderModule({
		title: "Recording",
		start: "1m",
		length: "2m",
		mic: mic,
		onEnd: () => {
			for (let playerModule of actualPlayers) {
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
			}
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
