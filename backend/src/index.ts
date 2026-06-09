import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { initializeFirebase } from './middleware/auth';
import invitesRouter from './routes/invites';
import publicRouter from './routes/public';

initializeFirebase();

const app = express();

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

if (!config.useR2) {
  app.use('/uploads', express.static(path.join(process.cwd(), config.uploadsDir)));
}

app.use('/api/invites', invitesRouter);
app.use('/api/public', publicRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(config.useR2 ? 'Image storage: Cloudflare R2' : `Uploads directory: ${path.join(process.cwd(), config.uploadsDir)}`);
});
