# Tracked Tools Workflow

## Overview

The Tracked Tools workflow allows users to flag tools they want to use, giving them priority when the tool becomes available. This system provides "first dibs" functionality for medical tools and supplies that are currently in cleaning, sterilization, or other unavailable states.

## Features

### 🎯 Priority-Based Tracking

- **High Priority**: Immediate notification when tool becomes available
- **Medium Priority**: Standard notification (default)
- **Low Priority**: Notification with lower priority than others

### 🔔 Smart Notifications

- Real-time notifications when tracked tools become available
- Priority-based notification system
- Automatic removal from tracking when tool becomes available
- Notification acknowledgment system

### 📊 Priority Queue Management

- First-come-first-served within same priority level
- Visual priority queue display
- Multiple doctors can track the same tool
- Clear indication of who has first priority

### 🔄 Status Monitoring

- Automatic monitoring of tool status changes
- Integration with sterilization workflow
- Real-time updates when tools complete cleaning cycles

## How It Works

### 1. Tracking a Tool

1. Navigate to the Inventory page (Tools or Supplies tab)
2. Click the track button (🔍) on any tool
3. Select priority level (High/Medium/Low)
4. Tool is added to your tracked items

### 2. Priority System

- **High Priority**: Red badge, immediate notification
- **Medium Priority**: Yellow badge, standard notification
- **Low Priority**: Blue badge, lower priority notification

### 3. Notification Process

1. Tool completes sterilization/cleaning cycle
2. System detects status change to "available"
3. Highest priority tracker receives notification
4. Notification appears in the bell icon in the header
5. User can acknowledge notification to claim the tool

### 4. Priority Queue

- Multiple doctors can track the same tool
- Priority is determined by:
  1. Priority level (High > Medium > Low)
  2. Timestamp (First come, first served within same priority)
- Queue is visible when multiple people track the same tool

## Components

### Core Service

- `trackedToolsService.ts` - Main service handling tracking logic
- `useTrackedTools.ts` - React hook for tracking functionality

### UI Components

- `TrackedToolsNotification.tsx` - Notification bell component
- `EnhancedTrackModal.tsx` - Modal for managing tracked tools
- `TrackedToolsDemo.tsx` - Demo component for testing

### Integration Points

- `InventoryActionButtons.tsx` - Track button in inventory table
- `InventoryHeaderSection.tsx` - Notification bell in header
- `usePhaseTransition.ts` - Status change monitoring

## Usage Examples

### Basic Tracking

```typescript
import { useTrackedTools } from '../hooks/inventory/useTrackedTools';

const { trackTool, untrackTool } = useTrackedTools();

// Track a tool with medium priority
trackTool('tool-123', 'medium');

// Untrack a tool
untrackTool('tool-123');
```

### Priority Management

```typescript
// Track with high priority for urgent cases
trackTool('scalpel-001', 'high');

// Track with low priority for non-urgent needs
trackTool('forceps-002', 'low');
```

### Notification Handling

```typescript
const { pendingNotifications, acknowledgeNotification } = useTrackedTools();

// Acknowledge a notification
acknowledgeNotification('notification-123');
```

## Business Rules

### Tracking Eligibility

- ✅ **Tools**: Can be tracked (medical instruments)
- ✅ **Supplies**: Can be tracked (consumables)
- ❌ **Equipment**: Cannot be tracked (office equipment)
- ❌ **Hardware**: Cannot be tracked (furniture, etc.)

### Priority Rules

1. **High Priority** takes precedence over Medium/Low
2. **Medium Priority** takes precedence over Low
3. **Timestamp** determines order within same priority level
4. **First to track** gets priority within same level

### Notification Rules

1. Only the **highest priority tracker** receives notification
2. Notification is sent when tool status changes to "available"
3. Tool is automatically removed from tracking when available
4. Notifications expire after 24 hours

### Status Monitoring

- Monitors sterilization workflow status changes
- Detects completion of cleaning cycles
- Integrates with existing tool status system
- Real-time updates without page refresh

## Technical Implementation

### Data Flow

1. User tracks tool → Stored in priority queue
2. Tool status changes → Service detects change
3. Notification created → Sent to highest priority tracker
4. User acknowledges → Tool removed from tracking

### State Management

- Uses Zustand store for inventory state
- Local state for notifications and tracking
- Real-time updates via service subscriptions
- Persistent tracking across sessions

### Performance Considerations

- Efficient priority queue sorting
- Debounced status change detection
- Automatic cleanup of expired notifications
- Minimal re-renders with React.memo

## Testing

### Demo Component

Use the `TrackedToolsDemo` component to test:

- Tracking tools with different priorities
- Simulating tool status changes
- Viewing priority queues
- Testing notification system

### Manual Testing

1. Track a tool with high priority
2. Track the same tool with medium priority (different user)
3. Simulate tool becoming available
4. Verify high priority user gets notification
5. Acknowledge notification
6. Verify tool is removed from tracking

## Future Enhancements

### Planned Features

- Email/SMS notifications
- Batch tracking capabilities
- Advanced priority algorithms
- Integration with scheduling system
- Mobile push notifications

### Potential Improvements

- Priority inheritance from patient urgency
- Automatic priority adjustment based on wait time
- Integration with OR scheduling
- Advanced analytics and reporting

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check if tool status actually changed
2. **Priority not working**: Verify priority levels are set correctly
3. **Tracking not persisting**: Check browser storage and state management
4. **Performance issues**: Monitor notification cleanup and status polling

### Debug Information

- Check browser console for tracking logs
- Use demo component to test functionality
- Verify sterilization workflow integration
- Monitor notification service status

## Support

For issues or questions about the tracked tools workflow:

1. Check this documentation
2. Use the demo component to test functionality
3. Review browser console for error messages
4. Contact development team for technical support
