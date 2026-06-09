import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getFileUrl } from '../middleware/upload';
import { PublicInviteResponse } from '../types';

const router = Router();
const prisma = new PrismaClient();

function isExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

router.get('/invites/:id', async (req: Request, res: Response) => {
  try {
    const invite = await prisma.invite.findUnique({
      where: { id: req.params.id },
    });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    const response: PublicInviteResponse = {
      id: invite.id,
      imageUrl: getFileUrl(invite.imagePath),
      eventAt: invite.eventAt.toISOString(),
      expiresAt: invite.expiresAt.toISOString(),
      isExpired: isExpired(invite.expiresAt),
    };

    res.json(response);
  } catch (error) {
    console.error('Public invite error:', error);
    res.status(500).json({ error: 'Failed to load invite' });
  }
});

router.post('/invites/:id/rsvp', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const normalizedName = normalizeName(name);
    if (normalizedName.length < 1 || normalizedName.length > 100) {
      return res.status(400).json({ error: 'Name must be between 1 and 100 characters' });
    }

    const invite = await prisma.invite.findUnique({
      where: { id: req.params.id },
    });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (isExpired(invite.expiresAt)) {
      return res.status(410).json({ error: 'This invite has expired. RSVPs are closed.' });
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        inviteId: invite.id,
        name: normalizedName,
      },
    });

    res.status(201).json({
      id: rsvp.id,
      name: rsvp.name,
      createdAt: rsvp.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Failed to save RSVP' });
  }
});

export default router;
