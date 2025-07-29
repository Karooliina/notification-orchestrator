import { ListTablesCommand, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import withDBClient from '@/db/withDBClient';

export const createUserNotificationTable = async () =>
  await withDBClient(async (dbClient) => {
    const isTableExists = await dbClient.send(new ListTablesCommand({}));

    if (isTableExists.TableNames.includes('UserNotification')) {
      console.log('UserNotification table already exists');

      return;
    }

    dbClient.send(
      new CreateTableCommand({
        TableName: 'UserNotification',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'notificationType', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'notificationType', AttributeType: 'S' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
        }
      },
    );

    console.log('UserNotification table created');
  });
