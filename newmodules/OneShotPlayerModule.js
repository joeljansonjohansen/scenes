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
		this.randomize = options.randomize ?? false;
		//If measured is set to true, then this module will use the triggerlength instead
		//to trigger a new player at a measured and consistant beat.
		this.measured = false;
		if (options.triggerLength) {
			this.measured = true;
			this.triggerLength =
				Tone.Transport.toSeconds(options.triggerLength) ??
				Tone.Transport.toSeconds("1m");
		}
		if (this.density < 0.5) {
			console.warn(
				"Values below 0.5 are quite demanding. Be aware of clicks and pops."
			);
		}
		this.detune = options.detune ?? 0;
		this.reverb = new Tone.Reverb(5.5, 1.0);
		this.delays = [];
	}

	prepareModule(options) {
		//Function for any preparations that cannot be done in the setup but should be done before start to save valuable time at the starting point.
		this.buffer = new Tone.ToneAudioBuffer({
			url: options.recordingURL,
			onload: () => {
				options.moduleReady();
				this.scheduleEvent(this.start);

				/*
				 * If we want the module to "linger", we need to add a fade and make the length longer.
				 * Or do you sometimes not want to fadeOut? Actually we want to know when the module is finished.
				 * So maybe we could set an internal stop or "decayLength" that we add to the "length" of the player.
				 */
				this.channel.volume.rampTo(0, this.fadeIn, this.start);
				this.channel.volume.rampTo(
					-Infinity,
					this.fadeOut,
					this.end - this.fadeOut
				);
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

			/*
			 * Setup pan values. First the randomized initial pan and then the destination pan.
			 * Then setup the panner.
			 */
			let panRange = 2;
			let initialPan = -1 + Math.random() * 2;
			let panDest =
				initialPan < 0
					? initialPan + Math.random() * panRange
					: initialPan - Math.random() * panRange;
			panDest = panDest < -1 ? -1 : panDest;
			panDest = panDest > 1 ? 1 : panDest;

			const panner = new Tone.Panner(initialPan);

			/*
			 * Setup the filter
			 */
			const filter = new Tone.Filter(500 + Math.random() * 21500, "lowpass");

			/*
			 * Setup the delay and add it to the internal delay-array for disposing them later.
			 */
			const feedbackDelay = new Tone.FeedbackDelay(0.1, 0.5); //.toDestination();
			this.delays.push(feedbackDelay);

			/*
			 * Setup the Player, this could be a Player or a GrainPlayer
			 * dispose the effects and the player in the onStop.
			 */
			let player = new Tone.GrainPlayer({
				loop: false,
				url: this.buffer,
				volume: -Infinity,
				//reverse: true,
				//playbackRate: Math.random(),
				detune: this.detune, // + (-50 + Math.random() * 50),
				//detune: -1200 + Math.random() * 1200,
				//detune: -1200,
				// playbackRate: 1.0,
				//playbackRate: Tone.intervalToFrequencyRatio(this.detune / 100),
				onstop: () => {
					//console.log("ended");
					player.dispose();
					panner?.dispose();
					filter?.dispose();
					//feedbackDelay.dispose();
				},
			})
				.start(time, this.offset)
				.stop(time + this.loopLength);

			/*
			 * Perhaps this could be changed into an envelope. Or maybe this is good for now.
			 */
			player.volume.rampTo(this.volume, this.loopFadeIn, time);
			player.volume.rampTo(
				-Infinity,
				this.loopFadeOut,
				time + this.loopLength - this.loopFadeOut
			);

			//This has to be rewritten
			if (this.randomize) {
				player.chain(filter, panner);
				if (Math.random() > 0.2) {
					panner.chain(feedbackDelay, this.reverb, this.channel);
				} else {
					panner.chain(this.reverb, this.channel);
				}
				this.offset = Math.random() * this.buffer.duration - this.loopLength;
				this.volume = -20 + Math.random() * 20;
			} else {
				player.chain(panner, this.reverb, this.channel);
			}
			feedbackDelay.delayTime.rampTo(Math.random(), Math.random() * 2.5, time);
			panner.pan.rampTo(panDest, this.loopLength, time);
			//To here
		}, eventTime);

		/*
		 * If we have a measured time, as a fixed value, quarter note or so. We take that value.
		 * Otherwise we randomize a time based on the density that has been set before.
		 * Then we schedule it if it's inside of the modules timeframe.
		 */
		let nextTime = eventTime + Math.random() * (2 * this.density);
		if (this.measured) {
			nextTime = eventTime + this.triggerLength;
		}
		//console.log(nextTime);
		if (nextTime < this.end) {
			this.scheduleEvent(nextTime);
		}
	}
	moduleFinished() {
		//Clean up the delays and reverbs. Maybe this should be in a better way? Disposing buffers?
		for (let feedbackDelay of this.delays) {
			feedbackDelay.dispose();
		}
		this.reverb.dispose();
		this.buffer.dispose();
		super.moduleFinished();
	}
}
