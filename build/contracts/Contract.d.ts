import { Schema } from './Schema';
export declare type Contract = {
    [serviceName: string]: ContractVersion;
};
export declare type ContractVersion = {
    [version: string]: Schema;
};
