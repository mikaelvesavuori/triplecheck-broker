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
