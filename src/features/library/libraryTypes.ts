// Library feature types - consolidated from LibraryRoot.tsx and ContentCard.tsx

export interface ContentItem {
  id: string;
  title: string;
  category: string;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  dueDate?: string;
  progress?: number;
  department?: string;
  lastUpdated?: string;
  source?: string;
  description: string;
  level: string;
  duration: string;
  points: number;
  publishedDate?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  isFavourite?: boolean;
}

export interface LibraryCategory {
  id: string;
  name: string;
  description?: string;
}

export interface SDSSheet {
  id: string;
  title: string;
  chemicalName: string;
  casNumber?: string;
  hazards?: string[];
}
