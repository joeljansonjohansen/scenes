export function grainPlayer(options) {
	let source = new Tone.GrainPlayer({
		loop: false,
		url: options.buffer,
		volume: options.volume,
		detune: options.detune,
		//playbackRate: map(this.detune, -2400, 0, 0.25, 1),
		onstop: () => {
			source.dispose();
			options.onstop();
		},
	});
	return source;
}

export function player(options) {
	let source = new Tone.Player({
		loop: false,
		url: options.buffer,
		volume: options.volume,
		// detune: detune,
		// playbackrate: map(this.detune, -2400, 0, 0.25, 1),
		playbackRate: 0.5,
		onstop: () => {
			source.dispose();
			options.onstop();
		},
	});
	return source;
}

export function osc(options) {
	console.log("osc");
	let source = new Tone.Oscillator({
		frequency: 100 + Math.random() * 100,
		type: "sine",
		volume: -30 + options.volume,
		onstop: () => {
			source.dispose();
			options.onstop();
		},
	});
	return source;
}

export function noise(options) {
	console.log("noise");
	let source = new Tone.Noise({
		frequency: 100 + Math.random() * 100,
		type: "pink",
		volume: -30 + options.volume,
		onstop: () => {
			source.dispose();
			options.onstop();
		},
	});
	return source;
}
