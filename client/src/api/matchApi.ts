import axiosClient from './axiosClient';
import type { Match } from '../types';

export const matchApi = {
  listMatches: () => axiosClient.get<Match[]>('/matches').then((res) => res.data),

  updateMatchStatus: (id: string, status: Match['status']) =>
    axiosClient.put<Match>(`/matches/${id}/status`, { status }).then((res) => res.data),
};
