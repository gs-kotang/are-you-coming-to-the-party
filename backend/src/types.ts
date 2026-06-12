export interface RsvpResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface InviteSummaryResponse {
  id: string;
  imageUrl: string;
  eventAt: string;
  expiresAt: string;
  isExpired: boolean;
  rsvpCount: number;
  createdAt: string;
}

export interface PaginatedInvitesResponse {
  invites: InviteSummaryResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InviteDetailResponse extends InviteSummaryResponse {
  shareUrl: string;
  rsvps: RsvpResponse[];
}

export interface PublicInviteResponse {
  id: string;
  imageUrl: string;
  eventAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface CreateInviteResponse {
  id: string;
  imageUrl: string;
  eventAt: string;
  expiresAt: string;
  shareUrl: string;
  createdAt: string;
}
