import { Router } from 'express';

import authRoutes from './auth.routes';
import protectedRoutes from './protected/protected.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);

export default router;
