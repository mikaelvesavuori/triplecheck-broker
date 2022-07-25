import { Schema } from './Schema';
export declare type Test = {
    [serviceName: string]: TestVersion;
};
declare type TestVersion = {
    [version: string]: Schema[];
};
export {};
