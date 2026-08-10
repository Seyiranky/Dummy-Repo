import axiosClient from './axiosClient';
import type { User } from '../types';

export const userApi = {
  getProfile: () => axiosClient.get<User>('/users/me').then((res) => res.data),

  updateProfile: (payload: Partial<User>) =>
    axiosClient.put<User>('/users/me', payload).then((res) => res.data),
};
