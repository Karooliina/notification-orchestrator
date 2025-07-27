import dbClient from './dbSetup';
import { CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';

export const createUserDNDTable = async () => {
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
        { AttributeName: 'dnd_day_index', KeyType: 'HASH' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'dnd_day', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }),
    (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log(data);
      }
    },
  );

  console.log('UserDND table created');
};
