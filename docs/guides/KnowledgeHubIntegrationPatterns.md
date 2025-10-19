# Integration Patterns

## 🔄 Complete Workflow Examples

### **Course Management System**

```typescript
import { CliniioAPI } from '@cliniio/sdk';

class CourseManager {
  private api: CliniioAPI;

  constructor(token: string) {
    this.api = new CliniioAPI({
      baseURL: 'http://localhost:3001/v1',
      token,
    });
  }

  async assignCourseToUser(courseId: string, userId: string) {
    try {
      // Get course details
      const course = await this.api.content.getById(courseId);

      // Create user-specific content
      const userContent = await this.api.content.create({
        ...course.data,
        assignedTo: userId,
        status: 'Not Started',
        progress: 0,
      });

      return userContent;
    } catch (error) {
      console.error('Failed to assign course:', error);
      throw error;
    }
  }

  async trackProgress(contentId: string, progress: number) {
    try {
      const status = progress === 100 ? 'Completed' : 'In Progress';

      await this.api.content.updateProgress(contentId, {
        progress,
        status,
        timeSpent: this.calculateTimeSpent(),
      });

      // Send completion notification if needed
      if (status === 'Completed') {
        await this.sendCompletionNotification(contentId);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  }

  async generateReport(
    userId: string,
    dateRange: { from: string; to: string }
  ) {
    try {
      const progress = await this.api.users.getProgress(userId, {
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      });

      const analytics = await this.api.analytics.getDashboard({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      });

      return {
        userProgress: progress.data,
        analytics: analytics.data,
      };
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  private calculateTimeSpent(): number {
    // Implementation for calculating time spent
    return 30; // minutes
  }

  private async sendCompletionNotification(contentId: string) {
    // Implementation for sending notifications
    console.log(`Course ${contentId} completed!`);
  }
}
```

---

## 🏥 Healthcare Learning Management System

### **Department-Based Course Assignment**

```typescript
class HealthcareLMS {
  private api: CliniioAPI;

  constructor(token: string) {
    this.api = new CliniioAPI({
      baseURL: 'http://localhost:3001/v1',
      token,
    });
  }

  async assignRequiredCourses(department: string) {
    try {
      // Get department-specific requirements
      const requirements = await this.getDepartmentRequirements(department);

      // Get all users in department
      const users = await this.getUsersByDepartment(department);

      // Assign courses to each user
      const assignments = await Promise.all(
        users.map((user) => this.assignCoursesToUser(user.id, requirements))
      );

      return assignments;
    } catch (error) {
      console.error('Failed to assign required courses:', error);
      throw error;
    }
  }

  async trackCompliance(department: string) {
    try {
      const users = await this.getUsersByDepartment(department);
      const complianceData = [];

      for (const user of users) {
        const progress = await this.api.users.getProgress(user.id);
        const compliance = this.calculateCompliance(progress.data);

        complianceData.push({
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          compliance: compliance.percentage,
          overdueCourses: compliance.overdue,
          completedThisMonth: compliance.completedThisMonth,
        });
      }

      return complianceData;
    } catch (error) {
      console.error('Failed to track compliance:', error);
      throw error;
    }
  }

  async generateDepartmentReport(department: string, month: string) {
    try {
      const [startDate, endDate] = this.getMonthRange(month);

      const analytics = await this.api.analytics.getDashboard({
        dateFrom: startDate,
        dateTo: endDate,
        department,
      });

      const compliance = await this.trackCompliance(department);

      return {
        department,
        period: month,
        overview: analytics.data.overview,
        compliance: {
          average: this.calculateAverageCompliance(compliance),
          details: compliance,
        },
        topPerformers: this.getTopPerformers(compliance),
        needsAttention: this.getUsersNeedingAttention(compliance),
      };
    } catch (error) {
      console.error('Failed to generate department report:', error);
      throw error;
    }
  }

  private async getDepartmentRequirements(department: string) {
    // Implementation for getting department-specific course requirements
    const requirements = {
      Nursing: ['Infection Control', 'Patient Safety', 'Medication Management'],
      Emergency: ['Trauma Care', 'Emergency Procedures', 'Critical Care'],
      Surgery: [
        'Surgical Safety',
        'Sterilization Protocols',
        'Pre-op Procedures',
      ],
    };

    return requirements[department] || [];
  }

  private async getUsersByDepartment(department: string) {
    // Implementation for getting users by department
    // This would typically use a different endpoint or filter
    return [];
  }

  private async assignCoursesToUser(userId: string, courseTitles: string[]) {
    // Implementation for assigning specific courses to a user
    return [];
  }

  private calculateCompliance(progress: any) {
    // Implementation for calculating compliance percentage
    return {
      percentage: 85,
      overdue: 2,
      completedThisMonth: 5,
    };
  }

  private getMonthRange(month: string): [string, string] {
    // Implementation for getting month start and end dates
    return ['2024-01-01', '2024-01-31'];
  }

  private calculateAverageCompliance(complianceData: any[]): number {
    if (complianceData.length === 0) return 0;
    const total = complianceData.reduce(
      (sum, item) => sum + item.compliance,
      0
    );
    return total / complianceData.length;
  }

  private getTopPerformers(complianceData: any[]): any[] {
    return complianceData
      .sort((a, b) => b.compliance - a.compliance)
      .slice(0, 5);
  }

  private getUsersNeedingAttention(complianceData: any[]): any[] {
    return complianceData.filter((item) => item.compliance < 70);
  }
}
```

