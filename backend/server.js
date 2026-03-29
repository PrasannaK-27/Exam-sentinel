require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { sessionMiddleware } = require('./config/session');
const { sequelize } = require('./models');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exam');
const questionRoutes = require('./routes/question');
const resultRoutes = require('./routes/result');
const adminRoutes = require('./routes/admin');
const registerSocketHandlers = require('./sockets');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
}));

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session ─────────────────────────────────────────────────────────────────
app.use(sessionMiddleware);

// Share session with Socket.IO
const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Socket.IO Handlers ───────────────────────────────────────────────────────
registerSocketHandlers(io);

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
};

start();
