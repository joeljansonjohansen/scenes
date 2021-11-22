import PlayerModule from "./PlayerModule.js";

/* 
    The GrainPlayerModule has all the same functionality as the 
    PlayerModule but when transposing the PlayerModule, the tempo 
    will be changed as well.
    */

export default class GrainPlayerModule extends PlayerModule {
	set transposeBy(interval) {
		this.transposed = interval;
		if (this._player) {
			this._player.detune = this.transposed * 100;
		}
	}

	prepareModule(options) {
		//Function for any preparations that cannot be done in the setup but should be done before start to save valuable time at the starting point.
		this._player = new Tone.GrainPlayer({
			loop: true,
			url: options.recordingURL,
			detune: this.transposed * 100,
			onload: () => {
				console.log("grain player loaded");
				options.moduleReady();
			},
			onstop: () => {
				console.log("grain player stopped");
			},
		}).toDestination();
	}
}
