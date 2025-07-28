import { QueryCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import dbClient from '@/db/dbSetup';
import { buildUpdateExpression } from '@/utils/buildUpdateExpression';

type UserNotificationSettings = {
  notification_type: string;
  enabled: boolean;
  channels?: string[];
};

async function getAllUserNotificationsSettings(userId: string) {
  return await dbClient.send(
    new QueryCommand({
      TableName: 'UserNotification',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    }),
  );
}

async function getUserNotificationsSettingsByType(userId: string, notification_type: string) {
  return await dbClient.send(
    new QueryCommand({
      TableName: 'UserNotification',
      KeyConditionExpression: 'userId = :userId AND notificationType = :notificationType',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
        ':notificationType': { S: notification_type },
      },
    }),
  );
}

async function setUserNotificationsSettings(userId: string, settings: UserNotificationSettings) {
  return await dbClient.send(
    new PutItemCommand({
      TableName: 'UserNotification',
      Item: {
        userId: { S: userId },
        notificationType: { S: settings.notification_type },
        enabled: { BOOL: settings.enabled },
        ...(settings.channels?.length && { channels: { SS: settings.channels } }),
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() },
      },
    }),
  );
}

async function updateUserNotificationsSettings(userId: string, settings: UserNotificationSettings) {
  const { notification_type, ...updateSettings } = settings;
  const { updateExpression, expressionAttributeNames, expressionAttributeValues } =
    buildUpdateExpression(updateSettings);

  return await dbClient.send(
    new UpdateItemCommand({
      TableName: 'UserNotification',
      Key: {
        userId: { S: userId },
        notificationType: { S: notification_type },
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(userId) AND attribute_exists(notificationType)',
      ReturnValues: 'ALL_NEW',
    }),
  );
}

export {
  getAllUserNotificationsSettings,
  setUserNotificationsSettings,
  updateUserNotificationsSettings,
  getUserNotificationsSettingsByType,
};
