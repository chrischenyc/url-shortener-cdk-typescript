# 'Infrastructure is Code with the AWS CDK - AWS Online Tech Talks' - TypeScript implementation

## Background

[Infrastructure is Code with the AWS CDK - AWS Online Tech Talks](https://www.youtube.com/watch?v=ZWCvNFUN-sU) was easy to follow but done in Python (nothing bad about it!). While porting the demo project to TypeScript, I came across a few hurdles:

- [@aws-cdk/aws-lambda](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-readme.html) won't package external dependencies, i.e.: [uuid](https://www.npmjs.com/package/uuid). This problem puzzled (and surprised) me and many others:

  - <https://github.com/aws-samples/aws-cdk-examples/issues/276>
  - <https://github.com/aws-samples/aws-cdk-examples/issues/369>
  - <https://github.com/aws-samples/aws-cdk-examples/pull/278>

- The official CDK example [api-cors-lambda-crud-dynamodb](https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/api-cors-lambda-crud-dynamodb) works but it requires building/watching TypeScript before calling `cdk deploy`, which doesn't feel like the best tooling experience.

- AWS documentation [Creating a serverless application using the AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/serverless_example.html) doesn't help either (surprise!).

- I ended up with the experimental [@aws-cdk/aws-lambda-nodejs](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-nodejs-readme.html). This makes deploying Lambda written in JavaScript/TypeScript much easier. The overall experience is similar to [serverless framework](https://serverless.com/).

  ```typescript
  const backend = new lambdaNodejs.NodejsFunction(this, 'handler', {
    entry: 'lambda/url-shortener.ts',
    handler: 'handler',
    runtime: lambda.Runtime.NODEJS_14_X,
    environment: {
      TABLE_NAME: table.tableName,
    },
  });
  ```

## How to deploy

Prerequisite: your CLI should have access to AWS with suitable `AWS_PROFILE` and `AWS_REGION`.

- `yarn` - install dependencies
- `cdk bootstrap` - if you haven't got stack `CDKToolkit` on CloudFormation
- `cdk deploy '*'` - deploy all stacks to dev environment
- `ENV=prod cdk deploy '*'` - deploy all stacks to production environment
