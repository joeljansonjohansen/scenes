export default class Observer {
	update(event) {
		if (this.eventIsRelevant(event)) {
			this.reactToEvent(event);
		}
	}

	eventIsRelevant() {
		throw new Error("This needs to be implemented");
	}

	reactToEvent() {
		throw new Error("This needs to be implemented");
	}
}
