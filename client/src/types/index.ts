export type Role = 'worker' | 'client' | 'mentor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string;
  location?: { lat: number; lng: number };
  trustScore?: number;
}

export interface Skill {
  id: string;
  category: string;
  name: string;
}

export interface SkillTask {
  id: string;
  skillId: string;
  workerId: string;
  reviewerId?: string;
  evidenceUrl: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Gig {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  skillCategory: string;
  location: { lat: number; lng: number };
}

export interface Match {
  id: string;
  gigId: string;
  workerId: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
}

export interface Transaction {
  id: string;
  matchId: string;
  amount: number;
  status: 'initiated' | 'confirmed' | 'failed';
}

export interface Review {
  id: string;
  matchId: string;
  authorId: string;
  recipientId: string;
  rating: number;
  comment?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
}
