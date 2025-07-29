import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { dbClient } from '@/db/dbSetup';

function withDBClient<T>(fn: (dbClient: DynamoDBClient) => Promise<T>) {
  return fn(dbClient);
}

export default withDBClient;
