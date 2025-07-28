import dbClient from './dbSetup';
import { ListTablesCommand, CreateTableCommand, UpdateTableCommand } from '@aws-sdk/client-dynamodb';

export const createUserNotificationTable = async () => {
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
        console.log(data);
      }
    },
  );

  console.log('UserNotification table created');
};
