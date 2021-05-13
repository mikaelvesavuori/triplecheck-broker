import { calculateDbKey } from '../../src/frameworks/calculateDbKey';

describe('Success cases', () => {
  test('It should calculate a key for a test', async () => {
    const key = {
      type: 'test',
      name: 'demo-service',
      version: '1.0.0'
    };

    expect(calculateDbKey(key)).toBe('test#demo-service@1.0.0');
  });
});
