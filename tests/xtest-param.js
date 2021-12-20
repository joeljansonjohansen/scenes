import Parameter from '../js/modules/Parameter.js';

class TestModule {
  constructor() {
    this._params = [
      new Parameter('foo', 0, 0, 1),
      new Parameter('bar', 0, 0, 1),
    ];
  }

  get params() {
    return this._params;
  }

  update(object) {
    this._params.forEach(param => {
      param.value = object.value;
    });
  }
}

// const param = new Parameter("freq", 440, 20, 20000);
const param = new Parameter("pan", 0, -1, 1);
const testParam = new Parameter("x", 0, 0, 10);
const obj = new TestModule();

console.log(param.value);
param.value = 0.1;
console.log(param.value);

param.addListener(obj);
param.value = 0.3;

testParam.addListener(param);
param.value = 0.4;
