import { TripleCheck } from '../../src/index';

import { providerContracts } from './testdata/providerContracts';
import { consumerContracts } from './testdata/consumerContracts';
import { createNewTripleCheck } from '../../src/entities/TripleCheck';

const config = {
  remoteData: true,
  dataUrl: 'https://somewhere.xyz/providerContracts',
  providerContracts: undefined,
  contractFilePath: undefined
};

(async () => {
  try {
    // Model v2
    const tripleCheck = createNewTripleCheck(config);
    tripleCheck.loadData();
    const _consumerContracts = tripleCheck.getConsumerContracts(['some-api', 'api-asdf']);
    await tripleCheck.test(consumerContracts);

    // Model v1
    // Problem: assumes that provider contracts need to be available and driving? How to test from provider-to-consumer perspective?
    //const tripleCheck = new TripleCheck({ providerContracts });
    //await tripleCheck.test(consumerContracts);
  } catch (error) {
    console.error(error);
  }
})();
