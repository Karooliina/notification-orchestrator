import express from 'express';
import { notificationsRouter, userPreferencesRouter } from '@/api/v1/controller';

const app = express();
const port = process.env.PORT;

app.use('/health', (req, res) => {
  res.send('OK');
});

app.use('/notifications', notificationsRouter);

app.use('/user-preferences/:userId', userPreferencesRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
