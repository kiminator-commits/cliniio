# Environmental Clean Supabase Integration

This document describes the Supabase integration for the Environmental Clean module.

## Overview

The Environmental Clean module has been fully integrated with Supabase, replacing all mock data with real database operations. The integration uses the existing `environmental_cleans_enhanced` table from the database schema.

## Database Tables

### Primary Table: `environmental_cleans_enhanced`

This table stores all environmental cleaning records with the following key fields:

- `id` - UUID primary key
- `room_id` - Room identifier (maps to Room.id)
- `room_name` - Display name for the room
- `status` - Cleaning status (pending, in_progress, completed, verified, failed, cancelled)
- `cleaning_type` - Type of cleaning (routine, deep, emergency, post_procedure)
- `scheduled_time` - When cleaning was scheduled
- `started_time` - When cleaning started
- `completed_time` - When cleaning was completed
- `quality_score` - Quality rating (0-1)
- `compliance_score` - Compliance rating (0-1)
- `checklist_items` - JSONB array of checklist items
- `completed_items` - JSONB array of completed items
- `failed_items` - JSONB array of failed items

### Analytics View: `environmental_cleaning_analytics`

This view provides aggregated analytics data for the Environmental Clean module.

## Service Layer

### EnvironmentalCleanService

The main service class that handles all Supabase operations:

```typescript
// Fetch rooms from database
const rooms = await EnvironmentalCleanService.fetchRooms();

// Update room status
await EnvironmentalCleanService.updateRoomStatus(roomId, 'in_progress');

// Complete room cleaning
await EnvironmentalCleanService.completeRoomCleaning(roomId);

// Fetch analytics
const analytics = await EnvironmentalCleanService.fetchAnalytics();
```

### Key Features

1. **Error Handling**: Comprehensive error handling with user-friendly messages
2. **Data Transformation**: Converts between database format and application models
3. **Audit Logging**: All operations are logged for compliance
4. **Type Safety**: Full TypeScript support with proper interfaces

## Store Integration

The Zustand store (`useEnvironmentalCleanStore`) has been updated to use Supabase:

- All data fetching operations now call Supabase instead of mock APIs
- Real-time updates are handled through Supabase subscriptions
- Error states are properly managed and displayed to users

## Real-time Updates

The module uses Supabase real-time subscriptions for live updates:

```typescript
// Subscribe to all environmental cleaning changes
const subscription = supabase
  .channel('environmental_cleans_realtime')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'environmental_cleans_enhanced',
    },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

## Status Mapping

The service maps between application status types and database status values:

| Application Status | Database Status |
| ------------------ | --------------- |
| `dirty`            | `pending`       |
| `in_progress`      | `in_progress`   |
| `clean`            | `completed`     |
| `biohazard`        | `failed`        |
| `out_of_service`   | `cancelled`     |

## Testing

### Manual Testing

Run the test script to verify the integration:

```bash
npx tsx scripts/testEnvironmentalCleanSupabase.ts
```

### Automated Testing

The existing test suite has been updated to mock the Supabase service calls, ensuring tests remain fast and reliable.

## Environment Variables

Ensure these environment variables are set:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Row Level Security (RLS)

The following RLS policies are applied to the `environmental_cleans_enhanced` table:

- **View Policy**: All authenticated users can view all environmental cleans
- **Manage Policy**: All authenticated users can manage environmental cleans

## Audit Logging

All operations are logged to multiple audit systems:

1. **Console Logging**: For development debugging
2. **Audit Logger**: Application-level audit logging
3. **Sterilization Log**: Integration with existing sterilization audit system
4. **Usage Tracking**: Analytics and usage metrics

## Error Handling

The service provides comprehensive error handling:

- **Network Errors**: Connection issues and timeouts
- **Authentication Errors**: Permission and authorization issues
- **Validation Errors**: Invalid data and input validation
- **Server Errors**: Database and server-side issues

Each error type provides user-friendly messages and appropriate recovery suggestions.

## Migration from Mock Data

The integration maintains backward compatibility:

- All existing components continue to work without changes
- The store interface remains the same
- Error boundaries handle any integration issues gracefully
- Fallback mechanisms ensure the application remains functional

## Performance Considerations

- **Caching**: The store caches data to minimize database calls
- **Pagination**: Large datasets are handled efficiently
- **Real-time**: Only necessary updates are pushed to clients
- **Optimistic Updates**: UI updates immediately, with rollback on errors

## Security

- **RLS Policies**: Database-level security controls
- **Input Validation**: All inputs are validated before database operations
- **Error Sanitization**: Sensitive information is not exposed in error messages
- **Audit Trail**: All operations are logged for security monitoring

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check environment variables and network connectivity
2. **Permission Errors**: Verify RLS policies and user authentication
3. **Data Mapping Errors**: Check status mapping and data transformation
4. **Real-time Issues**: Verify subscription configuration and network stability

### Debug Mode

Enable debug logging by setting:

```env
VITE_DEBUG_SUPABASE=true
```

This will log all Supabase operations to the console for debugging.

## Future Enhancements

1. **Offline Support**: Implement offline data synchronization
2. **Advanced Analytics**: Add more sophisticated analytics queries
3. **Batch Operations**: Optimize bulk operations for better performance
4. **Real-time Notifications**: Add push notifications for status changes
