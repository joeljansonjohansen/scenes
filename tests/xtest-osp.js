import OSPlayerModule from "../js/modules/OSPlayerModule.js";

let mic;
let modules = [];

function setup() {
	createCanvas(400, 400);
	background(244);
	textFont("Helvetica");
	Tone.Transport.bpm.value = 116;
}

function draw() {
	//let density = map(mouseY, 0, windowHeight, 0.5, 3.2);
	let detune = map(mouseX, 0, windowWidth, 700, -2400);
	// console.log(density);
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

	let playerModuleThree = new OSPlayerModule({
		start: "1:0",
		length: "15m",
		interval: "1m",
		fadeOut: 1.1,
		decay: "3m",
		// harmony: [
		// 	[-2400, -3600, -1200, -500, -300, 0],
		// 	[-2000, -3200, -800, -100, 100, 400],
		// ],
		harmony: [[-1200], [-1600], [-1200], [-500], [-300]],
		// recordingURL: "../assets/dulcimer.mp3",
		// recordingURL: "../assets/saxophone-c4.mp3",
		recordingURL: "../assets/ravel.mp3",
		regions: {
			length: "1m",
			fadeIn: 0.1,
			fadeOut: 0.1,
			offset: "random",
			totalRandomization: true,
			//randomDetune: false,
		},
		onEnd: () => {
			console.log("module finished");
			modules.splice(modules.indexOf(playerModuleThree), 1);
		},
	});
	playerModuleThree.channel.connect(reverb);
	modules.push(playerModuleThree);
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
