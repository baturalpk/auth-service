import { Router }  from 'express';
import handlers  from './handlers.js';
import { VerifyIdentity }  from '../identity/middleware.js';

const router = Router()

router.post('/new', VerifyIdentity, handlers.NewSession)
router.post('/validate', handlers.ValidateSession)
router.delete('/destroy', handlers.DestroySession)

export default router;
