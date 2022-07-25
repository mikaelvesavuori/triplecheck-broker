import { Repository } from 'triplecheck-core';
import { BrokerResponse } from '../contracts/Broker';
import { Url } from '../contracts/Url';
export declare const createNewBroker: (repository: Repository) => TripleCheckBroker;
export declare class TripleCheckBroker {
    repository: Repository;
    constructor(repository: Repository);
    router(url: Url, payload: any): Promise<BrokerResponse>;
    private publish;
    private getData;
    private updateData;
    private deleteData;
    private deleteTest;
    private deleteContract;
    private updateList;
    handleError(message: string, status?: number): BrokerResponse;
    private getContracts;
    private updateContracts;
    private getTests;
    private updateTests;
    private getRelations;
    private updateRelations;
    private updateDependencies;
    private updateDependents;
    private getServices;
}
