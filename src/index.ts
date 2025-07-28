import express from 'express';
import { notificationsRouter, userPreferencesRouter } from '@/api/v1/controller';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createUserDNDTable } from './db/createUserDNDTable';
import { createUserNotificationTable } from './db/createUserNotificationTable';
import { authorizeRequest } from './middleware/authMiddleware';

(async () => {
  const app = express();
  const port = process.env.PORT;

  app.use(
    cors({
      origin: 'http://localhost:3000',
    }),
  );
  app.use(bodyParser.json());

  app.use('/health', (req, res) => {
    res.status(200).json({ success: true, data: 'Healthy' });
  });

  app.use('/api/v1/notifications', authorizeRequest, notificationsRouter);

  app.use('/api/v1/user-preferences', authorizeRequest, userPreferencesRouter);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  console.log('Creating tables');
  await createUserDNDTable();
  await createUserNotificationTable();
})();
