export interface Task {
  id: string;
  title: string;
  completed: boolean;
  points?: number;
  type: string; // e.g., "Training Task", "Required Task"
  category: string; // e.g., "Policy Updates"
  dueDate: string; // Format: "MM/DD/YYYY"
  status: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
