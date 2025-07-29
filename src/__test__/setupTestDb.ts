import { createUserDNDTable } from '@/db/createUserDNDTable';
import { createUserNotificationTable } from '@/db/createUserNotificationTable';
import { AttributeValue, DeleteItemCommand, DeleteTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import withDBClientMock from './withDBClientMock';

export async function setupTestDb() {
  await createUserDNDTable();
  await createUserNotificationTable();

  console.log('Test DB setup complete');
}

export async function teardownTestDb() {
  await withDBClientMock(async (dbClient) => {
    const tables = await dbClient.send(new ListTablesCommand({}));

    for (const table of tables.TableNames || []) {
      if (table === 'UserDND' || table === 'UserNotification') {
        await dbClient.send(new DeleteTableCommand({ TableName: table }));
      }
    }
  });
  console.log('Test DB teardown complete');
}

export async function clearTestData(tableName: string, keys: Record<string, AttributeValue>) {
  await withDBClientMock(async (dbClient) => {
    await dbClient.send(new DeleteItemCommand({ TableName: tableName, Key: keys }));
  });
}
