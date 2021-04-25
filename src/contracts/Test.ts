import { Schema } from './Schema';

export type Test = {
  [serviceName: string]: TestVersion;
};

type TestVersion = {
  [version: string]: Schema[];
};
