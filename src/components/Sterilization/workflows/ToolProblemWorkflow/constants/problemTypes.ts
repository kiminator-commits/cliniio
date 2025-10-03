import { ProblemType } from '@/types/sterilizationTypes';

export interface ProblemTypeConfig {
  type: ProblemType;
  label: string;
  description: string;
}

export const PROBLEM_TYPES: ProblemTypeConfig[] = [
  {
    type: 'damaged',
    label: 'Damaged',
    description: 'Physical damage or broken parts',
  },
  {
    type: 'improperly_cleaned',
    label: 'Improperly Cleaned',
    description: 'Rust, residue, or staining',
  },
  {
    type: 'worn_out',
    label: 'Worn Out',
    description: 'Excessive wear or dull edges',
  },
  {
    type: 'other',
    label: 'Other',
    description: 'Other issues not listed above',
  },
];
