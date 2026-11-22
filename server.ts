import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/db/connection.ts';
import { runMigrations } from './server/db/migrations.ts';
import { seedSystemMetadata } from './server/db/seed.ts';
import academicsRouter from './server/routes/academics.ts';
import attendanceRouter from './server/routes/attendance.ts';
import authRouter from './server/routes/auth.ts';
import backupsRouter from './server/routes/backups.ts';
import dashboardRouter from './server/routes/dashboard.ts';
import examsRouter from './server/routes/exams.ts';
import financeRouter from './server/routes/finance.ts';
import institutionsRouter from './server/routes/institutions.ts';
import notificationsRouter from './server/routes/notifications.ts';
import operationsRouter from './server/routes/operations.ts';
import studentsRouter from './server/routes/students.ts';
import teachersRouter from './server/routes/teachers.ts';
import usersRouter from './server/routes/users.ts';
import { getSessionSecret } from './server/security/crypto.ts';

async function startServer() {
  const db = getDb();
  runMigrations(db);
  seedSystemMetadata(db);
  getSessionSecret();

  const app = express();
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '4mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'AAKNOVA', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/institutions', institutionsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/admin', usersRouter);
  app.use('/api/academics', academicsRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/teachers', teachersRouter);
  app.use('/api/attendance', attendanceRouter);
  app.use('/api/finance', financeRouter);
  app.use('/api/exams', examsRouter);
  app.use('/api/operations', operationsRouter);
  app.use('/api/communications', notificationsRouter);
  app.use('/api/backups', backupsRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[AAKNOVA Server Error]', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AAKNOVA Enterprise Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
