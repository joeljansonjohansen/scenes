export default class Parameter {
  constructor(name, defaultValue, min, max, onChange) {
    this._name = name;
    this._value = defaultValue;
    this._min = min;
    this._max = max;
    this.listeners = [];

    this._value = this.unmap(defaultValue);
    this._onChange = onChange;
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
   * @brief Get the parameter name.
   * @return The name.
   */
  get name() {
    return this._name;
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

  /**
   * @brief Set the value.
   * @param val The value to set, normalized to 0 - 1.
   * @note The input value will be clipped if it exceeds the normalized range.
   */
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
    if (this._onChange) {
      this._onChange(this);
    }
    this.listeners.forEach(listener => {
      listener.update(this);
    });
  }
}
