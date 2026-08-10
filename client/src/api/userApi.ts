import axiosClient from './axiosClient';
import type { User } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  locationLat?: number;
  locationLng?: number;
}

export const userApi = {
  getProfile: () => axiosClient.get<User>('/users/me').then((res) => res.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    axiosClient.put<User>('/users/me', payload).then((res) => res.data),
};
