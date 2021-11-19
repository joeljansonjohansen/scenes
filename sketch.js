import Module from "./newmodules/Module.js";
import RecorderModule from "./newmodules/RecorderModule.js";
import PlayerModule from "./newmodules/PlayerModule.js";
import MetronomeModule from "./newmodules/MetronomeModule.js";

let mic;
let modules = [];
let startTime = Infinity;

function setup() {
	createCanvas(400, 400);
	background(244);
}

function draw() {
	background(244);
	let passedTime = Date.now() - startTime;
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
}

function setupScenes() {
	//Setup effects
	let reverb = new Tone.Reverb(4.5, 1.0).toDestination();

	let metro = new MetronomeModule({
		start: 0,
		bpm: 60,
		count: 4,
		onEnd: () => {
			console.log("metro module finished");
			modules.splice(modules.indexOf(metro), 1);
		},
	});
	modules.push(metro);

	let playerModule = new PlayerModule({
		start: metro.end + 11,
		length: 40,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModule), 1);
		},
	});
	modules.push(playerModule);

	let playerModulet = new PlayerModule({
		start: metro.end + 11,
		length: 40,
		transpose: 3,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModulet), 1);
		},
	});
	modules.push(playerModulet);

	let playerModulee = new PlayerModule({
		start: metro.end + 11,
		length: 40,
		transpose: 7,
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModulee), 1);
		},
	});
	modules.push(playerModulee);

	let recorderModule = new RecorderModule({
		start: metro.length,
		length: 10,
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

document.getElementById("getMicrophoneAccess")?.addEventListener("click", async () => {
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
	startTime = Date.now();
});

window.setup = setup;
window.draw = draw;
