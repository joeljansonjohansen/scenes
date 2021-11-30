import PlayerModule from "./PlayerModule.js";

/* 
    The GrainPlayerModule has all the same functionality as the 
    PlayerModule but when transposing the PlayerModule, the tempo 
    will be changed as well.
    */

export default class GrainPlayerModule extends PlayerModule {
	constructor(options) {
		super(options);
		this.title = options.title ?? "Grainplayer";
	}
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
			volume: -70,
			onload: () => {
				this._loop = new Tone.Loop((time) => {
					console.log(time);
					this._player.start(time, this.offset, this.loopLength + 0.05);
					this._player.volume.rampTo(0, 0.1, time);
					this._player.volume.rampTo(
						-Infinity,
						0.1,
						time + this.loopLength - 0.15
					);
				}, this.loopLength)
					.start(this.start)
					.stop(this.end);
				Tone.Transport.scheduleOnce((time) => {
					this._player.volume.rampTo(1, 0.1);
					console.log("module started: ", time);
				}, this.start);
				Tone.Transport.scheduleOnce((time) => {
					this._player.volume.rampTo(-70, 0.1);
					console.log("module end: ", time);
				}, this.end - 0.1);
				options.moduleReady();
			},
			onstop: () => {
				console.log("grain player stopped");
			},
		}).toDestination();
	}
}
