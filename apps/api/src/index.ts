import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes.js';
import { dailyReportsRouter } from './routes/daily-reports.routes.js';
import { followupsRouter } from './routes/followups.routes.js';
import { weeklyFocusesRouter } from './routes/weekly-focuses.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api', dailyReportsRouter);
app.use('/api', followupsRouter);
app.use('/api', weeklyFocusesRouter);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.info(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

