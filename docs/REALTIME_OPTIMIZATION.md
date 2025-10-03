# Realtime Performance Optimizations

## Overview

This document outlines the optimizations implemented to address Supabase realtime performance issues that were consuming 90.5% of database time.

## Issues Identified

### 1. Excessive Realtime Subscriptions

- **Problem**: 860k+ calls to `realtime.list_changes`
- **Impact**: 90.5% of total database time
- **Root Cause**: Multiple overlapping subscriptions to the same tables

### 2. Subscription Management Overhead

- **Problem**: 196k+ subscription insertion queries
- **Impact**: 2.4% of total database time
- **Root Cause**: Each component creating its own channel instead of sharing

### 3. Schema Introspection Queries

- **Problem**: Multiple table definition queries running frequently
- **Impact**: 0.2% of total database time
- **Root Cause**: No caching of schema information

## Solutions Implemented

### 1. Centralized Realtime Manager (`RealtimeManager`)

- **Location**: `src/services/_core/realtimeManager.ts`
- **Purpose**: Consolidate all realtime subscriptions to prevent duplicates
- **Features**:
  - Single channel per table/event/filter combination
  - Automatic cleanup when no subscribers remain
  - Subscription deduplication
  - Centralized error handling

### 2. Updated Services

All realtime services now use the centralized manager:

- `InventorySupabaseService`
- `WorkflowRealtimeService`
- `BIRealtimeService`
- `useEnvironmentalCleanRealtime`

### 3. Enhanced Hook (`useRealtimeUpdates`)

- **Location**: `src/hooks/useRealtimeUpdates.ts`
- **Improvements**:
  - Uses centralized manager
  - Better cleanup handling
  - Prevents duplicate subscriptions

### 4. Supabase Configuration Limits

- **File**: `supabase/config.toml`
- **Settings**:
  ```toml
  [realtime]
  max_connections_per_client = 10
  max_channels_per_connection = 5
  ```

### 5. Monitoring and Debugging

- **Location**: `src/utils/_core/realtimeMonitor.ts`
- **Features**:
  - Real-time subscription statistics
  - Automatic issue detection
  - Development mode monitoring
  - Performance warnings

## Usage Examples

### Basic Subscription

```typescript
import { RealtimeManager } from '@/services/_core/realtimeManager';

const unsubscribe = RealtimeManager.subscribe('inventory_items', (payload) => {
  console.log('Inventory updated:', payload);
});

// Cleanup
unsubscribe();
```

### Hook Usage

```typescript
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const { isSubscribed } = useRealtimeUpdates({
  table: 'inventory_items',
  event: 'UPDATE',
  onUpdate: (payload) => {
    // Handle update
  },
});
```

### Monitoring

```typescript
import { RealtimeMonitor } from '@/utils/_core/realtimeMonitor';

// Get current stats
const stats = RealtimeMonitor.getCurrentStats();

// Check for issues
const issues = RealtimeMonitor.checkForIssues();

// Log detailed information
RealtimeMonitor.logDetailedStats();
```

## Performance Benefits

### Before Optimization

- **Channels**: 50+ individual channels
- **Subscriptions**: 860k+ realtime calls
- **DB Time**: 90.5% consumed by realtime
- **Memory**: Multiple duplicate subscriptions

### After Optimization

- **Channels**: Shared channels (max 20)
- **Subscriptions**: Consolidated, deduplicated
- **DB Time**: Expected 80%+ reduction
- **Memory**: Single subscription per table/event

## Best Practices

### 1. Always Use Centralized Manager

```typescript
// ❌ Don't create direct channels
supabase.channel('my_channel').subscribe();

// ✅ Use centralized manager
RealtimeManager.subscribe('table_name', callback);
```

### 2. Proper Cleanup

```typescript
const unsubscribe = RealtimeManager.subscribe('table', callback);

// Clean up when done
useEffect(() => {
  return unsubscribe;
}, []);
```

### 3. Monitor Usage

```typescript
// In development, monitor automatically
if (import.meta.env.DEV) {
  RealtimeMonitor.startMonitoring();
}
```

## Testing

### Verify Optimizations

1. Check browser console for subscription logs
2. Monitor realtime stats in development
3. Verify single channel per table
4. Check for proper cleanup on unmount

### Performance Metrics

- Active channels should be < 20
- Total subscribers should be < 100
- No duplicate table subscriptions
- Proper cleanup on component unmount

## Troubleshooting

### High Channel Count

```typescript
// Check current usage
RealtimeMonitor.logDetailedStats();

// Identify problematic tables
const issues = RealtimeMonitor.checkForIssues();
```

### Memory Leaks

```typescript
// Force cleanup (development only)
RealtimeManager.cleanup();
```

### Subscription Issues

```typescript
// Verify Supabase configuration
if (!isSupabaseConfigured()) {
  console.warn('Supabase not configured');
  return;
}
```

## Future Improvements

1. **Subscription Batching**: Group similar subscriptions
2. **Event Filtering**: More granular event filtering
3. **Connection Pooling**: Optimize connection management
4. **Metrics Dashboard**: Real-time performance monitoring
5. **Auto-scaling**: Dynamic subscription limits

## Monitoring Commands

### Development Console

```javascript
// Get realtime stats
RealtimeMonitor.getCurrentStats();

// Check for issues
RealtimeMonitor.checkForIssues();

// Log detailed info
RealtimeMonitor.logDetailedStats();

// Force cleanup
RealtimeManager.cleanup();
```

### Production Monitoring

- Monitor `realtime.list_changes` query frequency
- Track subscription insertion queries
- Watch for excessive channel creation
- Alert on high subscription counts
