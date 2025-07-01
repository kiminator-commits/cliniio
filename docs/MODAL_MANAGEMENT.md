# Modal Management System

This document describes the new modal management system for the inventory page, which separates modal business logic from UI components and provides a centralized configuration system.

## Overview

The modal management system consists of:

1. **Modal State Management Hook** (`useModalState`) - Manages modal visibility and state
2. **Modal Business Logic Hook** (`useInventoryModals`) - Handles modal operations and business logic
3. **Modal Configuration System** (`modalConfig.ts`) - Centralizes modal settings and form configurations
4. **Modal Content Component** (`ModalContent.tsx`) - Reusable modal content component
5. **Refactored Modal Components** - Examples of how to use the new system

## Architecture

### 1. Modal State Management (`useModalState`)

Located at `src/hooks/inventory/useModalState.ts`

This hook manages the state of all inventory modals:

- Modal visibility states
- Form data state
- Edit mode state
- Expanded sections state
- Modal open/close handlers

```typescript
const {
  showAddModal,
  closeAddModal,
  formData,
  isEditMode,
  expandedSections,
  openAddModal,
  openEditModal,
  // ... other state and handlers
} = useModalState();
```

### 2. Modal Business Logic (`useInventoryModals`)

Located at `src/hooks/inventory/useInventoryModals.ts`

This hook handles all modal business logic:

- Form change handlers
- Section toggle handlers
- Save/delete operations
- Search and filter operations
- Favorite and tracking operations

```typescript
const {
  handleFormChange,
  toggleSection,
  handleSaveItem,
  handleDeleteItem,
  toggleFavorite,
  // ... other business logic handlers
} = useInventoryModals();
```

### 3. Modal Configuration System (`modalConfig.ts`)

Located at `src/config/modalConfig.ts`

This system provides:

- Modal configuration objects (size, backdrop, etc.)
- Form field configurations
- Section configurations
- Validation rules
- Helper functions

```typescript
// Get modal configuration
const config = getModalConfig('ADD_ITEM');

// Get section configuration
const section = getSectionConfig('general');

// Validate form data
const errors = validateFormData(formData);
```

### 4. Modal Content Component (`ModalContent.tsx`)

Located at `src/components/Inventory/modals/ModalContent.tsx`

A reusable component that renders modal content based on configuration:

- Renders form fields based on field configuration
- Handles collapsible sections
- Provides consistent modal structure
- Supports custom content via children prop

```typescript
<ModalContent
  modalConfig={INVENTORY_MODAL_CONFIGS.ADD_ITEM}
  show={showAddModal}
  onHide={closeAddModal}
  formData={formData}
  isEditMode={isEditMode}
  expandedSections={expandedSections}
  toggleSection={toggleSection}
  handleFormChange={handleFormChange}
  onSave={handleSave}
  sections={ADD_EDIT_ITEM_SECTIONS}
/>
```

## Usage Examples

### Basic Modal Usage

```typescript
import { useInventoryModals } from '@/hooks/inventory/useInventoryModals';
import { INVENTORY_MODAL_CONFIGS, ADD_EDIT_ITEM_SECTIONS } from '@/config/modalConfig';
import ModalContent from '@/components/Inventory/modals/ModalContent';

const MyComponent = () => {
  const {
    showAddModal,
    closeAddModal,
    formData,
    isEditMode,
    expandedSections,
    handleFormChange,
    toggleSection,
    handleSaveItem,
  } = useInventoryModals();

  return (
    <ModalContent
      modalConfig={INVENTORY_MODAL_CONFIGS.ADD_ITEM}
      show={showAddModal}
      onHide={closeAddModal}
      formData={formData}
      isEditMode={isEditMode}
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      handleFormChange={handleFormChange}
      onSave={handleSaveItem}
      sections={ADD_EDIT_ITEM_SECTIONS}
    />
  );
};
```

### Opening Modals

```typescript
const { openAddModal, openEditModal } = useInventoryModals();

// Open add modal
const handleAddClick = () => {
  openAddModal();
};

// Open edit modal with item data
const handleEditClick = item => {
  openEditModal(item);
};
```

### Custom Modal Configuration

```typescript
// Create custom modal configuration
const customModalConfig = {
  id: 'custom-modal',
  title: 'Custom Modal',
  size: 'lg' as const,
  centered: true,
  backdrop: 'static' as const,
  keyboard: true,
  scrollable: true,
  className: 'custom-modal',
};

// Use with ModalContent
<ModalContent
  modalConfig={customModalConfig}
  show={showCustomModal}
  onHide={closeCustomModal}
  // ... other props
>
  {/* Custom content */}
  <div>Custom modal content</div>
</ModalContent>
```

## Benefits

1. **Separation of Concerns**: Modal business logic is separated from UI components
2. **Reusability**: Modal content component can be reused across different modals
3. **Configuration-Driven**: Modal behavior is controlled by configuration objects
4. **Type Safety**: Full TypeScript support with proper type definitions
5. **Maintainability**: Centralized modal management makes it easier to maintain and update
6. **Consistency**: All modals follow the same structure and behavior patterns
7. **Validation**: Built-in form validation based on field configurations

## Migration Guide

To migrate existing modals to the new system:

1. Replace direct state management with `useInventoryModals` hook
2. Replace modal components with `ModalContent` component
3. Use modal configurations from `modalConfig.ts`
4. Update form handling to use the new form change handlers
5. Implement validation using the `validateFormData` function

## Future Enhancements

1. **Modal Templates**: Pre-configured modal templates for common use cases
2. **Dynamic Field Rendering**: Support for dynamic field configurations
3. **Modal Chaining**: Support for modal-to-modal navigation
4. **Animation Support**: Built-in animation configurations
5. **Accessibility**: Enhanced accessibility features
6. **Internationalization**: Support for multi-language modal content
