import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const dbTestClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'local',
  endpoint: process.env.TEST_DB_URL || 'http://localhost:8002',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});
