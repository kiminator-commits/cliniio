# Cleaning Schedule System

A comprehensive AI-powered cleaning schedule management system for Cliniio that automatically generates, assigns, and tracks cleaning tasks based on clinic operations and staff availability.

## 🎯 Overview

The cleaning schedule system addresses all the requirements you specified:

1. **Setup/Take Down**: Daily tasks when clinic is seeing patients
2. **Per Patient**: Triggered by dirty room status
3. **Weekly**: Admin-configurable schedule
4. **Public Spaces**: Admin-configurable schedule
5. **Deep Clean**: Admin-configurable schedule with AI assignment

## 🚀 Key Features

### **Smart Scheduling**

- **Automatic Generation**: Creates cleaning tasks based on configured rules
- **AI-Powered Assignment**: Optimally assigns tasks to available staff
- **Real-time Integration**: Connects with room status and staff schedules
- **Flexible Triggers**: Time-based, room status, admin decisions, and staff availability

### **Staff Assignment Algorithm**

The AI assignment system considers:

- **Workload Balance** (30% weight): Distributes tasks evenly
- **Performance History** (25% weight): Rewards reliable staff
- **Skill Match** (20% weight): Matches cleaning type to staff skills
- **Availability** (15% weight): Considers current work hours
- **Preferences** (10% weight): Respects staff cleaning preferences

### **Integration Points**

- **Home Dashboard**: Cleaning tasks appear alongside other daily tasks
- **Environmental Clean Page**: Dedicated cleaning management interface
- **Staff Scheduling**: Future integration with staff schedule system
- **Room Management**: Real-time room status monitoring
- **Gamification**: Points and rewards for completed cleaning tasks

## 📋 Cleaning Types

### 1. Setup/Take Down

- **Frequency**: Daily
- **Trigger**: Clinic operating hours
- **Priority**: Medium
- **Duration**: 30 minutes
- **Points**: 50
- **Description**: Daily clinic setup and closing procedures

### 2. Per Patient

- **Frequency**: Per patient visit
- **Trigger**: Room status changes to "dirty"
- **Priority**: High
- **Duration**: 45 minutes
- **Points**: 75
- **Description**: Cleaning required after each patient visit

### 3. Weekly

- **Frequency**: Weekly (configurable day)
- **Trigger**: Time-based (default: Friday 2 PM)
- **Priority**: Medium
- **Duration**: 120 minutes
- **Points**: 100
- **Description**: Weekly deep cleaning and maintenance

### 4. Public Spaces

- **Frequency**: Weekly (configurable day)
- **Trigger**: Admin decision (default: Wednesday 10 AM)
- **Priority**: Low
- **Duration**: 60 minutes
- **Points**: 60
- **Description**: Cleaning of waiting areas and common spaces

### 5. Deep Clean

- **Frequency**: Monthly (configurable day)
- **Trigger**: Admin decision (default: Saturday 8 AM)
- **Priority**: High
- **Duration**: 240 minutes
- **Points**: 150
- **Description**: Monthly intensive cleaning procedures

## 🛠️ Implementation

### **Database Schema**

The system uses several tables:

- `cleaning_schedules`: Main schedule records
- `cleaning_schedule_configs`: Configuration rules
- `staff_schedules`: Staff availability and work hours
- `room_status`: Room state tracking

### **Service Layer**

- `CleaningScheduleService`: Core business logic
- `useCleaningSchedule`: React hooks for UI integration
- `ScheduleConfiguration`: Admin configuration interface

### **Components**

- `CleaningScheduleCard`: Home dashboard display
- `ScheduleConfiguration`: Admin configuration panel
- Integration with existing task system

## 📱 Usage

### **For Staff (Home Dashboard)**

1. **View Tasks**: Cleaning tasks appear in the home dashboard
2. **Complete Tasks**: Click "Complete" to mark tasks as done
3. **Track Progress**: See overdue tasks and priority indicators
4. **Earn Points**: Gain points for completed cleaning tasks

### **For Admins (Configuration)**

1. **Access Settings**: Go to Settings > Cleaning Schedule Configuration
2. **Configure Rules**: Set frequency, points, duration, and triggers
3. **Assign Staff**: Configure staff roles and availability
4. **Test Generation**: Generate test schedules to verify configuration

### **Automatic Operation**

