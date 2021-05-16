import { Repository } from 'triplecheck-core';

import { createNewBroker } from '../entities/TripleCheckBroker';

import { Url } from '../contracts/Url';

/**
 * @description Controller (orchestrator) for TripleCheck broker.
 */
export async function TripleCheckBrokerController(
  request: Url,
  body: any,
  repository: Repository
): Promise<any> {
  try {
    const broker = createNewBroker(repository);
    const { responseData, status } = await broker.router(request, body);
    const headers = {};

    return { responseData, status, headers };
  } catch (error) {
    console.error(error);
    return { responseData: error.message, status: 500 };
  }
}
