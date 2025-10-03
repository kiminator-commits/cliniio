# Knowledge Hub

A comprehensive learning management system for healthcare professionals to access training materials, educational resources, and track learning progress.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📁 Project Architecture

```
src/pages/KnowledgeHub/
├── components/                 # UI Components
│   ├── api-docs/              # API Documentation components
│   ├── table-components/      # Reusable table components
│   ├── tables/                # Specific table implementations
│   ├── ApiDocumentation.tsx   # Main API docs component
│   ├── ContentTable.tsx       # Main content wrapper
│   ├── CourseFilters.tsx      # Course filtering UI
│   ├── EmptyState.tsx         # Empty state display
│   └── RecentUpdatesPanel.tsx # Recent updates display
├── config/                    # Configuration files
├── docs/                      # Documentation
├── hooks/                     # Custom React hooks
├── providers/                 # Context providers
├── services/                  # Business logic services
├── store/                     # State management
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
├── models.ts                  # Data models
├── types.ts                   # Type definitions
└── index.tsx                  # Main Knowledge Hub page
```

## 🏗️ Architecture Overview

### **Separation of Concerns**

The Knowledge Hub follows a clean architecture pattern with clear separation between:

- **UI Layer** (`components/`) - Pure React components
- **Business Logic Layer** (`services/`) - Domain logic and operations
- **State Management Layer** (`store/`, `providers/`) - Application state
- **Data Layer** (`hooks/`) - Data fetching and processing
- **Configuration Layer** (`config/`) - App configuration
- **Utility Layer** (`utils/`) - Helper functions

### **State Management**

Uses Zustand for efficient state management with:

- Single source of truth
- Selective subscriptions
- Built-in persistence
- Redux DevTools integration

### **Type Safety**

Comprehensive TypeScript implementation with:

- Strict type checking
- Runtime validation with Yup
- Type guards and utilities
- Self-documenting interfaces

## 🧩 Core Components

### **Main Components**

#### `ApiDocumentation.tsx`

Interactive API documentation with tabs for:

- Swagger UI integration
- Authentication guide
- Code examples
- Error handling

#### `ContentTable.tsx`

Main content wrapper that:

- Manages table rendering logic
- Handles loading and error states
- Provides category filtering
- Supports lazy loading

#### `CourseFilters.tsx`

Filtering interface with:

- Tab navigation
- Search functionality
- Domain filtering
- Content type filtering

### **Table Components**

#### `CoursesTable.tsx`

Advanced course management with:

- Virtualized rendering for performance
- Real-time filtering and sorting
- Status management
- Permission-based actions

#### `LearningPathwaysTable.tsx`

Learning pathway display with:

- Progress tracking
- Milestone management
- Completion status

#### `ProceduresTable.tsx` & `PoliciesTable.tsx`

Specialized tables for procedures and policies with:

- Department-specific filtering
- Update tracking
- Compliance status

## 🔧 Custom Hooks

### **Data Management Hooks**

#### `useCourses.ts`

Comprehensive course management:

```typescript
const {
  activeCourseTab,
  filteredCourses,
  paginatedCourses,
  isCourseDueForRepeat,
  handleCourseAction,
  // ... more
} = useCourses(courseData);
```

#### `useTableData.ts`

Table data processing:

```typescript
const { filteredAndSortedItems } = useTableData({
  items,
  searchQuery,
  statusFilter,
  sortField,
  sortDirection,
  searchError,
});
```

### **UI Interaction Hooks**

#### `useTableFilters.ts`

Filter management:

```typescript
const {
  searchQuery,
  statusFilter,
  searchError,
  handleSearchChange,
  handleStatusFilterChange,
} = useTableFilters({ validateAndSanitizeSearch, currentUser });
```

#### `useTableSorting.ts`

Sorting functionality:

```typescript
const { sortField, sortDirection, handleSort, getSortIcon } = useTableSorting();
```

## 🛠️ Services Layer

### **CourseService.ts**

Pure business logic for course operations:

```typescript
// Get unique domains from courses
const domains = CourseService.getUniqueDomains(courses);

// Filter courses by criteria
const filtered = CourseService.filterCourses(courses, {
  searchQuery: 'infection control',
  selectedDomain: 'Safety',
  selectedContentType: 'Courses',
  activeTab: 'assigned',
});

// Sort courses
const sorted = CourseService.sortCourses(courses, {
  field: 'title',
  direction: 'asc',
});
```

## 📊 State Management

### **Zustand Store**

```typescript
// Store definition
interface KnowledgeHubStore {
  // State
  selectedCategory: string;
  selectedContent: ContentItem[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  setSelectedCategory: (category: string) => void;
  fetchContent: () => Promise<void>;
  deleteContent: (id: string) => void;
  updateContentStatus: (id: string, status: ContentStatus) => void;
}

// Usage in components
const { selectedCategory, deleteContent } = useSimplifiedKnowledgeHub();
```

## 🔒 Security & Permissions

### **Permission System**

```typescript
// Permission checks
const canDeleteContent = useCanDeleteContent();
const canUpdateStatus = useCanUpdateStatus();

// Permission guards
<PermissionGuard permission="canDeleteContent" fallback={<ReadOnlyView />}>
  <DeleteButton />
</PermissionGuard>
```

## 🧪 Testing

### **Component Testing**

```typescript
// Test component with mocked data
import { render, screen } from '@testing-library/react';
import { CoursesTable } from './CoursesTable';

test('renders courses table', () => {
  render(<CoursesTable items={mockCourses} />);
  expect(screen.getByText('Course Name')).toBeInTheDocument();
});
```

## 📈 Performance Optimizations

### **Virtualization**

- Virtualized table rendering for large datasets
- Lazy loading of table components
- Memoized calculations and filters

### **State Management**

- Selective subscriptions to prevent unnecessary re-renders
- Optimized Zustand store with shallow comparisons
- Efficient state updates with immutable patterns

### **Code Splitting**

- Lazy-loaded table components
- Dynamic imports for heavy dependencies
- Route-based code splitting

## 🔧 Configuration

### **Course Configuration**

```typescript
// config/courseConfig.ts
export const COURSE_TABS = [
  { id: 'assigned', label: 'Assigned' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'library', label: 'Library' },
  { id: 'completed', label: 'Completed' },
];

export const COURSE_TAG_COLORS = {
  Required: 'bg-red-100 text-red-800',
  Optional: 'bg-blue-100 text-blue-800',
  New: 'bg-green-100 text-green-800',
  Updated: 'bg-yellow-100 text-yellow-800',
};
```

## Integration

The Knowledge Hub integrates with the main application and provides access to training materials and documentation.
