import { BatchGetItemCommand, GetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import dbClient from '@/db/dbSetup';

type UserNotificationSettings = {
  notification_type: string;
  enabled: boolean;
  channels?: string[];
};

async function getAllUserNotificationsSettings(userId: string) {
  return await dbClient.send(
    new BatchGetItemCommand({
      RequestItems: {
        UserNotification: {
          Keys: [{ userId: { S: userId } }],
        },
      },
    }),
  );
}

async function getUserNotificationsSettingsByType(userId: string, notification_type: string) {
  return await dbClient.send(
    new GetItemCommand({
      TableName: 'UserNotification',
      Key: { userId: { S: userId }, notification_type: { S: notification_type } },
    }),
  );
}

async function setUserNotificationsSettings(userId: string, settings: UserNotificationSettings) {
  return await dbClient.send(
    new PutItemCommand({
      TableName: 'UserNotification',
      Item: {
        userId: { S: userId },
        notification_type: { S: settings.notification_type },
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
      Key: { userId: { S: userId }, notification_type: { S: settings.notification_type } },
      UpdateExpression: 'SET #enabled = :enabled, #channels = :channels',
      ExpressionAttributeNames: {
        '#enabled': 'enabled',
        '#channels': 'channels',
      },
      ExpressionAttributeValues: {
        ':enabled': { BOOL: settings.enabled },
        ':channels': { SS: settings.channels },
      },
      ConditionExpression: 'attribute_exists(userId) AND attribute_exists(notification_type)',
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
