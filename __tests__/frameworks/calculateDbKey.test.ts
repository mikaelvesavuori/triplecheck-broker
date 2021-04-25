import { calculateDbKey } from '../../src/frameworks/calculateDbKey';

// Should be: test#demo-service@1.0.0Some%20test%20thingy

const key = {
  type: 'test',
  name: 'demo-service',
  version: '1.0.0',
  test: 'Some test thingy'
};

const x = calculateDbKey(key);

console.log(x);
