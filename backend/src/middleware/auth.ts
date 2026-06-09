import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        name?: string;
        photoURL?: string;
      };
    }
  }
}

const prisma = new PrismaClient();

let firebaseInitialized = false;

export function initializeFirebase() {
  if (firebaseInitialized) {
    return;
  }

  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('Firebase not configured. Set FIREBASE_PROJECT_ID and FIREBASE_PRIVATE_KEY in .env');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Authentication not configured' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    await prisma.user.upsert({
      where: { id: uid },
      update: {
        email: email || '',
        name: name || null,
        photoURL: picture || null,
      },
      create: {
        id: uid,
        email: email || '',
        name: name || null,
        photoURL: picture || null,
      },
    });

    req.user = {
      uid,
      email: email || '',
      name: name || undefined,
      photoURL: picture || undefined,
    };

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    const code = error?.code || 'unknown';
    const message =
      code === 'auth/id-token-expired'
        ? 'Token expired. Please sign in again.'
        : code === 'auth/argument-error' || code === 'auth/invalid-argument'
          ? 'Invalid token or Firebase Admin misconfigured.'
          : 'Invalid or expired token';
    return res.status(401).json({ error: message, code });
  }
}
