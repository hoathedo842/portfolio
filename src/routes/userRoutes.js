import express from 'express';
import homeController from '../controllers/homeController.js';
import userController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
const router = express.Router();

router.get('/', homeController.getHomePage);

router.get('/dashboard', userController.getMyDashboard);

router.post('/dictionary', auth.authSignin, userController.createVocabulary);

router.get('/profile', auth.authSignin, userController.getProfilePage);

router.put('/profile', auth.authSignin, userController.updateProfile);

router.post(
  '/dictionary/import-excel',
  upload.single('file'),
  auth.authSignin,
  userController.importVocab,
);

router.get(
  '/dictionary/export-excel',
  auth.authSignin,
  userController.exportDictionary,
);

router.get('/dictionary/:id', auth.authSignin, userController.getVocabById);

router.put('/dictionary/:id', auth.authSignin, userController.updateVocab);

router.delete('/dictionary/:id', auth.authSignin, userController.deleteVocab);

router.get(
  '/change-password',
  auth.authSignin,
  userController.getChangePasswordPage,
);

router.post(
  '/change-password',
  auth.authSignin,
  auth.checkChangePasswordPermission,
  userController.changePassword,
);
export default router;
