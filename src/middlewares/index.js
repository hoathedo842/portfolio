import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import MongoStore from 'connect-mongo';
import csurf from 'csurf';
import dotenv from 'dotenv';
dotenv.config();

const applyMiddleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DB_MONGODB_URI,
        ttl: 60 * 60,
      }),
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      },
    }),
  );
  app.use(methodOverride('_method'));
  app.use(flash());
};

export default applyMiddleware;
