import dbClient from '@/db/dbSetup';
import { PutItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

type UserDNDSettings = {
  dnd_name: string;
  dnd_weekdays: number[];
  dnd_start_time: string;
  dnd_end_time: string;
};

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

async function getUserDNDSettingsByDayAndTime(userId: string, day: number, time: number) {
  const result = await dbClient.send(
    new QueryCommand({
      TableName: 'UserDND',
      KeyConditionExpression:
        'userId = :userId AND contains(:day, dndweekdays#) AND :time BETWEEN dndstarttime# AND dndendtime#',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
        ':day': { S: day.toString() },
        ':time': { S: time.toString() },
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
        id: { S: uuidv4() },
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
        'UPDATE #dnd_name = :dnd_name, #dnd_weekdays = :dnd_weekdays, #dnd_start_time = :dnd_start_time, #dnd_end_time = :dnd_end_time',
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

export { getAllUserDNDSettings, setUserDNDSettings, updateUserDNDSettings, getUserDNDSettingsByDayAndTime };
