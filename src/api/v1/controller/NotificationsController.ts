import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('Get notifications controller');
});

export const notificationsRouter = router;
