export interface RsvpResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface InviteSummaryResponse {
  id: string;
  imageUrl: string;
  expiresAt: string;
  isExpired: boolean;
  rsvpCount: number;
  createdAt: string;
}

export interface InviteDetailResponse extends InviteSummaryResponse {
  shareUrl: string;
  rsvps: RsvpResponse[];
}

export interface PublicInviteResponse {
  id: string;
  imageUrl: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface CreateInviteResponse {
  id: string;
  imageUrl: string;
  expiresAt: string;
  shareUrl: string;
  createdAt: string;
}
