import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNodejs from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';

const env = process.env.ENV || 'dev';

export class UrlShortenerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, 'mapping-table', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      partitionKey: {
        name: 'targetUrl',
        type: dynamodb.AttributeType.STRING,
      },
      indexName: 'targetUrl',
    });

    // Lambda function
    const handler = new lambdaNodejs.NodejsFunction(this, 'handler', {
      entry: 'lambda/url-shortener.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(handler);

    // API Gateway with stageName defined
    new apigateway.LambdaRestApi(this, `url-shortener-${env}-api`, {
      handler,
      deployOptions: {
        stageName: env,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });
  }
}
