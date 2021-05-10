import { TripleCheckBroker } from '../src/index';
import { CloudflareKvRepository } from 'triplecheck-repository-cloudflarekv';

let responseData: any,
  status: any,
  headers: any = undefined;

// TODO: Create this into utility function
beforeEach(async () => {
  const req = {
    body: '',
    method: 'GET',
    url: {
      pathname: '/services',
      search: ''
    }
  };

  const { body, method } = req;
  const { pathname, search } = req.url;

  let payload: any = body;

  const request: any = {
    method,
    pathname,
    search
  };

  // TODO: Use a local mock instead
  const repository = new CloudflareKvRepository();

  const response = await TripleCheckBroker(request, payload, repository);

  console.log('response', response);

  responseData = response.responseData;
  status = response.status;
  headers = response.headers;
});

describe('Success cases', () => {
  test('It should TODO', () => {
    console.log('responseData', responseData);
    expect(responseData).toMatchObject({
      'api-provider': ['1.3.0'],
      'demo-provider': ['1.0.0', '1.1.0']
    });
  });
});
