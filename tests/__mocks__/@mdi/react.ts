import { createIconMock } from '../mockRegistry';

// Centralized mock for @mdi/react Icon component
const iconMock = createIconMock();

export const Icon = iconMock.Icon;
export default Icon;

// Ensure Icon is available as both named and default export
export { Icon as default };
