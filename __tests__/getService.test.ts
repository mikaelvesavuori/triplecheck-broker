import { setupBroker } from './setupBroker';

import { BrokerRequest } from '../src/contracts/Broker';

describe('Success cases', () => {
  test('It should get a service', async () => {
    const singleService: BrokerRequest = {
      body: undefined,
      method: 'GET',
      url: {
        pathname: '/services',
        search: '?demo-provider'
      }
    };

    const responseData = await setupBroker(singleService);

    expect(responseData).toMatchObject({ 'demo-provider': ['1.0.0'] });
  });

  test('It should get all services', async () => {
    const allServices: BrokerRequest = {
      body: undefined,
      method: 'GET',
      url: {
        pathname: '/services',
        search: ''
      }
    };

    const responseData = await setupBroker(allServices);

    expect(responseData).toMatchObject({ 'demo-provider': ['1.0.0', '1.1.0'] });
  });
});
