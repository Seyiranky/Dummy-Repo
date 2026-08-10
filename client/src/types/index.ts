export type Role = 'worker' | 'client' | 'mentor' | 'admin';
export type SkillCategory = 'electronics_repair' | 'tailoring' | 'tutoring' | 'digital_web';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  trustScore: number;
}

export interface Skill {
  id: string;
  category: SkillCategory;
  name: string;
  description?: string | null;
}

export type SkillTaskStatus = 'pending' | 'approved' | 'rejected';

export interface SkillTask {
  id: string;
  workerId: string;
  skillId: string;
  reviewerId: string | null;
  evidenceUrl: string;
  notes?: string | null;
  status: SkillTaskStatus;
  reviewedAt: string | null;
  createdAt: string;
  skill?: Skill;
  worker?: User;
  reviewer?: User;
}

export type GigStatus = 'open' | 'matched' | 'completed' | 'cancelled';

export interface Gig {
  id: string;
  clientId: string;
  skillId: string;
  title: string;
  description: string;
  budget: number;
  locationLat: number;
  locationLng: number;
  status: GigStatus;
  createdAt: string;
  client?: User;
  skill?: Skill;
}

export interface Candidate {
  workerId: string;
  name: string;
  trustScore: number;
  distanceKm: number;
  score: number;
}

export type MatchStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface Match {
  id: string;
  gigId: string;
  workerId: string;
  status: MatchStatus;
  rankScore: number | null;
  createdAt: string;
  gig?: Gig;
  worker?: User;
  transaction?: Transaction;
  reviews?: Review[];
}

export type TransactionStatus = 'initiated' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  matchId: string;
  amount: number;
  status: TransactionStatus;
  provider: string;
  reference: string;
  createdAt: string;
}

export interface Review {
  id: string;
  matchId: string;
  authorId: string;
  recipientId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}
