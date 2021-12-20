export default class Parameter {
	constructor(name, defaultValue, min, max) {
		this._value = defaultValue;
		this.listeners = [];
	}

	update(who, value) {}

	addListener(listener) {
		this.listeners.push(listener);
	}

	get value() {
		return this._value;
	}

	set value(val) {
		this._value = val;
		this.listeners.forEach((e) => {
			listener.update(this, val);
		});
	}
}
