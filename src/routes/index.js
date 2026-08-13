import authRouter from './authRoutes.js';
import adminRouter from './adminRoutes.js';
import homeRouter from './homeRoutes.js';
import userRouter from './userRoutes.js';
import contactRouter from './contactRoutes.js';

const applyRoutes = (app) => {
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/contact', contactRouter);

  app.use('/', homeRouter);
};

export default applyRoutes;
