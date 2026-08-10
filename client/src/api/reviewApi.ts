import axiosClient from './axiosClient';
import type { Review } from '../types';

export const reviewApi = {
  createReview: (payload: Omit<Review, 'id' | 'authorId'>) =>
    axiosClient.post<Review>('/reviews', payload).then((res) => res.data),

  listReviews: () => axiosClient.get<Review[]>('/reviews').then((res) => res.data),
};
