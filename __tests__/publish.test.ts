import { setupBroker } from './setupBroker';

import { BrokerRequest } from '../src/contracts/Broker';

describe('Success cases', () => {
  test('It should publish a contract', async () => {
    const publish: BrokerRequest = {
      body: JSON.stringify({
        identity: {
          name: 'demo-provider',
          version: '1.0.0',
          endpoint: 'http://localhost:8080/api'
        },
        dependencies: ['some-provider@1.0.0'],
        contracts: [
          {
            'demo-provider': {
              '1.0.0': {
                name: 'string'
              }
            }
          }
        ],
        tests: [
          {
            'demo-provider': {
              '1.0.0': [
                {
                  'A demo test': {
                    name: 'Joanna Dark'
                  }
                }
              ]
            }
          }
        ]
      }),
      method: 'POST',
      url: {
        pathname: '/publish',
        search: ''
      }
    };

    const responseData = await setupBroker(publish);
    console.log('responseData', responseData);

    expect(responseData).toBe('DONE');
  });
});
