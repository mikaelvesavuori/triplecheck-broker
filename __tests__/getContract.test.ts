import { setupBroker } from './setupBroker';

import { BrokerRequest } from '../src/contracts/Broker';

describe('Success cases', () => {
  test('It should get a contract', async () => {
    const singleContract: BrokerRequest = {
      body: '',
      method: 'GET',
      url: {
        pathname: '/contracts',
        search: '?demo-provider@1.0.0'
      }
    };

    const responseData = await setupBroker(singleContract);

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

  test('It should get all contracts', async () => {
    const allContracts: BrokerRequest = {
      body: '',
      method: 'GET',
      url: {
        pathname: '/contracts',
        search: ''
      }
    };

    const responseData = await setupBroker(allContracts);

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
