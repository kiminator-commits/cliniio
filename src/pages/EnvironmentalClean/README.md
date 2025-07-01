# Environmental Clean Efficiency Metrics

## Current Implementation

- Clean Rooms Count: Tracks daily room cleanings
- Dirty Rooms Count: Tracks transitions from Available to any dirty-type status

## Planned Efficiency Metrics

### 1. Room Turnover Time

- Time tracking from "In Progress" to "Available"
- Average cleaning time per room
- Target vs actual cleaning times
- Implementation: Track timestamps of status transitions

### 2. Room Utilization

- Monitor rooms in "Dirty" status for extended periods
- Track "Out of Service" duration
- Monitor "Low Inventory" resolution time
- Implementation: Add duration tracking to room status changes

### 3. Cleaning Efficiency

- Rooms cleaned per staff member
- Time of day patterns
- Process bottlenecks
- Implementation: Add staff assignment tracking and time-based analytics

### 4. Quality Metrics

- Track rooms returning to "Dirty" shortly after "Available"
- Monitor frequency of status changes
- Track multiple cleaning attempts
- Implementation: Add status change history and quality flags

### 5. Resource Optimization

- Staff allocation based on room status
- Inventory management impact
- Equipment usage tracking
- Implementation: Add resource allocation tracking

### 6. Negative Factors

- Extended non-available status duration
- Long cleaning times
- Frequent status changes
- Unused room transitions
- Implementation: Add warning thresholds and efficiency scores

## Data Structure Requirements

```typescript
interface RoomTransition {
  roomId: string;
  fromStatus: RoomStatusType;
  toStatus: RoomStatusType;
  timestamp: Date;
  staffId?: string;
  duration?: number;
  notes?: string;
}

interface EfficiencyMetrics {
  averageCleaningTime: number;
  staffEfficiency: {
    [staffId: string]: {
      roomsCleaned: number;
      averageTime: number;
    };
  };
  roomUtilization: {
    [roomId: string]: {
      availableTime: number;
      cleaningTime: number;
      downTime: number;
    };
  };
  qualityScore: number;
}
```

## Next Steps

1. Implement transition tracking with timestamps
2. Add staff assignment tracking
3. Create efficiency calculation algorithms
4. Build analytics dashboard
5. Set up warning thresholds
6. Implement reporting system
