import axiosClient from './axiosClient';
import type { Candidate, Gig, GigStatus } from '../types';

export interface CreateGigPayload {
  title: string;
  description: string;
  budget: number;
  skillId: string;
  locationLat: number;
  locationLng: number;
}

export const gigApi = {
  createGig: (payload: CreateGigPayload) =>
    axiosClient.post<Gig>('/gigs', payload).then((res) => res.data),

  listGigs: (filters?: { status?: GigStatus; skillId?: string }) =>
    axiosClient.get<Gig[]>('/gigs', { params: filters }).then((res) => res.data),

  getGig: (id: string) => axiosClient.get<Gig>(`/gigs/${id}`).then((res) => res.data),

  getCandidates: (gigId: string) =>
    axiosClient.get<Candidate[]>(`/gigs/${gigId}/candidates`).then((res) => res.data),

  updateGig: (id: string, payload: Partial<CreateGigPayload & { status: GigStatus }>) =>
    axiosClient.put<Gig>(`/gigs/${id}`, payload).then((res) => res.data),
};
