import axiosClient from './axiosClient';
import type { Gig, User } from '../types';

export const adminApi = {
  listUsers: () => axiosClient.get<User[]>('/admin/users').then((res) => res.data),

  listGigs: () => axiosClient.get<Gig[]>('/admin/gigs').then((res) => res.data),
};
