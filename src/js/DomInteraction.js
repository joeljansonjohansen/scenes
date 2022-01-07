import * as Tone from "tone";
export default function setupDomEvents(permissions) {
	document
		.getElementById("getMicrophoneAccess")
		?.addEventListener("click", async () => {
			await permissions.getPermissions();
		});

	document.getElementById("startButton")?.addEventListener("click", () => {
		setupModules();
		Tone.Transport.start();
		// Tone.Transport.loop = true;
		// Tone.Transport.loopEnd = "4:0";
		// Tone.Transport.loopStart = "3:0";
		// let count = 0;
		// Tone.Transport.scheduleRepeat((time) => {
		// 	if (count > 4) {
		// 		Tone.Transport.loop = false;
		// 	}
		// 	count++;
		// }, "1m");
	});
}
