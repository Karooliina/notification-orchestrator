import express from 'express';
import { notificationsRouter, userPreferencesRouter } from '@/api/v1/controller';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createUserDNDTable } from './db/createUserDNDTable';
import { createUserNotificationTable } from './db/createUserNotificationTable';

(async () => {
  const app = express();
  const port = process.env.PORT;

  app.use(
    cors({
      origin: '*',
    }),
  );
  app.use(bodyParser.json());

  app.use('/health', (req, res) => {
    res.send('OK');
  });

  app.use('/notifications', notificationsRouter);

  app.use('/user-preferences', userPreferencesRouter);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  console.log('Creating tables');
  await createUserDNDTable();
  await createUserNotificationTable();
})();
