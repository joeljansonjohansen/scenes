import PlayerModule from "./PlayerModule.js";

/* 
    The GrainPlayerModule has all the same functionality as the 
    PlayerModule but when transposing the PlayerModule, the tempo 
    will be changed as well.
    */

export default class GrainPlayerModule extends PlayerModule {
	set transposeBy(interval) {
		this.transpose = interval;
		if (this._player) {
			this._player.detune = this.transpose * 100;
		}
	}

	prepareModule(options) {
		//Function for any preparations that cannot be done in the setup but should be done before start to save valuable time at the starting point.
		this._player = new Tone.GrainPlayer({
			loop: true,
			url: options.recordingURL,
			detune: this.transpose * 100,
			onload: () => {
				this._loop = new Tone.Loop((time) => {
					console.log(time);
					this._player.start(time, 0, this.loopLength + 0.05);
				}, this.loopLength)
					.start(this.start)
					.stop(this.end);
				options.moduleReady();
			},
			onstop: () => {
				console.log("grain player stopped");
			},
		}).toDestination();
	}
}
