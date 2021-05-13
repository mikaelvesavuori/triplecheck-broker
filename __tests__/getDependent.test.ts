import { setupBroker } from './setupBroker';

import { BrokerRequest } from '../src/contracts/Broker';

describe('Success cases', () => {
  test('It should get dependents of a given service', async () => {
    const singleDependent: BrokerRequest = {
      body: undefined,
      method: 'GET',
      url: {
        pathname: '/dependents',
        search: '?demo-provider'
      }
    };

    const responseData = await setupBroker(singleDependent);

    expect(responseData).toMatchObject({
      '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
    });
  });

  test('It should get dependents of a given service version', async () => {
    const singleVersionedDependent: BrokerRequest = {
      body: undefined,
      method: 'GET',
      url: {
        pathname: '/dependents',
        search: '?demo-provider@1.0.0'
      }
    };

    const responseData = await setupBroker(singleVersionedDependent);

    expect(responseData).toMatchObject(['api-provider@1.0.0', 'some-provider@0.0.1']);
  });

  test('It should get all dependents', async () => {
    const allDependencies: BrokerRequest = {
      body: undefined,
      method: 'GET',
      url: {
        pathname: '/dependents',
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
