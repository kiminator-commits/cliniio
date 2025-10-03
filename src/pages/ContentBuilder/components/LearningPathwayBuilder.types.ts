export interface PathwaySection {
  id: number;
  name: string;
  description: string;
  items: number[];
  order: number;
}

export interface AvailableContent {
  id: string;
  type: string;
  displayTitle: string;
  title?: string;
  description?: string;
  chemical_name?: string;
  difficulty?: string;
  estimated_duration?: number;
  policy_type?: string;
  hazard_level?: string;
  data?: { description?: string };
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | { description?: string };
}

// Database row interfaces
export interface CourseRow {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  estimated_duration?: number;
  data?: { description?: string };
}

export interface PolicyRow {
  id: string;
  title: string;
  description?: string;
  policy_type?: string;
  data?: { description?: string };
}

export interface ProcedureRow {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  data?: { description?: string };
}

export interface SDSRow {
  id: string;
  chemical_name: string;
  description?: string;
  hazard_level?: string;
  data?: { description?: string };
}

export type PathwayItem = AvailableContent & {
  pathwayId: number;
  order: number;
  sectionId?: number;
};

export interface LearningPathwayBuilderProps {
  contentType: {
    id: string;
    label: string;
    description: string;
    icon: string;
  };
  onPathwayChange: (sections: PathwaySection[], items: PathwayItem[]) => void;
  pathwaySections: PathwaySection[];
  selectedPathwayItems: PathwayItem[];
}
