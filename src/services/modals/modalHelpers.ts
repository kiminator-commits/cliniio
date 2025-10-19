/**
 * Modal helpers for consistent modal behavior across modules
 * Provides centralized modal state management through in-memory registry
 */

type ModalRegistry = Record<string, boolean>;
const modalRegistry: ModalRegistry = {};

/**
 * Open a modal by key
 * @param modalKey - Unique identifier for the modal
 */
export function openModal(modalKey: string): void {
  modalRegistry[modalKey] = true;
  console.info(`✅ Modal "${modalKey}" opened.`);
}

/**
 * Close a modal by key
 * @param modalKey - Unique identifier for the modal
 */
export function closeModal(modalKey: string): void {
  modalRegistry[modalKey] = false;
  console.info(`✅ Modal "${modalKey}" closed.`);
}

/**
 * Toggle modal state
 * @param modalKey - Unique identifier for the modal
 */
export function toggleModal(modalKey: string): void {
  const current = modalRegistry[modalKey] ?? false;
  modalRegistry[modalKey] = !current;
  console.info(`✅ Modal "${modalKey}" toggled to: ${!current}`);
}

/**
 * Return current modal props (open/closed)
 * @param modalKey - Unique identifier for the modal
 * @returns Object with isOpen boolean property
 */
export function getModalProps(modalKey: string): { isOpen: boolean } {
  return { isOpen: modalRegistry[modalKey] ?? false };
}
