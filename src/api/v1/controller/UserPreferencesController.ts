import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('Get user preferences controller');
});

router.post('/', (req, res) => {
  res.send('Post user preferences controller');
});

router.put('/', (req, res) => {
  res.send('Put user preferences controller');
});

export const userPreferencesRouter = router;
