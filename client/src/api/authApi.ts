import axiosClient from './axiosClient';
import type { Role } from '../types';

export interface AuthResponse {
  token: string;
  userId: string;
  role: Role;
}

export const authApi = {
  register: (payload: { name: string; email: string; password: string; role: Role }) =>
    axiosClient.post<AuthResponse>('/auth/register', payload).then((res) => res.data),

  login: (payload: { email: string; password: string }) =>
    axiosClient.post<AuthResponse>('/auth/login', payload).then((res) => res.data),

  googleLogin: (payload: { name: string; email: string; role: Role }) =>
    axiosClient.post<AuthResponse>('/auth/google', payload).then((res) => res.data),
};
