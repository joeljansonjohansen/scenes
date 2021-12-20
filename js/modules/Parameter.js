export default class Parameter {
  constructor(name, defaultValue, min, max) {
    this._name = name;
    this._value = defaultValue;
    this._min = min;
    this._max = max;
    this.listeners = [];

    this.value = this.unmap(defaultValue);
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  map(value) {
    return (value / 1) * (this._max - this._min) + this._min;
  }

  unmap(value) {
    return (value - this._min) / (this._max - this._min);
  }

  /**
   * @brief Get the scaled value.
   * @return The mapped/scaled value.
   */
  get value() {
    return this.map(this._value);
  }

  /**
   * @brief Normalized value.
   * @return The normalized value.
   */
  get normalizedValue() {
    return this._value;
  }

  set value(val) {
    if (val === undefined || val === null) {
      return;
    }
    if (val > 1.0) {
      val = 1.0;
    } else if (val < 0.0) {
      val = 0.0;
    }
    this._value = val;
    this.listeners.forEach(listener => {
      listener.update(this);
    });
  }
}
