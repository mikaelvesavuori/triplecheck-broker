// DATABASE MOCK
const serviceList = ['demo-provider@1.0.0', 'some-provider@0.0.1', 'demo-provider@1.0.1'];

/**
 * @description Update service list.
 */
function updateServices(newServices: string[]): string[] {
  // Load or get data
  const services = serviceList;

  let result = [...services, ...newServices];
  result = Array.from(new Set(result));

  return result;
}

const a = updateServices([
  'demo-provider@1.0.0',
  'demo-provider@1.1.0',
  'some-provider@0.0.1',
  'api-provider@0.0.5'
]);
console.log('updateServices', a);

/**
 * @description List a service and all versions of it.
 */
function getService(service: string): Record<string, unknown> | null {
  const serviceRegex = new RegExp(service, 'gi');

  // Load or get data
  const services = serviceList;

  // Get all versions of service
  let result = services.map((item: any) => {
    if (item.match(serviceRegex)) return item.split('@')[1];
  });

  // Clean array of any undefined items
  result = result.filter((item: any) => item);

  if (!result || result.length === 0) {
    console.log('Sorry, could not find the service...');
    return null;
  } else {
    const data = {
      [service]: result
    };
    return data;
  }
}

const b = getService('demo-provider');
console.log('getService', b);

/**
 * @description Get all services and their versions.
 */
function getServices() {
  // Load or get data
  let services = serviceList;
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

const c = getServices();
console.log('getServices', c);
