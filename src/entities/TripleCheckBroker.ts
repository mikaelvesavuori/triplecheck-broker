import { Repository, List } from 'triplecheck-core';

import { BrokerResponse } from '../contracts/Broker';
import { Contract } from '../contracts/Contract';
import { Test } from '../contracts/Test';
import { Identity } from '../contracts/Identity';
import { Url } from '../contracts/Url';

import { calculateDbKey } from '../frameworks/calculateDbKey';
import {
  errorRouterMissingParams,
  errorGetDataMissingKey,
  errorUpdateDataMissingData,
  warnUpdateContractsMissingRequiredVariables,
  warnUpdateTestsMissingRequiredVariables
} from '../frameworks/messages';

export const createNewBroker = (repository: Repository): TripleCheckBroker => {
  return new TripleCheckBroker(repository);
};

export class TripleCheckBroker {
  repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  /**
   * @description Handle path routing.
   */
  public async router(url: Url, payload: any): Promise<BrokerResponse> {
    const { method, pathname, search } = url;
    if (!method || !pathname) throw new Error(errorRouterMissingParams);

    let responseData: any = 'DONE';
    let status: number = 200;
    const errorResponse: string = 'Not a valid path...';
    const path = pathname.substring(1, pathname.length);
    const query = (() => {
      if (search) {
        // "%40" is "@"
        if (search[0] === '?') return search.substring(1, search.length).replace('%40', '@');
        else return search.replace('%40', '@');
      }
    })();

    const key = (() => {
      if (!query) return '';
      const [name, version] = query.split('@');
      const key = calculateDbKey({ type: path, name, version });
      return key;
    })();

    // Handle GET
    // TODO: Allow for getting by serviceIdentity, test/exclude scopes etc
    if (method === 'GET') {
      // Get singles
      if (query) {
        if (path === 'tests') responseData = await this.getTests(query);
        else if (path === 'contracts') responseData = await this.getContracts(query);
        else if (path === 'services') responseData = await this.getServices(query);
        else if (path === 'dependencies' || path === 'dependents')
          responseData = await this.getRelations(path, key);
      }
      // Get collections
      else if (!query) {
        if (path === 'tests') responseData = await this.getTests();
        else if (path === 'contracts') responseData = await this.getContracts();
        else if (path === 'services' && !query) responseData = await this.getServices();
        else if (path === 'dependencies' || path === 'dependents')
          responseData = await this.getRelations(path);
      }
    }
    // Handle POST
    else if (method === 'POST' && path === 'publish') responseData = await this.publish(payload);
    // Handle DELETE (single item)
    else if (method === 'DELETE') {
      const { serviceName, version, test } = payload;
      if (path === 'tests') await this.deleteTest(serviceName, version, test);
      if (path === 'contracts') await this.deleteContract(serviceName, version);
    }
    // Fallback
    else {
      responseData = errorResponse;
      status = 400;
    }

    return { responseData, status };
  }

  /**
   * @description Publish data to our persistence layer.
   * 1. Update aggregated lists of relations: dependencies, dependents
   * 2. Update contracts
   * 3. Update tests
   */
  private async publish(data: any): Promise<any> {
    const { contracts, tests, dependencies, identity } = data;
    await this.updateRelations(identity, dependencies);
    await this.updateContracts(contracts);
    await this.updateTests(tests);

    return 'DONE';
  }

  //////////////////////////////////////////////////////////////
  //  DATA (these use the repository's core functionalities)  //
  //////////////////////////////////////////////////////////////

  /**
   * @description Get data for the provided key. Sends back empty array if it cannot find anything.
   */
  private async getData(key: string): Promise<any> {
    if (!key) return this.handleError(errorGetDataMissingKey);

    let data = await this.repository.getData(key);

    // Fallback: Null dependencies and dependents should be an empty object
    if ((!data && key === 'dependencies') || (!data && key === 'dependents')) data = {};
    // Fallback: Any other nulls should be an empty array
    else if (!data) data = [];
    console.log(`Finished getting data from key "${key}"`);
    return data;
  }

  /**
   * @description Update (PUT) data at the provided key.
   */
  private async updateData(key: string, data: any): Promise<any> {
    if (!key || !data) return this.handleError(errorUpdateDataMissingData);

    await this.repository.updateData(key, data);
    console.log(`Finished putting new data`);
    return data;
  }

