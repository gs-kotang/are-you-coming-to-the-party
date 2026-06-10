import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { initializeFirebase } from './middleware/auth';
import invitesRouter from './routes/invites';
import publicRouter from './routes/public';

initializeFirebase();

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

if (!config.useR2) {
  app.use('/uploads', express.static(path.join(process.cwd(), config.uploadsDir)));
}

app.use('/api/invites', invitesRouter);
app.use('/api/public', publicRouter);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Invite' AND column_name = 'eventAt'
    `;
    const hasEventAt = columns.length > 0;

    res.json({
      status: 'ok',
      storage: config.useR2 ? 'r2' : 'disk',
      r2EndpointConfigured: config.useR2 ? !!config.r2.endpoint : null,
      dbSchemaOk: hasEventAt,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', message: 'Database unreachable' });
  }
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (config.useR2) {
    console.log('Image storage: Cloudflare R2');
    if (!config.r2.endpoint) {
      console.error('WARNING: R2_ENDPOINT is not set. Image uploads will fail.');
    }
  } else {
    console.log(`Uploads directory: ${path.join(process.cwd(), config.uploadsDir)}`);
  }
});
