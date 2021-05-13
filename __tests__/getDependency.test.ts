import { setupBroker } from './setupBroker';

import { BrokerRequest } from '../src/contracts/Broker';

describe('Success cases', () => {
  test('It should get dependencies of a given service', async () => {
    const singleDependency: BrokerRequest = {
      body: undefined,
      method: 'GET',
      url: {
        pathname: '/dependencies',
        search: '?demo-provider'
      }
    };

    const responseData = await setupBroker(singleDependency);

    expect(responseData).toMatchObject({
      '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
    });
  });

  test('It should get dependencies of a given service version', async () => {
    const singleVersionedDependency: BrokerRequest = {
      body: undefined,
      method: 'GET',
      url: {
        pathname: '/dependencies',
        search: '?demo-provider@1.0.0'
      }
    };

    const responseData = await setupBroker(singleVersionedDependency);

    expect(responseData).toMatchObject(['api-provider@1.0.0', 'some-provider@0.0.1']);
  });

  test('It should get all dependencies', async () => {
    const allDependencies: BrokerRequest = {
      body: undefined,
      method: 'GET',
      url: {
        pathname: '/dependencies',
        search: ''
      }
    };

    const responseData = await setupBroker(allDependencies);

    expect(responseData).toMatchObject({
      'demo-provider': {
        '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
      },
      'api-provider': {
        '1.0.0': ['demo-provider@1.0.0']
      }
    });
  });
});
