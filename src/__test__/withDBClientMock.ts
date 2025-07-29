import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { dbTestClient } from './dbTestClient';

export const withDBClientMock = async <T>(fn: (dbClient: DynamoDBClient) => Promise<T>): Promise<T> => {
  return await fn(dbTestClient);
};

export default withDBClientMock;
