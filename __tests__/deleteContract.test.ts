import { setupBroker } from './setupBroker';

import { BrokerRequest } from '../src/contracts/Broker';

describe('Success cases', () => {
  test('It should delete a contract', async () => {
    const req: BrokerRequest = {
      body: JSON.stringify({
        serviceName: 'demo-provider',
        version: '1.7.0'
      }),
      method: 'DELETE',
      url: {
        pathname: '/contracts',
        search: ''
      }
    };

    const responseData = await setupBroker(req);

    expect(responseData).toBe('DONE');
  });
});
