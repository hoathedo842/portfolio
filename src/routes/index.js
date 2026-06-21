import authRouter from './authRoutes.js';
import adminRouter from './adminRoutes.js';
import homeRouter from './homeRoutes.js';
import userRouter from './userRoutes.js';

const applyRoutes = (app) => {
  app.use('/', homeRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/user', userRouter);
};

export default applyRoutes;
