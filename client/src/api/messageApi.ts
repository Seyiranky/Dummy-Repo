import axiosClient from './axiosClient';
import type { Message } from '../types';

export const messageApi = {
  sendMessage: (payload: { recipientId: string; body: string }) =>
    axiosClient.post<Message>('/messages', payload).then((res) => res.data),

  listMessages: (recipientId: string) =>
    axiosClient.get<Message[]>('/messages', { params: { recipientId } }).then((res) => res.data),
};
