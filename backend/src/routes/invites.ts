import { Router, Request, Response } from 'express';
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
  expiresAt: Date;
  createdAt: Date;
  _count: { rsvps: number };
}): InviteSummaryResponse {
  return {
    id: invite.id,
    imageUrl: getFileUrl(invite.imagePath),
    expiresAt: invite.expiresAt.toISOString(),
    isExpired: isExpired(invite.expiresAt),
    rsvpCount: invite._count.rsvps,
    createdAt: invite.createdAt.toISOString(),
  };
}

router.post(
  '/',
  authenticate,
  upload.single('photo'),
  async (req: Request, res: Response) => {
    try {
      const { expiresAt } = req.body;

      if (!expiresAt) {
        return res.status(400).json({ error: 'expiresAt is required' });
      }

      const expiryDate = new Date(expiresAt);
      if (Number.isNaN(expiryDate.getTime())) {
        return res.status(400).json({ error: 'Invalid expiresAt date' });
      }

      if (expiryDate.getTime() <= Date.now()) {
        return res.status(400).json({ error: 'Expiry must be in the future' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Photo is required' });
      }

      let imagePath: string;

      if (config.useR2 && req.file.buffer) {
        const key = generateUploadFilename(req.file.originalname);
        imagePath = await uploadToR2(req.file.buffer, key, req.file.mimetype);
      } else {
        imagePath = req.file.filename;
      }

      const invite = await prisma.invite.create({
        data: {
          userId: req.user!.uid,
          imagePath,
          expiresAt: expiryDate,
        },
      });

      const response: CreateInviteResponse = {
        id: invite.id,
        imageUrl: getFileUrl(invite.imagePath),
        expiresAt: invite.expiresAt.toISOString(),
        shareUrl: `/invite/${invite.id}`,
        createdAt: invite.createdAt.toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create invite error:', error);
      res.status(500).json({ error: 'Failed to create invite' });
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
