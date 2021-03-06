// This is the mock of all collected provider contracts

export const providerContracts = [
  {
    'delivery-service': {
      '1.0.0': {
        time: 'time',
        pizza: 'pizza',
        totalPrice: 12345
      },
      '1.1.0': {
        time: 'time',
        pizza: 'pizza',
        totalPrice: 12345,
        homeDelivery: true
      }
    }
  },
  {
    'api-provider': {
      '1.0.0': {
        definitions: {},
        version: '1.0.0',
        $id: 'http://example.com/common.json',
        type: 'object',
        title: 'The root schema',
        required: ['name', 'email', 'totalPrice'],
        properties: {
          name: {
            type: 'string',
            title: 'The name schema',
            description: 'Customer name',
            default: 'Firstname Lastname'
          },
          email: {
            type: 'string',
            title: 'The email schema',
            description: 'Customer email',
            default: 'firstname.lastname@somewhere.xyz'
          },
          totalPrice: {
            type: 'number',
            title: 'The totalPrice schema',
            description: 'Total price of wares in USD cents',
            default: 0
          },
          isTest: {
            type: 'boolean',
            title: 'The testId schema',
            description: 'Is this a test?',
            default: false
          }
        }
      }
    }
  }
];
