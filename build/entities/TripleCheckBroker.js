"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripleCheckBroker = exports.createNewBroker = void 0;
const calculateDbKey_1 = require("../frameworks/calculateDbKey");
const messages_1 = require("../frameworks/messages");
const createNewBroker = (repository) => {
    return new TripleCheckBroker(repository);
};
exports.createNewBroker = createNewBroker;
class TripleCheckBroker {
    constructor(repository) {
        this.repository = repository;
    }
    async router(url, payload) {
        const { method, pathname, search } = url;
        if (!method || !pathname)
            throw new Error(messages_1.errorRouterMissingParams);
        let responseData = 'DONE';
        let status = 200;
        const errorResponse = 'Not a valid path...';
        const path = pathname.substring(1, pathname.length);
        const query = (() => {
            if (search) {
                if (search[0] === '?')
                    return search.substring(1, search.length).replace(/%40/g, '@');
                else
                    return search.replace(/%40/g, '@');
            }
        })();
        const key = (() => {
            if (!query)
                return '';
            const [name, version] = query.split('@');
            return calculateDbKey_1.calculateDbKey({ type: path, name, version });
        })();
        if (method === 'GET') {
            if (query) {
                if (path === 'tests')
                    responseData = await this.getTests(query);
                else if (path === 'contracts')
                    responseData = await this.getContracts(query);
                else if (path === 'services')
                    responseData = await this.getServices(query);
                else if (path === 'dependencies' || path === 'dependents')
                    responseData = await this.getRelations(path, key);
            }
            else if (!query) {
                if (path === 'tests')
                    responseData = await this.getTests();
                else if (path === 'contracts')
                    responseData = await this.getContracts();
                else if (path === 'services')
                    responseData = await this.getServices();
                else if (path === 'dependencies' || path === 'dependents')
                    responseData = await this.getRelations(path);
            }
        }
        else if (method === 'POST' && path === 'publish')
            responseData = await this.publish(payload);
        else if (method === 'DELETE') {
            const { serviceName, version, test } = payload;
            if (path === 'tests')
                await this.deleteTest(serviceName, version, test);
            if (path === 'contracts')
                await this.deleteContract(serviceName, version);
        }
        else {
            responseData = errorResponse;
            status = 400;
        }
        return { responseData, status };
    }
    async publish(data) {
        const { contracts, tests, dependencies, identity } = data;
        await this.updateRelations(identity, dependencies);
        await this.updateContracts(contracts);
        await this.updateTests(tests);
        return 'DONE';
    }
    async getData(key) {
        if (!key)
            return this.handleError(messages_1.errorGetDataMissingKey);
        let data = await this.repository.getData(key);
        if ((!data && key === 'dependencies') || (!data && key === 'dependents'))
            data = {};
        else if (!data)
            data = [];
        console.log(`Finished getting data from key "${key}"`);
        return data;
    }
    async updateData(key, data) {
        if (!key || !data)
            return this.handleError(messages_1.errorUpdateDataMissingData);
        await this.repository.updateData(key, data);
        console.log(`Finished putting new data`);
        return data;
    }
    async deleteData(key) {
        await this.repository.deleteData(key);
        console.log(`Finished deleting data`);
    }
    async deleteTest(serviceName, serviceVersion, testName) {
        if (!serviceName)
            throw new Error("Missing 'serviceName' in deleteData()!");
        const key = calculateDbKey_1.calculateDbKey({
            type: 'test',
            name: serviceName,
            version: serviceVersion
        });
        const serviceData = await this.getData(key);
        if (!serviceData)
            return;
        const updatedTests = serviceData.filter((item) => {
            const _testName = Object.keys(item)[0];
            if (testName && testName !== _testName)
                return item;
        });
        const IS_UNCHANGED = JSON.stringify(updatedTests) === JSON.stringify(serviceData);
        if (IS_UNCHANGED)
            return;
        if (updatedTests.length === 0) {
            const listType = 'tests';
            const listData = await this.getData(listType);
            if (!listData)
                return;
            const filteredData = listData.filter((item) => item !== `${serviceName}@${serviceVersion}`);
            await this.updateData(listType, filteredData);
            await this.deleteData(key);
            console.log(`Finished deleting test`);
        }
        else {
            await this.updateData(key, updatedTests);
            console.log(`Finished updating tests`);
        }
    }
    async deleteContract(serviceName, version) {
        if (!serviceName || !version)
            throw new Error("Missing 'serviceName' and/or 'version' in deleteData()!");
        const serviceId = `${serviceName}@${version}`;
        const listType = 'contracts';
        const listData = await this.getData(listType);
        if (!listData)
            return;
        const filteredData = listData.filter((item) => item !== serviceId);
        await this.updateData(listType, filteredData);
        await this.updateList('services', [serviceId], true);
        await this.deleteTest(serviceName, version);
        const key = calculateDbKey_1.calculateDbKey({
            type: 'contract',
            name: serviceName,
            version
        });
        await this.deleteData(key);
        console.log(`Finished deleting contract: "${key}"`);
    }
    async updateList(listName, services, removeServices = false) {
        const currentList = await this.getData(listName);
        let updatedList = [];
        if (removeServices)
            updatedList = currentList.filter((item) => !services.includes(item));
        else
            updatedList = [...currentList, ...services];
        updatedList = Array.from(new Set(updatedList));
        await this.updateData(listName, updatedList);
        return updatedList;
    }
    handleError(message, status = 400) {
        return {
            responseData: JSON.stringify(message),
            status
        };
    }
    async getContracts(serviceId) {
        const services = await this.getData('contracts');
        const contractPromises = services.map(async (service) => {
            if (serviceId && service !== serviceId)
                return;
            const [name, version] = service.split('@');
            const key = calculateDbKey_1.calculateDbKey({ type: 'contract', name, version });
            const data = await this.getData(key);
            return {
                [name]: {
                    [version]: data
                }
            };
        });
        let contracts = await Promise.all(contractPromises);
        contracts = contracts.filter((test) => test);
        let fixedContracts = {};
        contracts.forEach((contract) => {
            const name = Object.keys(contract)[0];
            const version = Object.keys(contract[name])[0];
            if (!fixedContracts[name])
                fixedContracts[name] = contract[name];
            if (!fixedContracts[name][version])
                fixedContracts[name][version] = contract[name][version];
        });
        return Object.entries(fixedContracts).map((item) => ({
            [item[0]]: item[1]
        }));
    }
    async updateContracts(contracts) {
        const type = 'contract';
        let contractIds = [];
        if (!contracts || contracts.length === 0)
            return;
        const contractPromises = contracts.map(async (contract) => {
            const name = Object.keys(contract)[0];
            const version = Object.keys(contract[name])[0];
            const data = contract[name][version];
            if (!type || !name || !version || !data) {
                console.warn(messages_1.warnUpdateContractsMissingRequiredVariables);
                console.log(`---> type: ${type}, name: ${name}, version: ${version}, data: ${data}`);
                return;
            }
            contractIds.push(`${name}@${version}`);
            const key = calculateDbKey_1.calculateDbKey({ type, name, version });
            await this.updateData(key, data);
        });
        await Promise.all(contractPromises);
        await this.updateList('contracts', contractIds);
    }
    async getTests(serviceId) {
        const services = await this.getData('tests');
        if (!services || services.length === 0)
            return [];
        const testPromises = services.map(async (service) => {
            if (serviceId && service !== serviceId)
                return;
            const [name, version] = service.split('@');
            const key = calculateDbKey_1.calculateDbKey({ type: 'test', name, version });
            const data = await this.getData(key);
            return {
                [name]: {
                    [version]: data
                }
            };
        });
        let tests = await Promise.all(testPromises);
        tests = tests.filter((test) => test);
        let fixedTests = {};
        tests.forEach((test) => {
            const name = Object.keys(test)[0];
            const version = Object.keys(test[name])[0];
            if (!fixedTests[name])
                fixedTests[name] = test[name];
            if (!fixedTests[name][version])
                fixedTests[name][version] = test[name][version];
        });
        return Object.entries(fixedTests).map((item) => ({
            [item[0]]: item[1]
        }));
    }
    async updateTests(tests) {
        const type = 'test';
        const testIds = [];
        const testPromises = tests.map(async (test) => {
            const name = Object.keys(test)[0];
            const version = Object.keys(test[name])[0];
            if (!type || !name || !version) {
                console.warn(messages_1.warnUpdateTestsMissingRequiredVariables);
                console.log(`---> type: ${type}, name: ${name}, version: ${version}`);
                return;
            }
            const key = calculateDbKey_1.calculateDbKey({ type, name, version });
            const updatedTests = {};
            const existingData = (await this.getData(key)) || [];
            const newTests = test[name][version];
            const addTests = (arr) => {
                if (!arr || arr.length === 0)
                    return;
                arr.forEach((item) => {
                    const testName = Object.keys(item)[0];
                    updatedTests[testName] = item[testName];
                });
            };
            addTests(existingData);
            addTests(newTests);
            const cleanedTests = Object.entries(updatedTests).map((updatedTest) => {
                const [testName, testData] = updatedTest;
                return {
                    [testName]: testData
                };
            });
            testIds.push(`${name}@${version}`);
            await this.updateData(key, cleanedTests);
        });
        await Promise.all(testPromises);
        await this.updateList('tests', testIds);
    }
    async getRelations(type, key) {
        let data = await this.getData(type);
        if (!data || data.length === 0)
            return [];
        if (key) {
            key = key.split('#')[1];
            const [service, version] = key.split('@');
            let response = {};
            if (!version || version === 'undefined')
                response = data[service];
            else if (data[service])
                response = data[service][version];
            return response || {};
        }
        return data || [];
    }
    async updateRelations(identity, dependencies) {
        const { name, version } = identity;
        await this.updateList('services', [`${name}@${version}`]);
        const currentDependencies = await this.getData('dependencies');
        const updatedDependencies = this.updateDependencies(identity, dependencies, currentDependencies);
        await this.updateData('dependencies', updatedDependencies);
        const currentDependents = await this.getData('dependents');
        const updatedDependents = this.updateDependents(identity, dependencies, currentDependents);
        await this.updateData('dependents', updatedDependents);
    }
    updateDependencies(identity, dependencies, currentDependencies) {
        const { name, version } = identity;
        let updatedDependencies = currentDependencies;
        if (dependencies && dependencies.length > 0) {
            dependencies.forEach((dependency) => {
                if (!updatedDependencies[name])
                    updatedDependencies[name] = {
                        [version]: [dependency]
                    };
                else if (!updatedDependencies[name][version])
                    updatedDependencies[name][version] = [dependency];
                else {
                    const fixedDependencies = Array.from(new Set(dependencies));
                    fixedDependencies.sort();
                    updatedDependencies[name][version] = fixedDependencies;
                }
            });
        }
        return updatedDependencies;
    }
    updateDependents(identity, dependencies, currentDependents) {
        const { name, version } = identity;
        const versionedName = `${name}@${version}`;
        let updatedDependents = currentDependents;
        if (dependencies && dependencies.length > 0) {
            dependencies.forEach((dependency) => {
                const [dependencyName, dependencyVersion] = dependency.split('@');
                if (!updatedDependents[dependencyName])
                    updatedDependents[dependencyName] = {
                        [dependencyVersion]: [versionedName]
                    };
                else if (!updatedDependents[dependencyName][dependencyVersion])
                    updatedDependents[dependencyName][dependencyVersion] = [versionedName];
                else {
                    const fixedDependents = Array.from(new Set(updatedDependents[dependencyName][dependencyVersion]));
                    if (!fixedDependents.includes(versionedName))
                        fixedDependents.push(versionedName);
                    fixedDependents.sort();
                    updatedDependents[dependencyName][dependencyVersion] = fixedDependents;
                }
            });
        }
        return updatedDependents;
    }
    async getServices(service) {
        if (service) {
            const services = await this.getData('services');
            const serviceRegex = new RegExp(service, 'gi');
            let result = services.map((item) => {
                if (item.match(serviceRegex))
                    return item.split('@')[1];
            });
            result = result.filter((item) => item);
            if (!result || result.length === 0) {
                console.log(`Sorry, could not find the service...`);
                return {};
            }
            else {
                return {
                    [service]: result
                };
            }
        }
        else {
            let services = await this.getData('services');
            services = services.sort();
            let lastService = '';
            let result = {};
            services.forEach((item) => {
                const [name, version] = item.split('@');
                if (lastService !== name)
                    result[name] = [version];
                else
                    result[name] = [...result[name], version];
                lastService = name;
            });
            return result;
        }
    }
}
exports.TripleCheckBroker = TripleCheckBroker;
//# sourceMappingURL=TripleCheckBroker.js.map