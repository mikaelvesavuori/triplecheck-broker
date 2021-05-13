import { Repository } from 'triplecheck-core';

/**
 * @description This is a local mock/fake for test-running.
 */
export class TestDataRepository implements Repository {
  method: string;
  pathname: string;
  search: string;

  constructor(request: any) {
    const { method, pathname, search } = request;
    this.method = method;
    this.pathname = pathname;
    this.search = search;
  }

  async getData(key: string): Promise<any> {
    /**
     * SERVICES
     */
    // Single service
    if (this.pathname === '/services' && this.search) return ['demo-provider@1.0.0'];
    // All services
    if (this.pathname === '/services' && !this.search)
      return ['demo-provider@1.0.0', 'demo-provider@1.1.0'];

    /**
     * CONTRACTS
     */
    // List of contracts to resolve
    if (this.pathname === '/contracts' && !this.search && key === 'contracts')
      return ['demo-provider@1.0.0', 'api-provider@1.3.0'];
    // Single contract
    if (this.pathname === '/contracts' && this.search && key === 'contracts')
      return ['demo-provider@1.0.0'];
    // Actual contracts
    if (this.pathname === '/contracts' && key === 'contract#demo-provider@1.0.0')
      return {
        name: 'asdf'
      };
    if (this.pathname === '/contracts' && key === 'contract#api-provider@1.3.0')
      return { address: 'Bubbletown 2200' };

    /**
     * TESTS
     */
    // List of tests to resolve
    if (this.pathname === '/tests' && !this.search && key === 'tests')
      return ['demo-provider@1.0.0', 'api-provider@1.3.0'];
    // Single test
    if (this.pathname === '/tests' && this.search && key === 'tests')
      return ['demo-provider@1.0.0'];
    // Actual tests
    if (this.pathname === '/tests' && key === 'test#demo-provider@1.0.0')
      return {
        name: 'asdf'
      };
    if (this.pathname === '/tests' && key === 'test#api-provider@1.3.0')
      return { address: 'Bubbletown 2200' };

    /**
     * DEPENDENCIES
     */
    // All dependencies
    if (this.pathname === '/dependencies' && !this.search && key === 'dependencies')
      return {
        'demo-provider': {
          '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
        },
        'api-provider': {
          '1.0.0': ['demo-provider@1.0.0']
        }
      };
    // Dependencies of a service
    if (this.pathname === '/dependencies' && !this.search.includes('@') && key === 'dependencies')
      return {
        'demo-provider': {
          '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
        }
      };
    // Dependencies of a single versioned service
    if (this.pathname === '/dependencies' && this.search.includes('@') && key === 'dependencies')
      return {
        'demo-provider': {
          '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
        }
      };

    /**
     * DEPENDENTS
     */
    // All dependents
    if (this.pathname === '/dependents' && !this.search && key === 'dependents')
      return {
        'demo-provider': {
          '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
        },
        'api-provider': {
          '1.0.0': ['demo-provider@1.0.0']
        }
      };
    // Dependents of a service
    if (this.pathname === '/dependents' && !this.search.includes('@') && key === 'dependents')
      return {
        'demo-provider': {
          '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
        }
      };
    // Dependents of a single versioned service
    if (this.pathname === '/dependents' && this.search.includes('@') && key === 'dependents')
      return {
        'demo-provider': {
          '1.0.0': ['api-provider@1.0.0', 'some-provider@0.0.1']
        }
      };
  }

  async updateData(key: string, data: any): Promise<void> {
    //
  }

  async deleteData(key: string): Promise<void> {
    //
  }
}