  /**
   * @description Delete data for type and service.
   */
  private async deleteData(key: string): Promise<void> {
    await this.repository.deleteData(key);
    console.log(`Finished deleting data`);
  }

  //////////////////////
  //  ODDS AND ENDS   //
  //////////////////////

  /**
   * @description Delete test from a service.
   */
  private async deleteTest(
    serviceName: string,
    serviceVersion: string,
    testName?: string
  ): Promise<void> {
    if (!serviceName) throw new Error("Missing 'serviceName' in deleteData()!");

    const key = calculateDbKey({
      type: 'test',
      name: serviceName,
      version: serviceVersion
    });
    const serviceData = await this.getData(key);
    if (!serviceData) return;

    // Exclude right test if we were provided a testName, else return none (delete all)
    const updatedTests = serviceData.filter((item: any) => {
      const _testName = Object.keys(item)[0];
      if (testName && testName !== _testName) return item;
    });

    const IS_UNCHANGED = JSON.stringify(updatedTests) === JSON.stringify(serviceData);
    if (IS_UNCHANGED) return;

    if (updatedTests.length === 0) {
      // Update master list if there are no more tests in this version
      const listType = 'tests';
      const listData = await this.getData(listType);
      if (!listData) return;

      const filteredData = listData.filter(
        (item: string) => item !== `${serviceName}@${serviceVersion}`
      );
      await this.updateData(listType, filteredData);

      // Delete the actual record if empty
      await this.deleteData(key);
      console.log(`Finished deleting test`);
    } else {
      await this.updateData(key, updatedTests);
      console.log(`Finished updating tests`);
    }
  }

  /**
   * @description Delete a contract.
   */
  private async deleteContract(serviceName: string, version: string): Promise<void> {
    if (!serviceName || !version)
      throw new Error("Missing 'serviceName' and/or 'version' in deleteData()!");
    const serviceId = `${serviceName}@${version}`;

    // Update the relevant master list first
    const listType = 'contracts';
    const listData = await this.getData(listType);
    if (!listData) return;
    const filteredData = listData.filter((item: string) => item !== serviceId);
    await this.updateData(listType, filteredData);

    // Update the list of services
    await this.updateList('services', [serviceId], true);

    // Delete all related tests
    await this.deleteTest(serviceName, version);

    // Delete the actual record
    const key = calculateDbKey({
      type: 'contract',
      name: serviceName,
      version
    });
    await this.deleteData(key);

    console.log(`Finished deleting contract: "${key}"`);
  }

  /**
   * @description Update the master lists for services, contracts, and tests.
   * The service list maps to a `publish` call's `identity` block (`name` and `version` fields, primarily).
   */
  private async updateList(listName: List, services: string[], removeServices = false) {
    const currentList = await this.getData(listName);

    let updatedList = [];
    if (removeServices)
      updatedList = currentList.filter((item: string) => !services.includes(item));
    else updatedList = [...currentList, ...services];
    updatedList = Array.from(new Set(updatedList));

    await this.updateData(listName, updatedList);

    return updatedList;
  }

  // TODO: Verify that this works
  handleError(message: string, status = 400): BrokerResponse {
    return {
      responseData: JSON.stringify(message),
      status
    };
  }

  //////////////////
  //  CONTRACTS   //
  //////////////////

  /**
   * @description Get all contracts. Adds object wrappers for service name and version.
   * @todo Consider refactoring/merging with getTests()
   */
  private async getContracts(serviceId?: string): Promise<any> {
    const services = await this.getData('contracts');

    const contractPromises = services.map(async (service: string) => {
      if (serviceId && service !== serviceId) return;
      const [name, version] = service.split('@');
      const key = calculateDbKey({ type: 'contract', name, version });
      const data = await this.getData(key);

      return {
        [name]: {
          [version]: data
        }
      };
    });

    let contracts: any = await Promise.all(contractPromises);
    contracts = contracts.filter((test: any) => test);

    let fixedContracts: any = {};

    // Create a nested structure
    contracts.forEach((contract: any) => {
      const name = Object.keys(contract)[0];
      const version = Object.keys(contract[name])[0];

      // If this service does not exist then add it
      if (!fixedContracts[name]) fixedContracts[name] = contract[name];
      // If this version does not exist then add it
      if (!fixedContracts[name][version]) fixedContracts[name][version] = contract[name][version];
    });

    // Return an array with service-named objects
    const cleaned = Object.entries(fixedContracts).map((item: any) => ({
      [item[0]]: item[1]
    }));
    return cleaned;
  }

