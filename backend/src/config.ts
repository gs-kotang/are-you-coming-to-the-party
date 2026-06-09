const r2Endpoint = process.env.R2_ENDPOINT || 'https://0f194a3a30bff7bd7f03ab3d1a0baf0a.r2.cloudflarestorage.com';

const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:5174';
const corsOrigins = corsOriginEnv.split(',').map((o) => o.trim()).filter(Boolean);

export const config = {
  port: process.env.PORT || 3002,
  corsOrigins: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:5174'],
  uploadsDir: process.env.UPLOADS_DIR || 'uploads',
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  useR2: !!(process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY),
  r2: {
    bucket: process.env.R2_BUCKET || null,
    accessKeyId: process.env.R2_ACCESS_KEY_ID || null,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || null,
    endpoint: r2Endpoint,
    region: process.env.R2_REGION || 'auto',
    publicUrl: process.env.R2_PUBLIC_URL || null,
  },
};
