import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

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

    // Lambda function
    const backend = new lambda.Function(this, 'handler', {
      code: lambda.AssetCode.fromAsset('lambda'),
      handler: 'url-shortener.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: table.tableName,
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    table.grantReadWriteData(backend);

    // API Gateway
    new apigateway.LambdaRestApi(this, 'url-shortener-api', {
      handler: backend,
    });
  }
}
