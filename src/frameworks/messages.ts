export const msgFinishedGettingData = (key: string) => `Finished getting data from key: "${key}"`;
export const msgFinishedPuttingData = `Finished putting new data`;
export const msgFinishedDeletingData = `Finished deleting data`;
export const msgFinishedUpdatingTests = `Finished updating tests`;
export const msgFinishedDeletingTest = (key: string) => `Finished deleting test: ${key}`;
export const msgFinishedDeletingContract = (key: string) => `Finished deleting contract: "${key}"`;
export const msgUnknownService = `Sorry, could not find the service...`;

export const warnUpdateContractsMissingRequiredVariables = `Missing one or more of required arguments "type", "name", "version" and/or "data"! Skipping adding this contract...`;
export const warnUpdateTestsMissingRequiredVariables = `Missing one or more of required arguments "type", "name", and/or "version"! Skipping adding this test...`;

export const errorRouterMissingParams = `Missing arguments "method" and/or "pathname" in router()!`;
export const errorGetDataMissingKey = `Missing arguments "key" in getData()!`;
export const errorUpdateDataMissingData = `Missing arguments "data" in updateData()!`;
export const errorDeleteDataMissingParams = `Missing arguments "type" and/or "serviceName" in deleteData()!`;
