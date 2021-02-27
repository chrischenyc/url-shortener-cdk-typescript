import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';

const TableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.queryStringParameters?.targetUrl) {
    const shortUrl = await createShortUrl(event.queryStringParameters.targetUrl, event);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<a href="${shortUrl}">${shortUrl}</a>`,
    };
  }

  if (event.pathParameters?.proxy) {
    const targetUrl = await readShortUrl(event.pathParameters.proxy);

    if (targetUrl) {
      return {
        statusCode: 301,
        headers: { Location: targetUrl },
        body: '',
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: `No redirect found for ${event.pathParameters.proxy}`,
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'usage: ?targetUrl=URL',
  };
};

const createShortUrl = async (targetUrl: string, event: APIGatewayProxyEvent): Promise<string> => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const { Items } = await dynamoDb
    .query({
      TableName,
      IndexName: 'targetUrl',
      KeyConditionExpression: 'targetUrl = :t',
      ExpressionAttributeValues: {
        ':t': targetUrl,
      },
    })
    .promise();

  let id;
  if (Items?.length) {
    id = Items[0].id;
  } else {
    id = uuid.v4().slice(0, 8);

    await dynamoDb
      .put({
        TableName,
        Item: {
          id,
          targetUrl,
        },
      })
      .promise();
  }

  const redirectUrl = 'https://' + event.requestContext.domainName + event.requestContext.path + id;

  return redirectUrl;
};

const readShortUrl = async (proxy: string): Promise<string | null> => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const result = await dynamoDb
    .get({
      TableName,
      Key: {
        id: proxy,
      },
    })
    .promise();

  if (result.Item) {
    return result.Item.targetUrl;
  }

  return null;
};
