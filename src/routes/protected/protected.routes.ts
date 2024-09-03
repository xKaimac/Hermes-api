import { Router } from 'express';

import chatRoutes from './chats.routes';
import friendRoutes from './friends.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/user', userRoutes);
router.use('/chats', chatRoutes);
router.use('/friends', friendRoutes);

export default router;
