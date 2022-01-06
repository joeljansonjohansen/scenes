class Subject {
	constructor() {
		this.observers = [];
	}

	addObserver(obs) {
		this.observers.push(obs);
	}

	notifyObservers(event) {
		this.observers.forEach((o) => o.update(event));
	}
}
