const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 7200000, // 2 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data',
    },
  },
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'changeme',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    sameSite: 'lax',
  },
});

module.exports = { sessionMiddleware, sessionStore };
