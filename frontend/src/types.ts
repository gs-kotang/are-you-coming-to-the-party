export interface Rsvp {
  id: string;
  name: string;
  createdAt: string;
}

export interface InviteSummary {
  id: string;
  imageUrl: string;
  eventAt: string;
  expiresAt: string;
  isExpired: boolean;
  rsvpCount: number;
  createdAt: string;
}

export interface InviteDetail extends InviteSummary {
  shareUrl: string;
  rsvps: Rsvp[];
}

export interface PublicInvite {
  id: string;
  imageUrl: string;
  eventAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface CreateInviteResult {
  id: string;
  imageUrl: string;
  eventAt: string;
  expiresAt: string;
  shareUrl: string;
  createdAt: string;
}
