// dotenvは開発環境でのみ使用
if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes.js';
import { dailyReportsRouter } from './routes/daily-reports.routes.js';
import { followupsRouter } from './routes/followups.routes.js';
import { weeklyFocusesRouter } from './routes/weekly-focuses.routes.js';
import { goalsRouter } from './routes/goals.routes.js';
import { syncIfNeeded } from './db/storage-adapter.js';
import { validateEnvironmentVariables } from './config/env.js';
import { getDatabase } from './db/database.js';

// 環境変数の検証
validateEnvironmentVariables();

// データベースの初期化（起動時にCloud Storageからダウンロード）
console.log('🔧 Initializing database...');
await getDatabase();
console.log('✅ Database initialized successfully');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());

// 変更検知アップロードとバッチアップロードの統合
app.use(async (req, res, next) => {
  await next();
  // 非同期で実行（リクエスト処理をブロックしない）
  syncIfNeeded().catch((error) => {
    console.error('Sync failed:', error);
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api', dailyReportsRouter);
app.use('/api', followupsRouter);
app.use('/api', weeklyFocusesRouter);
app.use('/api', goalsRouter);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
// 0.0.0.0でリッスンすることで、すべてのネットワークインターフェースでアクセス可能
// localhostでも127.0.0.1でもアクセスできる
app.listen(PORT, '0.0.0.0', () => {
  console.info(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

