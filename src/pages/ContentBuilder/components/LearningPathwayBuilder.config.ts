// Database configuration
export const DATABASE_TABLES = {
  COURSES: 'courses',
  POLICIES: 'policies',
  PROCEDURES: 'procedures',
  SDS_SHEETS: 'sds_sheets',
} as const;

export const DATABASE_FIELDS = {
  COURSES: 'id, title, description, difficulty, estimated_duration',
  POLICIES: 'id, title, description, policy_type',
  PROCEDURES: 'id, title, description, difficulty',
  SDS_SHEETS: 'id, chemical_name, description, hazard_level',
} as const;

// Content type configuration
export const CONTENT_TYPES = {
  COURSE: 'course',
  POLICY: 'policy',
  PROCEDURE: 'procedure',
  SDS: 'sds',
  ALL: 'all',
} as const;

export const CONTENT_TYPE_LABELS = {
  [CONTENT_TYPES.ALL]: 'All Types',
  [CONTENT_TYPES.COURSE]: 'Courses',
  [CONTENT_TYPES.POLICY]: 'Policies',
  [CONTENT_TYPES.PROCEDURE]: 'Procedures',
  [CONTENT_TYPES.SDS]: 'SDS Sheets',
} as const;

// Content type styling configuration
export const CONTENT_TYPE_STYLES = {
  [CONTENT_TYPES.COURSE]: 'bg-green-100 text-green-800',
  [CONTENT_TYPES.POLICY]: 'bg-blue-100 text-blue-800',
  [CONTENT_TYPES.PROCEDURE]: 'bg-purple-100 text-purple-800',
  [CONTENT_TYPES.SDS]: 'bg-orange-100 text-orange-800',
} as const;

// Smart organize section templates
export const SMART_ORGANIZE_SECTIONS = [
  {
    id: 1,
    name: 'Foundation',
    description: 'Essential concepts and basics',
    items: [],
    order: 1,
  },
  {
    id: 2,
    name: 'Core Learning',
    description: 'Main concepts and practical applications',
    items: [],
    order: 2,
  },
  {
    id: 3,
    name: 'Advanced Topics',
    description: 'Complex scenarios and best practices',
    items: [],
    order: 3,
  },
] as const;

// UI text constants
export const UI_TEXT = {
  TITLE: 'Learning Pathway Builder',
  AVAILABLE_CONTENT_TITLE: 'Available Content',
  AVAILABLE_CONTENT_DESCRIPTION: 'Select content to add to your pathway',
  PATHWAY_TITLE: 'Your Learning Pathway',
  PATHWAY_DESCRIPTION: 'Organized into logical sections for better learning flow',
  SEARCH_PLACEHOLDER: 'Search content...',
  ADD_BUTTON: 'Add',
  ADD_SECTION_BUTTON: 'Add Section',
  SMART_ORGANIZE_BUTTON: 'Smart Organize',
  ORGANIZING_BUTTON: 'Organizing...',
  NO_ITEMS_MESSAGE: 'No items in your pathway yet',
  NO_ITEMS_INSTRUCTION: 'Select content from the left panel to get started',
  NO_ITEMS_IN_SECTION: 'No items in this section',
  ADD_CONTENT_INSTRUCTION: 'Add content from the left panel',
  NO_CONTENT_FOUND: 'No content found matching your criteria',
  NO_CONTENT_AVAILABLE: 'No content available',
  LOADING_MESSAGE: 'Loading available content...',
  ADD_SECTION_MODAL_TITLE: 'Add New Section',
  SECTION_NAME_LABEL: 'Section Name',
  SECTION_NAME_PLACEHOLDER: 'Enter section name...',
  CANCEL_BUTTON: 'Cancel',
  ADD_SECTION_CONFIRM: 'Add Section',
  SMART_ORGANIZE_MODAL_TITLE: 'Smart Organize',
  SMART_ORGANIZE_DESCRIPTION: 'This will reorganize your pathway content automatically using AI. Your current organization will be replaced with an optimized structure.',
  SMART_ORGANIZE_CONFIRM: 'Do you want to continue?',
  CONTINUE_BUTTON: 'Continue',
  EDIT_SECTION_PROMPT: 'Edit section name:',
} as const;

// Timeout configuration
export const TIMEOUTS = {
  SMART_ORGANIZE_DELAY: 2000,
} as const;

// Default values
export const DEFAULTS = {
  CONTENT_TYPE_FILTER: 'all',
  NEW_SECTION_DESCRIPTION: '',
  EMPTY_ITEMS_ARRAY: [],
} as const;

// Icons and symbols
export const ICONS = {
  DIFFICULTY_BADGE: 'bg-gray-100 text-gray-800',
  SECTION_NUMBER: 'bg-blue-600 text-white',
  ITEM_NUMBER: 'bg-blue-500 text-white',
  MOVE_UP: '↑',
  MOVE_DOWN: '↓',
  EDIT: '✏️',
} as const;

// Content transformation configuration
export const CONTENT_TRANSFORMATIONS = {
  COURSE: (item: any) => ({
    ...item,
    id: item.id,
    title: item.title,
    description: item.data?.description,
    difficulty: item.difficulty,
    estimated_duration: item.estimated_duration,
    type: CONTENT_TYPES.COURSE,
    displayTitle: item.title,
  }),
  POLICY: (item: any) => ({
    ...item,
    id: item.id,
    title: item.title,
    description: item.data?.description,
    policy_type: item.policy_type,
    type: CONTENT_TYPES.POLICY,
    displayTitle: item.title,
  }),
  PROCEDURE: (item: any) => ({
    ...item,
    id: item.id,
    title: item.title,
    description: item.data?.description,
    difficulty: item.difficulty,
    type: CONTENT_TYPES.PROCEDURE,
    displayTitle: item.title,
  }),
  SDS: (item: any) => ({
    ...item,
    id: item.id,
    chemical_name: item.chemical_name,
    description: item.data?.description,
    hazard_level: item.hazard_level,
    type: CONTENT_TYPES.SDS,
    displayTitle: item.chemical_name,
  }),
} as const;
