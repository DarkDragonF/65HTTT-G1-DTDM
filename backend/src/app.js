const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, AppError } = require('./middlewares/errorHandler');

const app = express();

// ─── CORS Configuration ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Body Parsers ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Parser ──────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TLU Food API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── 404 Handler (unmatched routes) ─────────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// ─── Global Error Handler (must be last) ────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
