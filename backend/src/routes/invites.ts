import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { upload, getFileUrl } from '../middleware/upload';
import { uploadToR2, generateUploadFilename } from '../storage';
import { config } from '../config';
import {
  CreateInviteResponse,
  InviteDetailResponse,
  InviteSummaryResponse,
} from '../types';

const router = Router();
const prisma = new PrismaClient();

function isExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}

function toSummary(invite: {
  id: string;
  imagePath: string;
  eventAt: Date;
  expiresAt: Date;
  createdAt: Date;
  _count: { rsvps: number };
}): InviteSummaryResponse {
  return {
    id: invite.id,
    imageUrl: getFileUrl(invite.imagePath),
    eventAt: invite.eventAt.toISOString(),
    expiresAt: invite.expiresAt.toISOString(),
    isExpired: isExpired(invite.expiresAt),
    rsvpCount: invite._count.rsvps,
    createdAt: invite.createdAt.toISOString(),
  };
}

function handlePhotoUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('photo')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: error.message });
    }
    if (error) {
      return res.status(400).json({ error: error.message || 'Invalid file upload' });
    }
    next();
  });
}

function inviteErrorMessage(error: unknown): string {
  const err = error as { code?: string; name?: string; message?: string; Code?: string };
  if (err?.code === 'P2022') {
    return 'Database schema is out of date. Run prisma migrate deploy on the server database.';
  }
  if (err?.message?.includes('R2_ENDPOINT')) {
    return 'Image storage misconfigured: set R2_ENDPOINT in server environment variables.';
  }
  if (err?.message?.includes('R2 storage is enabled')) {
    return 'Image storage misconfigured: check R2_BUCKET, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.';
  }
  if (err?.name === 'CredentialsProviderError' || err?.Code === 'AccessDenied' || err?.name === 'InvalidAccessKeyId') {
    return 'Image upload failed: check R2 credentials and R2_ENDPOINT match your Cloudflare account.';
  }
  return 'Failed to create invite';
}

router.post(
  '/',
  authenticate,
  handlePhotoUpload,
  async (req: Request, res: Response) => {
    try {
      const { expiresAt, eventAt } = req.body;

      if (!expiresAt) {
        return res.status(400).json({ error: 'expiresAt is required' });
      }

      if (!eventAt) {
        return res.status(400).json({ error: 'eventAt is required' });
      }

      const expiryDate = new Date(expiresAt);
      if (Number.isNaN(expiryDate.getTime())) {
        return res.status(400).json({ error: 'Invalid expiresAt date' });
      }

      const eventDate = new Date(eventAt);
      if (Number.isNaN(eventDate.getTime())) {
        return res.status(400).json({ error: 'Invalid eventAt date' });
      }

      if (expiryDate.getTime() <= Date.now()) {
        return res.status(400).json({ error: 'Expiry must be in the future' });
      }

      if (eventDate.getTime() <= Date.now()) {
        return res.status(400).json({ error: 'Event time must be in the future' });
      }

      if (eventDate.getTime() <= expiryDate.getTime()) {
        return res.status(400).json({ error: 'Event time must be after the RSVP deadline' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Photo is required' });
      }

      let imagePath: string;

      if (config.useR2 && req.file.buffer) {
        const key = generateUploadFilename(req.file.originalname);
        imagePath = await uploadToR2(req.file.buffer, key, req.file.mimetype, req.file.originalname);
      } else {
        imagePath = req.file.filename;
      }

      const invite = await prisma.invite.create({
        data: {
          userId: req.user!.uid,
          imagePath,
          eventAt: eventDate,
          expiresAt: expiryDate,
        },
      });

      const response: CreateInviteResponse = {
        id: invite.id,
        imageUrl: getFileUrl(invite.imagePath),
        eventAt: invite.eventAt.toISOString(),
        expiresAt: invite.expiresAt.toISOString(),
        shareUrl: `/invite/${invite.id}`,
        createdAt: invite.createdAt.toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create invite error:', error);
      res.status(500).json({ error: inviteErrorMessage(error) });
    }
  }
);

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const invites = await prisma.invite.findMany({
      where: { userId: req.user!.uid },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { rsvps: true } },
      },
    });

    res.json(invites.map(toSummary));
  } catch (error) {
    console.error('List invites error:', error);
    res.status(500).json({ error: 'Failed to list invites' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const invite = await prisma.invite.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.uid,
      },
      include: {
        rsvps: { orderBy: { createdAt: 'desc' } },
        _count: { select: { rsvps: true } },
      },
    });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    const response: InviteDetailResponse = {
      ...toSummary(invite),
      shareUrl: `/invite/${invite.id}`,
      rsvps: invite.rsvps.map((rsvp) => ({
        id: rsvp.id,
        name: rsvp.name,
        createdAt: rsvp.createdAt.toISOString(),
      })),
    };

    res.json(response);
  } catch (error) {
    console.error('Get invite error:', error);
    res.status(500).json({ error: 'Failed to get invite' });
  }
});

export default router;
