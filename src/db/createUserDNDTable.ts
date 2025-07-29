import { CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import withDBClient from '@/db/withDBClient';

export const createUserDNDTable = async () =>
  await withDBClient(async (dbClient) => {
    const isTableExists = await dbClient.send(new ListTablesCommand({}));

    if (isTableExists.TableNames.includes('UserDND')) {
      console.log('UserDND table already exists');
      return;
    }

    dbClient.send(
      new CreateTableCommand({
        TableName: 'UserDND',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },

          { AttributeName: 'dndId', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'dndId', AttributeType: 'S' },
          { AttributeName: 'dayTimeSk', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'UserDayTimeIndex',
            KeySchema: [
              { AttributeName: 'userId', KeyType: 'HASH' },
              { AttributeName: 'dayTimeSk', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
      (err, data) => {
        if (err) {
          console.error(err);
        } else {
        }
      },
    );

    console.log('UserDND table created');
  });
