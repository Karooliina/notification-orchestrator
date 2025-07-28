import dbClient from '@/db/dbSetup';
import { PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateExpression } from '@/utils/buildUpdateExpression';

type UserDNDSettings = {
  id: string;
  name: string;
  days: number[];
  start_time: string;
  end_time: string;
};

type NewUserDNDSettings = Omit<UserDNDSettings, 'id'>;

async function getAllUserDNDSettings(userId: string) {
  const result = await dbClient.send(
    new QueryCommand({
      TableName: 'UserDND',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    }),
  );

  return result;
}

async function getUserActiveDNDSettings(userId: string, day: number, currentTime: string) {
  const result = await dbClient.send(
    new QueryCommand({
      TableName: 'UserDND',
      IndexName: 'UserDayTimeIndex',
      KeyConditionExpression:
        'userId = :userId AND begins_with(dayStartEnd, :day) AND :time BETWEEN start_time# AND end_time#',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
        ':day': { S: day.toString() },
        ':time': { S: currentTime },
      },
    }),
  );

  return result;
}

async function setUserDNDSettings(userId: string, settings: NewUserDNDSettings) {
  const result = await dbClient.send(
    new PutItemCommand({
      TableName: 'UserDND',
      Item: {
        dndId: { S: uuidv4() },
        userId: { S: userId },
        name: { S: settings.name },
        days: { SS: settings.days.map((day) => day.toString()) },
        start_time: { S: settings.start_time },
        end_time: { S: settings.end_time },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
      },
    }),
  );

  return result;
}

async function updateUserDNDSettings(userId: string, settings: Partial<UserDNDSettings>) {
  const { id, ...updateSettings } = settings;
  const { updateExpression, expressionAttributeNames, expressionAttributeValues } =
    buildUpdateExpression(updateSettings);

  console.log(updateExpression, expressionAttributeNames, expressionAttributeValues);

  const result = await dbClient.send(
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
  return result;
}

export { getAllUserDNDSettings, setUserDNDSettings, updateUserDNDSettings, getUserActiveDNDSettings };
