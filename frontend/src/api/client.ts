import axios, { AxiosInstance } from 'axios';
import {
  CreateInviteResult,
  InviteDetail,
  InviteSummary,
  PublicInvite,
  Rsvp,
} from '../types';
import { auth } from '../firebase/config';

const apiBaseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const publicClient: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getShareUrl(path: string): string {
  return `${window.location.origin}${path}`;
}

export async function createInvite(photo: File, expiresAt: string): Promise<CreateInviteResult> {
  const data = new FormData();
  data.append('photo', photo);
  data.append('expiresAt', expiresAt);

  const response = await apiClient.post<CreateInviteResult>('/invites', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function fetchInvites(): Promise<InviteSummary[]> {
  const response = await apiClient.get<InviteSummary[]>('/invites');
  return response.data;
}

export async function fetchInvite(id: string): Promise<InviteDetail> {
  const response = await apiClient.get<InviteDetail>(`/invites/${id}`);
  return response.data;
}

export async function fetchPublicInvite(id: string): Promise<PublicInvite> {
  const response = await publicClient.get<PublicInvite>(`/public/invites/${id}`);
  return response.data;
}

export async function submitRsvp(inviteId: string, name: string): Promise<Rsvp> {
  const response = await publicClient.post<Rsvp>(`/public/invites/${inviteId}/rsvp`, { name });
  return response.data;
}
