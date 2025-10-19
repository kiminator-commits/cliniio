# Help & Assistant Page

## Purpose

This page serves as the future home for AI-powered assistance and support functionality in Cliniio.

## Current Status

- **Status**: Placeholder active, AI integration pending
- **Route**: `/assistant`
- **Access**: Floating help button in bottom-right corner of all pages

## Important Notes for Development

### ⚠️ DO NOT REMOVE DURING CLEANUP

This page and its route are intentionally preserved during cleanup operations. The placeholder serves as:

1. **User Experience**: Provides users with a clear indication that AI assistance is coming
2. **Development Planning**: Shows the intended features and functionality
3. **Route Preservation**: Ensures the `/assistant` route remains available
4. **Floating Help Button**: Maintains consistent help access across all pages

### Future AI Integration

When AI services are connected, this page will be enhanced with:

- **Smart Chat Interface**: Real-time AI-powered chat support
- **Contextual Help**: AI that understands user's current task
- **Smart Suggestions**: Proactive workflow recommendations
- **Knowledge Base Integration**: Access to Cliniio documentation and procedures

### Files to Preserve

- `src/pages/Assistant/index.tsx` - Main page component
- `src/pages/Assistant/README.md` - This documentation file
- `src/components/ui/FloatingHelpButton.tsx` - Floating help button component
- Route in `src/App.tsx` - `/assistant` route
- FloatingHelpButton in `src/App.tsx` - Global help button

### Cleanup Guidelines

When performing code cleanup:

1. ✅ Keep the Assistant route in `App.tsx`
2. ✅ Keep the FloatingHelpButton in `App.tsx`
3. ✅ Keep the `src/pages/Assistant/` directory
4. ✅ Keep the `src/components/ui/FloatingHelpButton.tsx` component
5. ✅ Update this README if making changes
6. ❌ Do not remove without implementing full AI assistant functionality

## Technical Details

- **Component**: `Assistant` (default export)
- **Layout**: Uses `PageLayout` component for consistency
- **Styling**: Follows Cliniio design system with `#4ECDC4` primary color
- **Icons**: Uses React Icons (FaQuestionCircle, FaRobot, etc.)
- **Responsive**: Mobile-friendly design with grid layouts
- **Access**: Floating button in bottom-right corner, visible on all pages except login

## Integration Points

- **Floating Button**: Global help button in bottom-right corner
- **Routing**: Protected route requiring authentication
- **Layout**: Consistent with other Cliniio pages
- **Error Handling**: Inherits from PageLayout error boundaries
