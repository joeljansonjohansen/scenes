export function getSource(options) {
	switch (options.sourceType) {
		case "osc":
			return osc(options);
		case "grainPlayer":
			return grainPlayer(options);
		case "player":
			return player(options);
		case "noise":
			return noise(options);
		case "random":
			return random(options);
		default:
			return osc(options);
	}
}

export function random(options) {
	let array = [grainPlayer, player, osc, noise];
	return array[floor(Math.random() * array.length)](options);
}

export function grainPlayer(options) {
	let source = new Tone.GrainPlayer({
		loop: false,
		url: options.buffer,
		volume: options.volume,
		detune: options.detune,
		onstop: () => {
			options.onstop();
			source.dispose();
		},
	});
	return source;
}

export function player(options) {
	let source = new Tone.Player({
		loop: false,
		url: options.buffer,
		volume: options.volume,
		playbackRate: Tone.intervalToFrequencyRatio(options.detune / 100),
		onstop: () => {
			options.onstop();
			source.dispose();
		},
	});
	return source;
}

export function osc(options) {
	let source = new Tone.Oscillator({
		frequency: options.pitch,
		detune: options.detune,
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
