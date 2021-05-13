import { setupBroker } from './setupBroker';

import { BrokerRequest } from '../src/contracts/Broker';

describe('Success cases', () => {
  test('It should get a test', async () => {
    const singleTest: BrokerRequest = {
      body: '',
      method: 'GET',
      url: {
        pathname: '/tests',
        search: '?demo-provider@1.0.0'
      }
    };

    const responseData = await setupBroker(singleTest);

    expect(responseData).toMatchObject([
      {
        'demo-provider': {
          '1.0.0': {
            name: 'asdf'
          }
        }
      }
    ]);
  });

  test('It should get all tests', async () => {
    const allTests: BrokerRequest = {
      body: '',
      method: 'GET',
      url: {
        pathname: '/tests',
        search: ''
      }
    };

    const responseData = await setupBroker(allTests);

    expect(responseData).toMatchObject([
      {
        'demo-provider': {
          '1.0.0': {
            name: 'asdf'
          }
        }
      },
      {
        'api-provider': {
          '1.3.0': {
            address: 'Bubbletown 2200'
          }
        }
      }
    ]);
  });
});
