import Parameter from '../js/modules/Parameter.js';

class TestModule {
  constructor() {
    this.freq = new Parameter('freq', 440, 20, 20000, (param) => {
      // do something with the parameter value here
      console.log(param.name + ' changed: ' + param.value);
    });
    this.amp = new Parameter('amp', 0, 0, 1, (param) => {
      // do something with the parameter value here
      console.log(param.name + ' changed: ' + param.value);
    });
    this._params = [this.freq, this.amp];
  }

  /**
   * @brief Returns a parameter array.
   */
  get parameters() {
    return this._params;
  }

  /**
   * @brief Implement this method to listen to updates from other parameters.
   */
  update(object) {
    this._params.forEach(param => {
      param.value = object.value;
    });
  }
}

// const param = new Parameter("freq", 440, 20, 20000);
// const param = new Parameter("pan", 0, -1, 1);
// const testParam = new Parameter("x", 0, 0, 10);

// console.log(param.value);
// param.value = 0.1;
// console.log(param.value);
// param.addListener(obj);
// param.value = 0.3;
// testParam.addListener(param);
// param.value = 0.4;

const obj = new TestModule();
console.log(obj.parameters);

// test setters
obj.amp.value = 0.25;
obj.freq.value = 0.025;

// test getter
console.log(obj.freq.value)

// maybe implement a "rawValue" setter?
obj.freq.value = obj.freq.unmap(440);
