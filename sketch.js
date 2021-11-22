import Module from "./newmodules/Module.js";
import Transport from "./newmodules/Transport.js";
import RecorderModule from "./newmodules/RecorderModule.js";
import PlayerModule from "./newmodules/PlayerModule.js";
import GrainPlayerModule from "./newmodules/GrainPlayerModule.js";
import MetronomeModule from "./newmodules/MetronomeModule.js";

let mic;
let modules = [];
let startTime = Infinity;
let currentBar = -1;
let lengthOfBar = 0;

function setup() {
	createCanvas(400, 400);
	background(244);
}

function draw() {
	background(244);
	text(currentBar, 140, 140);
	//let passedTime = Date.now() - startTime;
	let passedTime = Tone.Transport.seconds * 1000;
	let index = 1;
	for (let module of modules) {
		let x = 0;
		let y = 20 * index;
		let w = 400;
		let h = 20;
		module.update(passedTime);
		module.draw(x, y, w, h);
		index++;
	}
	//console.log("passedTime = ", passedTime / 1000);
	//console.log("Tone.Transport.timeSignature = ", Tone.Transport.position);
	//console.log(currentBar);
	if (passedTime > lengthOfBar) {
		lengthOfBar =
			passedTime +
			(60 / Tone.Transport.bpm.value) * Tone.Transport.timeSignature * 1000;
		console.log(currentBar);
		currentBar++;
		//console.log("Tone.Transport.position = ", Tone.Transport.position);
	}
}

function setupScenes() {
	//Setup effects
	let reverb = new Tone.Reverb(4.5, 1.0).toDestination();

	let metro = new MetronomeModule({
		start: 0,
		bpm: 60,
		count: 2,
		onEnd: () => {
			console.log("metro module finished");
			modules.splice(modules.indexOf(metro), 1);
		},
	});
	modules.push(metro);

	let playerModule = new GrainPlayerModule({
		start: metro.end + 5,
		length: 40,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModule), 1);
		},
	});
	playerModule.addTranspositionChange(0.2, -7);
	playerModule.addTranspositionChange(0.4, 0);
	modules.push(playerModule);

	let playerModulet = new GrainPlayerModule({
		start: metro.end + 5,
		length: 40,
		transpose: 3,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModulet), 1);
		},
	});
	playerModulet.addTranspositionChange(0.2, -3);
	playerModulet.addTranspositionChange(0.4, 3);
	modules.push(playerModulet);

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
		start: metro.length,
		length: 4,
		mic: mic,
		onEnd: () => {
			console.log("module finished");
			playerModule.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					playerModule.connect(reverb);
					console.log("this is run");
				},
			});
			playerModulet.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					playerModulet.connect(reverb);
					console.log("this is run");
				},
			});
			playerModulee.prepareModule({
				recordingURL: recorderModule.recordingURL,
				moduleReady: () => {
					playerModulee.connect(reverb);
					console.log("this is run");
				},
			});
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
	setupScenes();
	//let Transport = new Transport();
	Tone.Transport.start();
	startTime = Date.now();
});

window.setup = setup;
window.draw = draw;
