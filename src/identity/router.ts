import { Router } from 'express';
import handlers from './handlers.js';

const router = Router();

router.post('/', handlers.CreateIdentity);

export default router;
