import { QueryCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import dbClient from '@/db/dbSetup';

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
      },
    }),
  );
}

async function updateUserNotificationsSettings(userId: string, settings: UserNotificationSettings) {
  return await dbClient.send(
    new UpdateItemCommand({
      TableName: 'UserNotification',
      Key: {
        userId: { S: userId },
        notificationType: { S: settings.notification_type },
      },
      UpdateExpression: 'SET #enabled = :enabled, #channels = :channels',
      ExpressionAttributeNames: {
        '#enabled': 'enabled',
        '#channels': 'channels',
      },
      ExpressionAttributeValues: {
        ':enabled': { BOOL: settings.enabled },
        ':channels': { SS: settings.channels },
      },
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
