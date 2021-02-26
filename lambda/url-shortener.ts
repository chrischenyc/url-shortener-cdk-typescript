import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
// import * as uuid from 'uuid';

const TableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.queryStringParameters?.targetUrl) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: await createShortUrl(event.queryStringParameters.targetUrl, event),
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
  // const id = uuid.v4().slice(0, 8);
  const id = uuidv4().slice(0, 8);

  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  await dynamoDb
    .put({
      TableName,
      Item: {
        id,
        targetUrl,
      },
    })
    .promise();

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

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-5xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
