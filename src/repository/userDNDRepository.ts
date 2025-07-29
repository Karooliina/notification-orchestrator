import { PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateExpression } from '@/utils/buildUpdateExpression';
import withDBClient from '@/db/withDBClient';

type UserDNDSettings = {
  id: string;
  name: string;
  day: number;
  start_time?: string;
  end_time?: string;
  all_day: boolean;
};

type NewUserDNDSettings = Omit<UserDNDSettings, 'id'>;

async function getAllUserDNDSettings(userId: string) {
  return await withDBClient(async (dbClient) => {
    return await dbClient.send(
      new QueryCommand({
        TableName: 'UserDND',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': { S: userId },
        },
      }),
    );
  });
}

async function getUserActiveDNDSettings(userId: string, day: number, currentTime: string) {
  return await withDBClient(async (dbClient) => {
    console.log('day', day);
    console.log('currentTime', currentTime);
    console.log('userId', userId);
    console.log('dayTimeSk', `${day.toString()}#${currentTime}`);

    return await dbClient.send(
      new QueryCommand({
        TableName: 'UserDND',
        IndexName: 'UserDayTimeIndex',
        KeyConditionExpression: 'userId = :userId AND begins_with(dayTimeSk, :day)',
        FilterExpression: ':time BETWEEN start_time AND end_time',
        ExpressionAttributeValues: {
          ':userId': { S: userId },
          ':day': { S: day.toString() },
          ':time': { S: currentTime },
        },
      }),
    );
  });
}

async function setUserDNDSettings(userId: string, settings: NewUserDNDSettings) {
  return await withDBClient(async (dbClient) => {
    return await dbClient.send(
      new PutItemCommand({
        TableName: 'UserDND',
        Item: {
          dndId: { S: uuidv4() },
          userId: { S: userId },
          name: { S: settings.name },
          day: { N: settings.day.toString() },
          dayTimeSk: { S: `${settings.day.toString()}#${settings.start_time}#${settings.end_time}` },
          start_time: { S: settings.start_time },
          end_time: { S: settings.end_time },
          all_day: { BOOL: settings.all_day },
          createdAt: { S: new Date().toISOString() },
          updatedAt: { S: new Date().toISOString() },
        },
      }),
    );
  });
}

async function updateUserDNDSettings(userId: string, settings: Partial<UserDNDSettings>) {
  return await withDBClient(async (dbClient) => {
    const { id, ...updateSettings } = settings;

    const needsRecomputeDayTimeSk =
      updateSettings.day !== undefined ||
      updateSettings.start_time !== undefined ||
      updateSettings.end_time !== undefined;

    const newDayTimeSk = needsRecomputeDayTimeSk ? await getUpdatedDayTimeSk(userId, id, updateSettings) : null;
    const updateSettingsWithSK = {
      ...updateSettings,
      ...(newDayTimeSk && { dayTimeSk: newDayTimeSk }),
    };

    const { updateExpression, expressionAttributeNames, expressionAttributeValues } =
      buildUpdateExpression(updateSettingsWithSK);

    return await dbClient.send(
      new UpdateItemCommand({
        TableName: 'UserDND',
        Key: {
          userId: { S: userId },
          dndId: { S: id },
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(userId) AND attribute_exists(dndId)',
      }),
    );
  });
}

async function getUpdatedDayTimeSk(userId: string, id: string, updateSettings: Partial<UserDNDSettings>) {
  return await withDBClient(async (dbClient) => {
    const currentItemResult = await dbClient.send(
      new QueryCommand({
        TableName: 'UserDND',
        KeyConditionExpression: 'userId = :userId AND dndId = :dndId',
        ExpressionAttributeValues: {
          ':userId': { S: userId },
          ':dndId': { S: id },
        },
      }),
    );

    if (currentItemResult.Items && currentItemResult.Items.length > 0) {
      const currentItem = currentItemResult.Items[0];

      const day = updateSettings.day !== undefined ? updateSettings.day.toString() : currentItem.day?.N || '';
      const startTime =
        updateSettings.start_time !== undefined ? updateSettings.start_time : currentItem.start_time?.S || '';
      const endTime = updateSettings.end_time !== undefined ? updateSettings.end_time : currentItem.end_time?.S || '';

      return `${day}#${startTime}#${endTime}`;
    }

    return null;
  });
}

export { getAllUserDNDSettings, setUserDNDSettings, updateUserDNDSettings, getUserActiveDNDSettings };
