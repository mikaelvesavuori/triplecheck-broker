# triplecheck-broker

## TripleCheck broker service

The TripleCheck broker allows you to do lightweight consumer contract testing.

You need to run the broker with a (database) repository of your choice.

## Instructions

Coming.

## Quickstart using example implementations

There are several implementations that you can use ready-to-go or as your own starter kit. The current list is:

- [Google Cloud Run and Firestore](https://github.com/mikaelvesavuori/triplecheck-example-cloudrun)
- [Google Cloud Functions and Firestore](https://github.com/mikaelvesavuori/triplecheck-example-cloud-functions)
- [Cloudflare Workers and KV](https://github.com/mikaelvesavuori/triplecheck-example-cloudflare-workers)
- [AWS Lambda with DynamoDB](https://github.com/mikaelvesavuori/triplecheck-example-lambda)
- [Vercel with FaunaDB](https://github.com/mikaelvesavuori/triplecheck-example-vercel)
- [Netlify with FaunaDB](https://github.com/mikaelvesavuori/triplecheck-example-netlify)

Examples for Azure Container Instances and Azure Functions are being produced but got delayed and botched because of typical Microsoft issues, so that's why they are not in the first block of examples.

The easiest way to get going with starter code is by using [degit](https://github.com/Rich-Harris/degit). degit makes it very convenient to pull a shallow clone from Git without all the history and other garbage you get when cloning repose. The format is:

```
npx degit {github-user}/{github-repo} {your-folder}
```

So, actually downloading a TripleCheck example would therefore look like:

```
npx degit mikaelvesavuori/triplecheck-example-cloudrun my-cloudrun-broker
```

## Available database repositories

The broker requires a "repository", i.e. a piece of code that will drive the database.

Examples above already use some of these. If you're keen on writing your own broker implementation, you might want to use one of the available repositories:

- [Azure CosmosDB SQL](https://github.com/mikaelvesavuori/triplecheck-repository-cosmosdb-sql)
- [Google Firestore](https://github.com/mikaelvesavuori/triplecheck-repository-firestore)
- [Cloudflare KV](https://github.com/mikaelvesavuori/triplecheck-repository-cloudflarekv)
- [AWS DynamoDB](https://github.com/mikaelvesavuori/triplecheck-repository-dynamodb)
- [FaunaDB](https://github.com/mikaelvesavuori/triplecheck-repository-fauna)

## Example requests

These are also available in Insomnia format in the repo.

### Publish

#### Publish #1

```
POST {{BROKER_URL}}/publish

{
	"identity": {
		"name": "user-api",
		"version": "1.1.0"
	},
	"dependencies": [
		"payments-service@1.3.0"
	],
	"contracts": [
		{
			"user-api": {
				"1.1.0": {
					"name": "Someone",
					"address": "Some Street 123",
					"age": 35
				}
			}
		}
	],
	"tests": [
		{
			"user-api": {
				"1.1.0": [
					{
						"Verify identity": {
							"name": "Carmen",
							"address": "Ocean View 3000",
							"age": 27
						}
					}
				]
			}
		}
	]
}
```

#### Publish #2

```
POST {{BROKER_URL}}/publish

{
	"identity": {
		"name": "payments-service",
		"version": "1.3.0"
	},
	"dependencies": [],
	"contracts": [
		{
			"payments-service": {
				"1.3.0": {
					"userId": "string",
					"invoiceId": "string",
					"paidInFull": false
				}
			}
		}
	],
	"tests": [
		{
			"payments-service": {
				"1.3.0": [
					{
						"User payment update": {
							"userId": "823hc73nca",
							"invoiceId": "828612-10273-eff",
							"paidInFull": true
						}
					}
				]
			}
		}
	]
}
```

### Services

#### Get services

```
GET {{BROKER_URL}}/services
```

#### Get service

```
GET {{BROKER_URL}}/services?payments-service
```

### Relations

#### Get dependencies

```
GET {{BROKER_URL}}/dependencies
```

#### Get dependencies of given service

```
GET {{BROKER_URL}}/dependencies?user-api
```

#### Get dependencies of given service version

```
GET {{BROKER_URL}}/dependencies?user-api@1.0.0
```

#### Get dependents

```
GET {{BROKER_URL}}/dependents
```

#### Get dependents of given service

```
GET {{BROKER_URL}}/dependents?payments-service
```

#### Get dependents of given service version

```
GET {{BROKER_URL}}/dependents?payments-service@1.3.0
```

### Contracts

#### Get contracts

```
GET {{BROKER_URL}}/contracts
```

#### Get contract

```
GET {{BROKER_URL}}/contracts?user-api@1.0.0
```

#### Delete contract

```
DELETE {{BROKER_URL}}/contracts

{
  "serviceName": "user-api",
  "version": "1.0.0"
}
```

### Tests

#### Get tests

```
GET {{BROKER_URL}}/tests
```

#### Get test

```
GET {{BROKER_URL}}/tests?payments-service@1.3.0
```

#### Delete tests for version of service

```
DELETE {{BROKER_URL}}/tests

{
	"serviceName": "payment-service",
	"version": "1.3.0"
}
```

#### Delete test

```
DELETE {{BROKER_URL}}/tests

{
	"serviceName": "payments-service",
	"version": "1.3.0",
	"test": "User payment update"
}
```
