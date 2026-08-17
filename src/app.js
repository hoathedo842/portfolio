import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import setupViewEngine from './config/viewEngine.js';
import setupStaticFiles from './config/staticFiles.js';

import applyMiddleware from './middlewares/index.js';
import applyRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

setupViewEngine(app, __dirname);
applyMiddleware(app);
setupStaticFiles(app, __dirname);
applyRoutes(app);

export default app;