  /**
   * @description Utility method to handle updating contracts. Updates contract version "in-place",
   * overwriting whatever was there before.
   * @todo Consider refactoring/merging with updateTests()
   */
  private async updateContracts(contracts: Contract[]): Promise<void> {
    const type = 'contract';
    let contractIds: string[] = [];

    if (!contracts || contracts.length === 0) return;

    const contractPromises = contracts.map(async (contract: Contract) => {
      const name: string = Object.keys(contract)[0];
      const version: string = Object.keys(contract[name])[0];
      const data: any = contract[name][version];

      if (!type || !name || !version || !data) {
        console.warn(warnUpdateContractsMissingRequiredVariables);
        console.log(`---> type: ${type}, name: ${name}, version: ${version}, data: ${data}`);
        return;
      }

      contractIds.push(`${name}@${version}`);

      const key = calculateDbKey({ type, name, version });
      await this.updateData(key, data);
    });

    await Promise.all(contractPromises);

    await this.updateList('contracts', contractIds);
  }

  //////////////////
  //    TESTS     //
  //////////////////

  /**
   * @description Get all tests.
   * @todo Consider refactoring/merging with getContracts()
   */
  private async getTests(serviceId?: string) {
    const services = await this.getData('tests');
    if (!services || services.length === 0) return [];

    const testPromises = services.map(async (service: string) => {
      if (serviceId && service !== serviceId) return;
      const [name, version] = service.split('@');
      const key = calculateDbKey({ type: 'test', name, version });
      const data = await this.getData(key);

      return {
        [name]: {
          [version]: data
        }
      };
    });

    let tests: any = await Promise.all(testPromises);
    tests = tests.filter((test: any) => test);

    let fixedTests: any = {};

    // Create a clean structure
    tests.forEach((test: any) => {
      const name = Object.keys(test)[0];
      const version = Object.keys(test[name])[0];

      // If this service does not exist then add it
      if (!fixedTests[name]) fixedTests[name] = test[name];
      // If this version does not exist then add it
      if (!fixedTests[name][version]) fixedTests[name][version] = test[name][version];
    });

    // Return an array with service-named objects
    const cleaned = Object.entries(fixedTests).map((item: any) => ({
      [item[0]]: item[1]
    }));

    return cleaned;
  }

  /**
   * @description Utility method to handle updating tests.
   * @todo Consider refactoring/merging with updateContracts()
   */
  private async updateTests(tests: Test[]): Promise<void> {
    const type = 'test';
    const testIds: string[] = [];

    const testPromises = tests.map(async (test: any) => {
      const name: string = Object.keys(test)[0];
      const version: string = Object.keys(test[name])[0];

      if (!type || !name || !version) {
        console.warn(warnUpdateTestsMissingRequiredVariables);
        console.log(`---> type: ${type}, name: ${name}, version: ${version}`);
        return;
      }

      const key = calculateDbKey({ type, name, version });
      const updatedTests: any = {};

      const existingData = (await this.getData(key)) || [];
      const newTests: any = test[name][version];

      const addTests = (arr: any[]) => {
        if (!arr || arr.length === 0) return;
        arr.forEach((item: any) => {
          const testName = Object.keys(item)[0];
          updatedTests[testName] = item[testName];
        });
      };

      addTests(existingData);
      addTests(newTests);

      // Put each test in its own object within a wrapping array
      const cleanedTests = Object.entries(updatedTests).map((test: any) => {
        const [name, testData] = test;
        return {
          [name]: testData
        };
      });

      testIds.push(`${name}@${version}`);

      await this.updateData(key, cleanedTests);
    });

    await Promise.all(testPromises);

    await this.updateList('tests', testIds);
  }

  //////////////////
  //  RELATIONS   //
  //////////////////

  /**
   * @description Get dependencies or dependents, either all as a collection or of a single service (with or without version).
   */
  private async getRelations(type: string, key?: string) {
    let data = await this.getData(type);
    if (!data || data.length === 0) return [];

    if (key) {
      key = key.split('#')[1];
      const [service, version] = key.split('@');
      let response: any = {};
      if (!version || version === 'undefined') response = data[service];
      else response = data[service][version];
      return response || {};
    }

    return data || [];
  }

