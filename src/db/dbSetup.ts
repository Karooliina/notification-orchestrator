import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const dbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.DB_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
