import PlayerModule from "./PlayerModule.js";

/*
 * The OneShotPlayerModule has the same functionality as the
 * PlayerModule but instead of looping, this creates a new player
 * everytime it is called and has no "metric" (unless you want it to).
 *
 * Another big difference is that this will have the possibility to
 * randomize a lot of parameters, and also update them as the module
 * progresses. This means that a lot of functionality differs from
 * the playermodule.
 *
 * Currently it randomizes panning and lowpass filtering. These are
 * good because they sound good, but there is really no reason we
 * cant add delays and reverbs and other things on the fly.
 * It's important though to dispose all the instances when the player is finished.
 *
 */

export default class OneShotPlayerModule extends PlayerModule {
	constructor(options) {
		super(options);
		this.title = options.title ?? "OneShotPlayer";
		this.buffer = undefined;
		this.density = options.density ?? 1;
		if (this.density < 0.5) {
			console.warn(
				"Values below 0.5 are quite demanding. Be aware of clicks and pops."
			);
		}
		this.detune = 0;
		this.reverb = new Tone.Reverb(5.5, 1.0).toDestination();
	}

	prepareModule(options) {
		//Function for any preparations that cannot be done in the setup but should be done before start to save valuable time at the starting point.
		this.buffer = new Tone.ToneAudioBuffer({
			url: options.recordingURL,
			onload: () => {
				options.moduleReady();
				this.scheduleEvent(this.start);
			},
			onerror: (error) => {
				console.log("Buffer error: ", error);
			},
		});
	}

	scheduleEvent(eventTime) {
		Tone.Transport.scheduleOnce((time) => {
			//console.log("Event was fired!", time);
			//console.log("Density is", this.density);
			let panRange = 2;
			let initialPan = -1 + Math.random() * 2;
			let panDest =
				initialPan < 0
					? initialPan + Math.random() * panRange
					: initialPan - Math.random() * panRange;
			panDest = panDest < -1 ? -1 : panDest;
			panDest = panDest > 1 ? 1 : panDest;
			//console.log(panDest);
			const panner = new Tone.Panner(initialPan).toDestination();
			const filter = new Tone.Filter(500 + Math.random() * 21500, "lowpass");

			let player = new Tone.GrainPlayer({
				loop: false,
				url: this.buffer,
				volume: -Infinity,
				//playbackRate: Math.random(),
				//detune: this.detune + -50 + Math.random() * 50,
				detune: -700 + -15 + Math.random() * 15,
				onstop: () => {
					//console.log("ended");
					player.dispose();
					panner.dispose();
					filter.dispose();
				},
			})
				.chain(filter, panner, this.reverb)
				.start(time, Math.random() * this.buffer.duration - 0.5)
				.stop(time + this.loopLength);
			player.volume.rampTo(this.volume, this.loopFadeIn, time);
			player.volume.rampTo(
				-Infinity,
				this.loopFadeOut,
				time + this.loopLength - (this.loopFadeOut + 0.05)
			);
			panner.pan.rampTo(panDest, this.loopLength, time);
		}, eventTime);
		let nextTime = eventTime + Math.random() * (2 * this.density);
		//console.log(nextTime);
		if (nextTime < this.end) {
			this.scheduleEvent(nextTime);
		}
	}
}
