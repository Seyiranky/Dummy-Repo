import axiosClient from './axiosClient';
import type { Gig } from '../types';

export const gigApi = {
  createGig: (payload: Omit<Gig, 'id' | 'clientId'>) =>
    axiosClient.post<Gig>('/gigs', payload).then((res) => res.data),

  listGigs: () => axiosClient.get<Gig[]>('/gigs').then((res) => res.data),

  getGig: (id: string) => axiosClient.get<Gig>(`/gigs/${id}`).then((res) => res.data),

  updateGig: (id: string, payload: Partial<Gig>) =>
    axiosClient.put<Gig>(`/gigs/${id}`, payload).then((res) => res.data),
};
