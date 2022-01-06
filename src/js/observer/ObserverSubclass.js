const Observer = require("./observer");

class ObserverSubclass extends Observer {
	constructor() {
		super();
	}

	eventIsRelevant(evnt) {
		return evnt.evntName == "new-index" && evnt.value % 2 != 0;
	}

	reactToEvent(evnt) {
		console.log("----------------------");
		console.log("Odd number found!");
		console.log(evnt.value);
		console.log("----------------------");
	}
}