---

## 📱 Mobile App Integration

### **Offline-First Course Viewer**

```typescript
class OfflineCourseViewer {
  private api: CliniioAPI;
  private db: IDBDatabase;
  private syncQueue: Array<{ action: string; data: any; timestamp: number }> =
    [];

  constructor(token: string) {
    this.api = new CliniioAPI({
      baseURL: 'http://localhost:3001/v1',
      token,
    });
    this.initDatabase();
  }

  async loadCourse(courseId: string) {
    try {
      // Try to get from local storage first
      let course = await this.getCourseFromLocal(courseId);

      if (!course) {
        // Fetch from API and cache
        course = await this.api.content.getById(courseId);
        await this.cacheCourse(course.data);
      }

      return course;
    } catch (error) {
      console.error('Failed to load course:', error);
      throw error;
    }
  }

  async updateProgressOffline(courseId: string, progress: number) {
    try {
      // Update local storage immediately
      await this.updateLocalProgress(courseId, progress);

      // Add to sync queue
      this.syncQueue.push({
        action: 'updateProgress',
        data: { courseId, progress },
        timestamp: Date.now(),
      });

      // Try to sync if online
      if (navigator.onLine) {
        this.syncOfflineChanges();
      }

      return { success: true, synced: false };
    } catch (error) {
      console.error('Failed to update progress offline:', error);
      throw error;
    }
  }

  async syncOfflineChanges() {
    if (this.syncQueue.length === 0) return;

    try {
      const itemsToSync = [...this.syncQueue];

      for (const item of itemsToSync) {
        try {
          if (item.action === 'updateProgress') {
            await this.api.content.updateProgress(item.data.courseId, {
              progress: item.data.progress,
            });

            // Remove from queue on successful sync
            this.syncQueue = this.syncQueue.filter(
              (queueItem) => queueItem.timestamp !== item.timestamp
            );
          }
        } catch (error) {
          console.error(`Failed to sync ${item.action}:`, error);
          // Keep in queue for retry
        }
      }
    } catch (error) {
      console.error('Failed to sync offline changes:', error);
    }
  }

  async downloadCourseForOffline(courseId: string) {
    try {
      const course = await this.api.content.getById(courseId);

      // Download course content (videos, documents, etc.)
      const content = await this.downloadCourseContent(course.data);

      // Cache everything locally
      await this.cacheCourse(course.data);
      await this.cacheCourseContent(courseId, content);

      return { success: true, size: this.calculateDownloadSize(content) };
    } catch (error) {
      console.error('Failed to download course for offline:', error);
      throw error;
    }
  }

  private async initDatabase() {
    // Implementation for IndexedDB initialization
  }

  private async getCourseFromLocal(courseId: string) {
    // Implementation for getting course from local storage
    return null;
  }

  private async cacheCourse(course: any) {
    // Implementation for caching course data
  }

  private async updateLocalProgress(courseId: string, progress: number) {
    // Implementation for updating local progress
  }

  private async downloadCourseContent(course: any) {
    // Implementation for downloading course content
    return {};
  }

  private async cacheCourseContent(courseId: string, content: any) {
    // Implementation for caching course content
  }

  private calculateDownloadSize(content: any): string {
    // Implementation for calculating download size
    return '25.5 MB';
  }
}
```

---

## 🔗 Webhook Integration

### **External System Integration**

```typescript
class WebhookIntegration {
  private api: CliniioAPI;
  private webhookUrl: string;
  private webhookSecret: string;

  constructor(token: string, webhookUrl: string, webhookSecret: string) {
    this.api = new CliniioAPI({
      baseURL: 'http://localhost:3001/v1',
      token,
    });
    this.webhookUrl = webhookUrl;
    this.webhookSecret = webhookSecret;
  }

  async setupWebhooks() {
    try {
      // Create webhook for course completions
      await this.api.webhooks.create({
        url: `${this.webhookUrl}/course-completed`,
        events: ['content.completed'],
        secret: this.webhookSecret,
      });

      // Create webhook for progress updates
      await this.api.webhooks.create({
        url: `${this.webhookUrl}/progress-updated`,
        events: ['user.progress_updated'],
        secret: this.webhookSecret,
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to setup webhooks:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, signature: string) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const { event, data } = payload;

      switch (event) {
        case 'content.completed':
          await this.handleCourseCompleted(data);
          break;
        case 'user.progress_updated':
          await this.handleProgressUpdated(data);
          break;
        default:
          console.log(`Unknown webhook event: ${event}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to handle webhook:', error);
      throw error;
    }
  }

  private async handleCourseCompleted(data: any) {
    // Implementation for handling course completion
    // This could trigger external system updates, notifications, etc.
    console.log(`Course completed: ${data.contentId} by user ${data.userId}`);
  }

  private async handleProgressUpdated(data: any) {
    // Implementation for handling progress updates
    // This could update external systems, send notifications, etc.
    console.log(
      `Progress updated: ${data.progress}% for course ${data.contentId}`
    );
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    // Implementation for verifying webhook signature
    // This would use crypto to verify the signature matches the payload
    return true;
  }
}
```

---

## 🔗 Related Documentation

- **[Basic Requests](./basic-requests.md)** - Simple API calls
- **[React Components](./react-components.md)** - React-specific examples
- **[API Reference](../api/README.md)** - Complete endpoint documentation
- **[SDK Usage](../guides/sdk-usage.md)** - Using official SDKs
