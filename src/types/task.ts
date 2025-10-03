export interface Task {
  id: string; // Must be a non-empty string
  title: string;
  description?: string;
  completed: boolean;
  points: number;
  category: 'cleaning' | 'compliance' | 'training' | 'maintenance'; // Explicit enum
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
}