1. **Daily Generation**: System automatically creates daily schedules
2. **Room Monitoring**: Per-patient tasks triggered by room status changes
3. **Staff Assignment**: AI algorithm assigns tasks to optimal staff
4. **Integration**: Tasks appear in home dashboard for staff completion

## 🔧 Configuration

### **Schedule Configuration**

```typescript
interface CleaningScheduleConfig {
  type: CleaningType;
  frequency: CleaningFrequency;
  autoGenerate: boolean;
  enabled: boolean;
  defaultPoints: number;
  defaultDuration: number;
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  triggerConditions: CleaningTriggerCondition[];
  assignedRoles: string[];
}
```

### **Trigger Conditions**

- **Time-based**: Daily at specific time, weekly on specific day
- **Room Status**: Triggered by room status changes
- **Admin Decision**: Manual admin scheduling
- **Staff Schedule**: Based on staff availability

### **AI Assignment Factors**

```typescript
const assignmentScore =
  workloadScore * 0.3 +
  performanceScore * 0.25 +
  skillMatchScore * 0.2 +
  availabilityScore * 0.15 +
  preferenceScore * 0.1;
```

## 🔄 Integration with Existing Systems

### **Home Dashboard Integration**

```typescript
// Cleaning tasks automatically appear in home dashboard
const useHomeCleaningSchedule = () => {
  return useCleaningSchedule({
    autoGenerate: true,
    includeInHomeTasks: true,
    filters: {
      status: 'pending',
      dateRange: { start: today, end: today },
    },
  });
};
```

### **Task System Integration**

```typescript
// Convert cleaning schedules to home tasks
const convertScheduleToTask = (schedule: CleaningSchedule): Task => ({
  id: schedule.id,
  title: schedule.name,
  completed: schedule.status === 'completed',
  points: schedule.points,
  type: schedule.type,
  category: 'Environmental Cleaning',
  priority: schedule.priority,
  dueDate: schedule.dueDate,
  status: schedule.status === 'completed' ? 'completed' : 'pending',
});
```

### **Future Staff Scheduling Integration**

The system is designed to integrate with future staff scheduling:

- Staff availability from schedule system
- Work hours and days from staff profiles
- Role-based task assignment
- Workload balancing across shifts

## 📊 Monitoring and Analytics

### **Statistics Tracking**

- Total schedules created
- Completion rates
- Average completion times
- Staff performance metrics
- Overdue task tracking

### **Performance Metrics**

- Task completion efficiency
- Staff workload distribution
- Schedule adherence rates
- Cleaning quality indicators

## 🎯 Benefits

### **Operational Efficiency**

- **Automated Scheduling**: Reduces manual planning time
- **Optimal Assignment**: Ensures best staff for each task
- **Real-time Updates**: Immediate response to clinic changes
- **Consistent Quality**: Standardized cleaning procedures

### **Staff Experience**

- **Clear Expectations**: Staff know what's expected
- **Fair Distribution**: Balanced workload across team
- **Recognition**: Points and gamification rewards
- **Flexibility**: Respects staff preferences and skills

### **Management Oversight**

- **Comprehensive Tracking**: Complete visibility into cleaning operations
- **Configurable Rules**: Flexible scheduling based on clinic needs
- **Performance Insights**: Data-driven staff management
- **Quality Assurance**: Ensures cleaning standards are met

## 🚀 Future Enhancements

### **Advanced AI Features**

- **Predictive Scheduling**: Anticipate cleaning needs
- **Learning Algorithm**: Improve assignment accuracy over time
- **Smart Notifications**: Proactive task reminders
- **Quality Scoring**: Track cleaning effectiveness

### **Integration Expansions**

- **Patient Scheduling**: Direct integration with patient appointments
- **Inventory Management**: Automatic supply tracking
- **Maintenance System**: Coordinate with equipment maintenance
- **Compliance Tracking**: Regulatory requirement monitoring

### **Mobile Features**

- **Staff Mobile App**: On-the-go task management
- **Photo Documentation**: Before/after cleaning photos
- **Voice Notes**: Hands-free task notes
- **Offline Support**: Work without internet connection

This comprehensive cleaning schedule system provides a complete solution for managing clinic cleaning operations with intelligent automation, fair staff assignment, and seamless integration with the existing Cliniio platform.
