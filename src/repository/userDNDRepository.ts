import dbClient from '@/db/dbSetup';
import { BatchGetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

type UserDNDSettings = {
  dnd_name: string;
  dnd_weekdays: number[];
  dnd_start_time: string;
  dnd_end_time: string;
};

async function getUserDNDSettings(userId: string) {
  const result = await dbClient.send(
    new BatchGetItemCommand({
      RequestItems: {
        UserDND: {
          Keys: [{ userId: { S: userId } }],
        },
      },
    }),
  );

  return result;
}

async function setUserDNDSettings(userId: string, settings: UserDNDSettings) {
  const result = await dbClient.send(
    new PutItemCommand({
      TableName: 'UserDND',
      Item: {
        userId: { S: userId },
        dnd_name: { S: settings.dnd_name },
        dnd_weekdays: { SS: settings.dnd_weekdays.map((day) => day.toString()) },
        dnd_start_time: { S: settings.dnd_start_time },
        dnd_end_time: { S: settings.dnd_end_time },
      },
    }),
  );

  return result;
}

async function updateUserDNDSettings(userId: string, settings: UserDNDSettings) {
  const result = await dbClient.send(
    new UpdateItemCommand({
      TableName: 'UserDND',
      Key: { userId: { S: userId } },
      UpdateExpression:
        'SET #dnd_name = :dnd_name, #dnd_weekdays = :dnd_weekdays, #dnd_start_time = :dnd_start_time, #dnd_end_time = :dnd_end_time',
      ExpressionAttributeNames: {
        '#dnd_name': 'dnd_name',
        '#dnd_weekdays': 'dnd_weekdays',
        '#dnd_start_time': 'dnd_start_time',
        '#dnd_end_time': 'dnd_end_time',
      },
      ExpressionAttributeValues: {
        ':dnd_name': { S: settings.dnd_name },
        ':dnd_weekdays': { SS: settings.dnd_weekdays.map((day) => day.toString()) },
        ':dnd_start_time': { S: settings.dnd_start_time },
        ':dnd_end_time': { S: settings.dnd_end_time },
      },
    }),
  );

  return result;
}

export { getUserDNDSettings, setUserDNDSettings, updateUserDNDSettings };