  /**
   * @description Orchestrator method to first update dependencies of a service, then the dependents of it.
   * @todo Update to allow reducing/removing services
   */
  private async updateRelations(identity: Identity, dependencies: string[]) {
    /**
     * Update service list
     */
    const { name, version } = identity;
    await this.updateList('services', [`${name}@${version}`]);

    /**
     * Handle dependencies
     */
    const currentDependencies = await this.getData('dependencies');
    const updatedDependencies = this.updateDependencies(
      identity,
      dependencies,
      currentDependencies
    );
    await this.updateData('dependencies', updatedDependencies);

    /**
     * Handle dependents
     */
    const currentDependents = await this.getData('dependents');
    const updatedDependents = this.updateDependents(identity, dependencies, currentDependents);
    await this.updateData('dependents', updatedDependents);
  }

  /**
   * @description Update aggregated list of a service's dependencies (i.e. what a given service uses).
   * @todo Enable reducing/removing services and updating dependencies
   */
  private updateDependencies(identity: Identity, dependencies: string[], currentDependencies: any) {
    const { name, version } = identity;

    let updatedDependencies: any = currentDependencies;

    if (dependencies && dependencies.length > 0) {
      dependencies.forEach((dependency: string) => {
        // If service does not exist
        if (!updatedDependencies[name])
          updatedDependencies[name] = {
            [version]: [dependency]
          };
        // If service version does not exist
        else if (!updatedDependencies[name][version])
          updatedDependencies[name][version] = [dependency];
        // Else, add dependency to existing list and deduplicate any items
        else {
          const fixedDependencies = Array.from(new Set(dependencies));
          fixedDependencies.sort();
          updatedDependencies[name][version] = fixedDependencies;
        }
      });
    }

    return updatedDependencies;
  }

  /**
   * @description Update aggregated list of a service's dependents (i.e. what services use a given service).
   * @todo Enable reducing/removing services and updating dependents
   */
  private updateDependents(identity: Identity, dependencies: string[], currentDependents: any) {
    const { name, version } = identity;
    const versionedName = `${name}@${version}`;

    let updatedDependents: any = currentDependents;

    /**
     * For each incoming dependency, add them correctly to the updated dependents list
     */
    if (dependencies && dependencies.length > 0) {
      dependencies.forEach((dependency: string) => {
        const [dependencyName, dependencyVersion] = dependency.split('@');

        // If service does not exist
        if (!updatedDependents[dependencyName])
          updatedDependents[dependencyName] = {
            [dependencyVersion]: [versionedName]
          };
        // If service version does not exist
        else if (!updatedDependents[dependencyName][dependencyVersion])
          updatedDependents[dependencyName][dependencyVersion] = [versionedName];
        // Else, add dependency to existing list and deduplicate any items
        else {
          const fixedDependents = Array.from(
            new Set(updatedDependents[dependencyName][dependencyVersion])
          );
          fixedDependents.sort();
          updatedDependents[dependencyName][dependencyVersion] = fixedDependents;
        }
      });
    }

    return updatedDependents;
  }

  //////////////////
  //   SERVICES   //
  //////////////////

  /**
   * @description Get services, either by a single name or all of them.
   * Does not support versions, since it would not really make sense: the response is basically just a list of versions.
   */
  private async getServices(service?: string): Promise<any> {
    // Get single service
    if (service) {
      const services = await this.getData('services');
      const serviceRegex = new RegExp(service, 'gi');

      let result = services.map((item: any) => {
        if (item.match(serviceRegex)) return item.split('@')[1];
      });

      result = result.filter((item: any) => item);

      if (!result || result.length === 0) {
        console.log(`Sorry, could not find the service...`);
        return {};
      } else {
        const data = {
          [service]: result
        };
        return data;
      }
    }
    // Get all
    else {
      let services = await this.getData('services');
      services = services.sort();

      let lastService: string = '';
      let result: any = {};

      services.forEach((item: string) => {
        const [name, version] = item.split('@');
        if (lastService !== name) result[name] = [version];
        else result[name] = [...result[name], version];
        lastService = name;
      });

      return result;
    }
  }
}
