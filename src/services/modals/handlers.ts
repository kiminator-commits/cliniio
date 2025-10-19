/**
 * Modal handler functions for general modal operations
 * Provides reusable handlers for common modal interactions
 */

/**
 * Handle saving modal form data
 * @param formData - The form data to save
 * @param onSave - Optional callback function to execute on save
 */
export function handleSave(formData: Record<string, any>, onSave?: (data: any) => void) {
  try {
    if (onSave) onSave(formData);
    console.info('Modal data saved:', formData);
  } catch (error) {
    console.error('Failed to save modal data:', error);
  }
}

/**
 * Handle toggling section expansion state
 * @param sectionId - The ID of the section to toggle
 * @param expandedSections - Set of currently expanded section IDs
 * @param setExpandedSections - Function to update expanded sections state
 */
export function handleToggleSection(sectionId: string, expandedSections: Set<string>, setExpandedSections: (s: Set<string>) => void) {
  const updated = new Set(expandedSections);
  if (updated.has(sectionId)) updated.delete(sectionId);
  else updated.add(sectionId);
  setExpandedSections(updated);
}

/**
 * Handle form field changes with state updates
 * @param field - The field name to update
 * @param value - The new value for the field
 * @param formState - Current form state object
 * @param setFormState - Function to update form state
 */
export function handleFormChangeWrapper(
  field: string,
  value: any,
  formState: Record<string, any>,
  setFormState: (state: Record<string, any>) => void
) {
  setFormState({ ...formState, [field]: value });
}
