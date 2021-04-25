import { Schema } from './Schema';

export type Contract = {
  [serviceName: string]: ContractVersion;
};

export type ContractVersion = {
  [version: string]: Schema;
};
