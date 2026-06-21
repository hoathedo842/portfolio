import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Vocabulary from '../models/Vocabulary.js';
import upload from '../middlewares/upload.js';
import auth from '../middlewares/auth.js';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';

import adminController from '../controllers/adminController.js';

const router = express.Router();

/**
 * DASHBOARD ROUTES
 */
router.get(
  '/dashboard',
  auth.authSignin,
  auth.checkAdmin,
  adminController.getAdminDashboard,
);
router.get(
  '/users',
  auth.authSignin,
  auth.checkAdmin,
  adminController.getUsersPage,
);
router.get(
  '/projects',
  auth.authSignin,
  auth.checkAdmin,
  adminController.getProjectsPage,
);
router.get(
  '/dictionary',
  auth.authSignin,
  auth.checkAdmin,
  adminController.getDictionaryPage,
);
router.get(
  '/statistics',
  auth.authSignin,
  auth.checkAdmin,
  adminController.getStatisticsPage,
);

/**
 * USER PROFILE ROUTES
 */
router.get('/users/profile', auth.authSignin, adminController.getProfilePage);
router.put('/users/profile', auth.authSignin, adminController.updateProfile);

/**
 * USER MANAGEMENT ROUTES (ADMIN)
 */

router.get(
  '/users/create',
  auth.authSignin,
  auth.checkAdmin,
  adminController.getCreateUserPage,
);
router.post(
  '/users',
  auth.authSignin,
  auth.checkAdmin,
  auth.assignCreateUserRole,
  adminController.createUser,
);

router.get(
  '/users/:id',
  auth.authSignin,
  auth.checkAdmin,
  adminController.getUserById,
);

router.put(
  '/users/:id',
  auth.authSignin,
  auth.checkAdmin,
  auth.checkUpdateUserPermission,
  auth.assignUpdateUserRole,
  adminController.updateUser,
);

router.get(
  '/users/:id/change-password',
  auth.authSignin,
  auth.checkAdmin,
  adminController.getChangePasswordPage,
);

router.post(
  '/users/:id/change-password',
  auth.authSignin,
  auth.checkAdmin,
  auth.checkChangePasswordPermission,
  adminController.changePassword,
);

router.delete(
  '/users/:id',
  auth.authSignin,
  auth.checkAdmin,
  auth.checkDeleteUserPermission,
  adminController.deleteUser,
);

// project
router.post(
  '/projects',
  auth.authSignin,
  auth.checkSuperAdmin,
  upload.single('image'),
  adminController.createProject,
);

router.get(
  '/projects/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  adminController.getProjectById,
);

router.put(
  '/projects/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  upload.single('image'),
  adminController.updateProject,
);

router.delete(
  '/projects/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  adminController.deleteProject,
);

// dictionary
router.post(
  '/dictionary',
  auth.authSignin,
  auth.checkSuperAdmin,
  adminController.createVocabulary,
);

router.get(
  '/dictionary/export-excel',
  auth.authSignin,
  auth.checkSuperAdmin,
  adminController.exportDictionary,
);

router.get(
  '/dictionary/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  adminController.getVocabById,
);

router.put(
  '/dictionary/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  adminController.updateVocab,
);

router.delete(
  '/dictionary/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  adminController.deleteVocab,
);

router.post(
  '/dictionary/import-excel',
  upload.single('file'),
  auth.authSignin,
  auth.checkSuperAdmin,
  adminController.importVocab,
);

router.get('/users/:id/vocabularies', adminController.getUserVocabularies);

export default router;
