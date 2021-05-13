import { TripleCheckBroker } from '../src/index';
import { TestDataRepository } from './TestDataRepository';

import { BrokerRequest } from '../src/contracts/Broker';

export async function setupBroker(req: BrokerRequest) {
  const { body, method } = req;
  const { pathname, search } = req.url;

  let payload: any = body ? JSON.parse(body) : body;

  const request: any = {
    method,
    pathname,
    search
  };

  const repository = new TestDataRepository(request);
  const { responseData } = await TripleCheckBroker(request, payload, repository);

  return responseData;
}
