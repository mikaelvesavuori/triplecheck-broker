import { setupBroker } from './setupBroker';

import { BrokerRequest } from '../src/contracts/Broker';

describe('Success cases', () => {
  test('It should delete a test', async () => {
    const deleteTest: BrokerRequest = {
      body: JSON.stringify({
        serviceName: 'demo-provider',
        version: '1.7.0'
      }),
      method: 'DELETE',
      url: {
        pathname: '/tests',
        search: ''
      }
    };

    const responseData = await setupBroker(deleteTest);

    expect(responseData).toBe('DONE');
  });
});
