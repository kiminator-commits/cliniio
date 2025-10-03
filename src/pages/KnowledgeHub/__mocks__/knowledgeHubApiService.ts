import { ContentItem } from '../types';

// Mock data for testing
const mockContentItems: ContentItem[] = [
  {
    id: 'course-1',
    title: 'Basic Sterilization Techniques',
    category: 'Courses',
    description:
      'Fundamental course covering essential sterilization methods and best practices for healthcare environments.',
    status: 'draft',
    progress: 75,
    dueDate: '2024-02-15',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'course-2',
    title: 'Patient Safety Fundamentals',
    category: 'Courses',
    description:
      'Comprehensive training on patient safety protocols, risk assessment, and prevention strategies.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-01',
    lastUpdated: '2024-01-10',
  },
  {
    id: 'course-3',
    title: 'Advanced Infection Control',
    category: 'Courses',
    description:
      'In-depth course on infection prevention, control measures, and outbreak management.',
    status: 'published',
    progress: 100,
    dueDate: '2024-01-25',
    lastUpdated: '2024-01-25',
  },
  {
    id: 'course-4',
    title: 'Medical Equipment Operation',
    category: 'Courses',
    description:
      'Training on safe operation and maintenance of critical medical equipment and devices.',
    status: 'draft',
    progress: 45,
    dueDate: '2024-02-28',
    lastUpdated: '2024-01-18',
  },
  {
    id: 'course-5',
    title: 'Emergency Response Training',
    category: 'Courses',
    description:
      'Critical emergency response procedures and crisis management for healthcare professionals.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-15',
    lastUpdated: '2024-01-08',
  },
  {
    id: 'course-6',
    title: 'Quality Assurance in Healthcare',
    category: 'Courses',
    description:
      'Quality management systems, continuous improvement, and performance monitoring.',
    status: 'draft',
    progress: 90,
    dueDate: '2024-02-10',
    lastUpdated: '2024-01-22',
  },
  {
    id: 'course-7',
    title: 'Healthcare Documentation Standards',
    category: 'Courses',
    description:
      'Best practices for medical record keeping, documentation, and information management.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-30',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'course-8',
    title: 'Leadership in Healthcare',
    category: 'Courses',
    description:
      'Leadership skills, team management, and organizational development for healthcare leaders.',
    status: 'published',
    progress: 100,
    dueDate: '2024-01-30',
    lastUpdated: '2024-01-30',
  },
  {
    id: 'course-9',
    title: 'Patient Communication Skills',
    category: 'Courses',
    description:
      'Effective communication techniques for patient interaction, education, and support.',
    status: 'draft',
    progress: 60,
    dueDate: '2024-02-20',
    lastUpdated: '2024-01-19',
  },
  {
    id: 'course-10',
    title: 'Healthcare Compliance Training',
    category: 'Courses',
    description:
      'Regulatory compliance, legal requirements, and ethical standards in healthcare.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-25',
    lastUpdated: '2024-01-16',
  },
  {
    id: 'lp-1',
    title: 'Clinical Safety Fundamentals',
    category: 'Learning Pathways',
    description:
      'Complete pathway covering essential clinical safety protocols and procedures for healthcare professionals.',
    status: 'draft',
    progress: 65,
    dueDate: '2024-02-15',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'lp-2',
    title: 'Advanced Sterilization Techniques',
    category: 'Learning Pathways',
    description:
      'Comprehensive training on advanced sterilization methods and equipment maintenance.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-01',
    lastUpdated: '2024-01-10',
  },
  {
    id: 'lp-3',
    title: 'Emergency Response Protocols',
    category: 'Learning Pathways',
    description:
      'Critical emergency response training for medical staff in high-pressure situations.',
    status: 'published',
    progress: 100,
    dueDate: '2024-01-25',
    lastUpdated: '2024-01-25',
  },
  {
    id: 'lp-4',
    title: 'Patient Communication Skills',
    category: 'Learning Pathways',
    description:
      'Essential communication techniques for effective patient interaction and care.',
    status: 'draft',
    progress: 30,
    dueDate: '2024-02-28',
    lastUpdated: '2024-01-18',
  },
  {
    id: 'lp-5',
    title: 'Medical Equipment Training',
    category: 'Learning Pathways',
    description:
      'Comprehensive training on medical equipment operation and safety protocols.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-15',
    lastUpdated: '2024-01-08',
  },
  {
    id: 'lp-6',
    title: 'Infection Control Mastery',
    category: 'Learning Pathways',
    description:
      'Advanced infection control procedures and best practices for healthcare environments.',
    status: 'draft',
    progress: 85,
    dueDate: '2024-02-10',
    lastUpdated: '2024-01-22',
  },
  {
    id: 'lp-7',
    title: 'Quality Assurance in Healthcare',
    category: 'Learning Pathways',
    description:
      'Quality management systems and continuous improvement methodologies.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-30',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'lp-8',
    title: 'Leadership in Medical Settings',
    category: 'Learning Pathways',
    description:
      'Leadership skills and team management for healthcare professionals.',
    status: 'published',
    progress: 100,
    dueDate: '2024-01-30',
    lastUpdated: '2024-01-30',
  },
  {
    id: 'proc-1',
    title: 'Sterilization Protocol A',
    category: 'Procedures',
    description:
      'Standard sterilization procedure for surgical instruments using autoclave.',
    status: 'draft',
    progress: 75,
    dueDate: '2024-02-15',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'proc-2',
    title: 'Patient Safety Checklist',
    category: 'Procedures',
    description:
      'Comprehensive safety checklist for patient care and monitoring.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-01',
    lastUpdated: '2024-01-10',
  },
  {
    id: 'proc-3',
    title: 'Emergency Response Protocol',
    category: 'Procedures',
    description: 'Critical emergency response procedures for medical staff.',
    status: 'published',
    progress: 100,
    dueDate: '2024-01-25',
    lastUpdated: '2024-01-25',
  },
  {
    id: 'proc-4',
    title: 'Infection Control Procedure',
    category: 'Procedures',
    description: 'Standard infection control and prevention protocols.',
    status: 'draft',
    progress: 45,
    dueDate: '2024-02-28',
    lastUpdated: '2024-01-18',
  },
  {
    id: 'proc-5',
    title: 'Equipment Maintenance Protocol',
    category: 'Procedures',
    description:
      'Regular maintenance and calibration procedures for medical equipment.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-15',
    lastUpdated: '2024-01-08',
  },
  {
    id: 'proc-6',
    title: 'Quality Assurance Process',
    category: 'Procedures',
    description:
      'Quality control and assurance procedures for healthcare services.',
    status: 'draft',
    progress: 90,
    dueDate: '2024-02-10',
    lastUpdated: '2024-01-22',
  },
  {
    id: 'proc-7',
    title: 'Documentation Standards',
    category: 'Procedures',
    description:
      'Standard procedures for medical documentation and record keeping.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-30',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'proc-8',
    title: 'Staff Training Protocol',
    category: 'Procedures',
    description:
      'Comprehensive training procedures for new and existing staff.',
    status: 'published',
    progress: 100,
    dueDate: '2024-01-30',
    lastUpdated: '2024-01-30',
  },
  {
    id: 'pol-1',
    title: 'Patient Privacy Policy',
    category: 'Policies',
    description:
      'Comprehensive policy governing patient data protection and privacy rights.',
    status: 'draft',
    progress: 80,
    dueDate: '2024-02-15',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'pol-2',
    title: 'Staff Code of Conduct',
    category: 'Policies',
    description:
      'Professional standards and behavioral guidelines for all healthcare staff.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-01',
    lastUpdated: '2024-01-10',
  },
  {
    id: 'pol-3',
    title: 'Emergency Response Policy',
    category: 'Policies',
    description:
      'Protocols and procedures for emergency situations and crisis management.',
    status: 'published',
    progress: 100,
    dueDate: '2024-01-25',
    lastUpdated: '2024-01-25',
  },
  {
    id: 'pol-4',
    title: 'Infection Prevention Policy',
    category: 'Policies',
    description: 'Comprehensive infection control and prevention guidelines.',
    status: 'draft',
    progress: 60,
    dueDate: '2024-02-28',
    lastUpdated: '2024-01-18',
  },
  {
    id: 'pol-5',
    title: 'Equipment Safety Policy',
    category: 'Policies',
    description:
      'Safety protocols for medical equipment operation and maintenance.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-15',
    lastUpdated: '2024-01-08',
  },
  {
    id: 'pol-6',
    title: 'Quality Management Policy',
    category: 'Policies',
    description: 'Quality assurance and continuous improvement framework.',
    status: 'draft',
    progress: 95,
    dueDate: '2024-02-10',
    lastUpdated: '2024-01-22',
  },
  {
    id: 'pol-7',
    title: 'Documentation Policy',
    category: 'Policies',
    description: 'Standards for medical record keeping and documentation.',
    status: 'draft',
    progress: 0,
    dueDate: '2024-03-30',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'pol-8',
    title: 'Training and Development Policy',
    category: 'Policies',
    description:
      'Staff training requirements and professional development guidelines.',
    status: 'published',
    progress: 100,
    dueDate: '2024-01-30',
    lastUpdated: '2024-01-30',
  },
];

export async function getAllContentItems(): Promise<ContentItem[]> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Return mock data for testing
  return mockContentItems;
}

export async function updateUserContentStatus(params: {
  userId: string;
  contentItemId: string;
  status: string;
  progress: number;
  lastCompleted: string;
}): Promise<boolean> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Mock successful update
  console.log(
    `✅ Mock: Updated content status for user ${params.userId}, content ${params.contentItemId} to ${params.status} (${params.progress}%)`
  );
  return true;
}

export async function deleteContent(contentId: string): Promise<void> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Mock successful deletion
  console.log(
    `🗑️ Mock: Content with ID "${contentId}" would be deleted and returned to library`
  );

  // In a real implementation, this would remove the item from the database
  // For now, we just log the action since we're using static mock data
}
