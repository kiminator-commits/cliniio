# 📋 Service Responsibility Documentation & Migration Priorities - Phase 1.3

## Executive Summary

**Service Responsibilities Mapped**: Clear ownership and boundaries defined for all major services
**Migration Guides Created**: Step-by-step migration instructions for high-impact services
**Service Standards Established**: Consistent patterns and usage guidelines documented

## 🎯 Service Responsibility Matrix

### **Primary Services (Target Services)**

#### 1. **InventoryServiceFacade** ✅ PRIMARY SERVICE
```typescript
// Location: src/services/inventory/InventoryServiceFacade.ts
// Pattern: Singleton Facade with Business Logic
// Status: ✅ READY FOR MIGRATION

RESPONSIBILITIES:
├── 📦 Inventory CRUD Operations (createItem, updateItem, deleteItem, getItem)
├── 🔍 Search & Filtering (searchItems, filterItems, getItemsByCategory)
├── 📊 Analytics & Reporting (getInventoryAnalytics, getInventoryStats)
├── 🔄 Bulk Operations (bulkCreate, bulkUpdate, bulkDelete)
├── 📈 Category Management (getCategories, createCategory, updateCategory)
├── 🏷️ Status Management (updateItemStatus, getItemStatus)
├── 💾 Cache Management (5-minute TTL, automatic invalidation)
├── 📡 Real-time Updates (subscription management, live data sync)
└── 🎯 Performance Monitoring (response time tracking, error logging)

API INTERFACE:
- getAllItems(filters?: InventoryFilters): Promise<InventoryResponse>
- createItem(item: InventoryItem): Promise<InventoryCreateResponse>
- updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryUpdateResponse>
- deleteItem(id: string): Promise<InventoryDeleteResponse>
- searchItems(query: string, options?: SearchOptions): Promise<InventoryResponse>
- bulkDeleteItems(ids: string[]): Promise<InventoryBulkResponse>
- getInventoryAnalytics(): Promise<InventoryAnalytics>
- getCategories(): Promise<InventoryCategory[]>
```

#### 2. **SecureAuthService** ✅ PRIMARY SERVICE
```typescript
// Location: src/services/secureAuthService.ts
// Pattern: Class-based Service with Rate Limiting
// Status: ✅ READY FOR MIGRATION

RESPONSIBILITIES:
├── 🔐 Authentication (secureLogin, validateToken, refreshToken)
├── 🛡️ Security Features (CSRF protection, rate limiting, input validation)
├── 🔑 Token Management (access tokens, refresh tokens, token validation)
├── 📊 Rate Limiting (5 attempts per 15 minutes per email, 10 per IP)
├── 🚨 Threat Detection (suspicious activity, bot detection)
├── 📝 Audit Logging (authentication events, security incidents)
├── 🔄 Session Management (session validation, timeout handling)
└── 🎯 Performance Monitoring (login time tracking, error logging)

API INTERFACE:
- secureLogin(credentials: SecureLoginCredentials): Promise<SecureLoginResponse>
- validateToken(token: string): Promise<boolean>
- refreshToken(): Promise<boolean>
- generateCSRFToken(): string
- validateCSRFToken(token: string): boolean
- getAccessToken(): string | null
- logout(): Promise<void>
```

#### 3. **KnowledgeHubService** ✅ PRIMARY SERVICE
```typescript
// Location: src/pages/KnowledgeHub/services/knowledgeHubService.ts
// Pattern: Static Facade with Provider Delegation
// Status: ✅ READY FOR MIGRATION

RESPONSIBILITIES:
├── 📚 Content Management (getKnowledgeArticles, createKnowledgeArticle, updateKnowledgeArticle)
├── 🎓 Learning Paths (getLearningPathways, createLearningPathway, updateLearningPathway)
├── 📝 Quizzes (getQuizzes, createQuiz, updateQuiz, submitQuizAttempt)
├── 📊 User Progress (getUserProgress, updateUserProgress, trackActivity)
├── 🏷️ Categories (getCategories, createCategory, updateCategory)
├── 🔄 Bulk Operations (bulkUpdateContentStatus, bulkDeleteContent)
├── 🔍 Search (searchContent, filterContent, getContentByCategory)
└── 📈 Analytics (getContentAnalytics, getUserEngagementAnalytics)

API INTERFACE:
- getKnowledgeArticles(): Promise<ContentItem[]>
- createKnowledgeArticle(article: Omit<ContentItem, 'id' | 'createdAt'>): Promise<ContentItem>
- updateContentStatus(id: string, status: ContentStatus): Promise<void>
- bulkDeleteContent(ids: string[]): Promise<BulkResponse>
- getLearningPathways(): Promise<LearningPathway[]>
- getQuizzes(): Promise<Quiz[]>
- submitQuizAttempt(quizId: string, answers: QuizAnswer[]): Promise<QuizAttempt>
```

#### 4. **BIFailureNotificationService** ✅ PRIMARY SERVICE
```typescript
// Location: src/services/bi/failure/BIFailureNotificationService.ts
// Pattern: Static Service with Notification Workflow
// Status: ✅ READY FOR MIGRATION

RESPONSIBILITIES:
├── 🚨 Regulatory Notifications (sendRegulatoryNotification, notifyRegulatoryBodies)
├── 📧 Email Notifications (sendEmailNotification, queueEmailNotification)
├── 🔗 Webhook Notifications (sendWebhookNotification, notifyExternalSystems)
├── ⏰ Notification Scheduling (scheduleNotification, handleNotificationDelay)
├── 🔄 Retry Logic (retryFailedNotifications, handleRetryCount)
├── 📊 Notification Analytics (getNotificationStats, trackNotificationSuccess)
├── 🏥 Facility Configuration (getNotificationConfig, updateNotificationSettings)
└── 📝 Audit Logging (logNotificationEvents, trackNotificationHistory)

API INTERFACE:
- sendRegulatoryNotification(incidentId: string, facilityId: string, severity: string, incidentDetails: IncidentDetails): Promise<boolean>
- sendEmailNotification(recipients: string[], subject: string, body: string): Promise<boolean>
- sendWebhookNotification(webhookUrl: string, payload: any): Promise<boolean>
- scheduleNotification(notification: NotificationMessage, delayMinutes: number): Promise<void>
- getNotificationConfig(facilityId: string): Promise<NotificationConfig>
- retryFailedNotifications(): Promise<void>
```

### **Deprecated Services (To Be Removed)**

#### 1. **SupabaseInventoryService** ❌ DEPRECATED
```typescript
// Location: src/services/supabase/inventoryService.ts
// Pattern: Static Class with Deprecation Warnings
// Status: ❌ DEPRECATED - 27 files still using

DEPRECATION STATUS:
├── ⚠️ All methods have @deprecated JSDoc tags
├── ⚠️ Console.warn() messages on every method call
├── ⚠️ Migration guidance to InventoryServiceFacade
└── ❌ 27 files still importing and using

MIGRATION TARGET: InventoryServiceFacade
MIGRATION COMPLEXITY: HIGH (27 files affected)
BUSINESS RISK: HIGH (core inventory functionality)
```

#### 2. **authService** ❌ DEPRECATED
```typescript
// Location: src/services/authService.ts
// Pattern: Static Functions with Mock Support
// Status: ❌ DEPRECATED - 9 files still using

DEPRECATION STATUS:
├── ⚠️ Legacy authentication with direct Supabase calls
├── ⚠️ Mock authentication support (disabled)
├── ⚠️ No rate limiting or security features
└── ❌ 9 files still importing and using

MIGRATION TARGET: SecureAuthService
MIGRATION COMPLEXITY: MEDIUM (9 files affected)
BUSINESS RISK: HIGH (authentication security)
```

#### 3. **KnowledgeDataService** ❌ DEPRECATED
```typescript
// Location: src/pages/KnowledgeHub/services/data/knowledgeDataService.ts
// Pattern: Service Composition with Individual Services
// Status: ❌ DEPRECATED - 0 files using

DEPRECATION STATUS:
├── ⚠️ All methods have @deprecated JSDoc tags
├── ⚠️ Migration guidance to KnowledgeHubService
├── ⚠️ Overlapping functionality with KnowledgeHubSupabaseService
└── ✅ 0 files currently using

MIGRATION TARGET: KnowledgeHubService
MIGRATION COMPLEXITY: LOW (0 files affected)
BUSINESS RISK: LOW (not in active use)
```

## 🚀 Migration Guides

### **Migration Guide 1: Inventory Services**

#### **Phase 2A: Critical Migration (Week 1-2)**

**Target**: Move 27 files from `SupabaseInventoryService` to `InventoryServiceFacade`

**Step 1: Update Imports**
```typescript
// ❌ OLD (Deprecated)
import { SupabaseInventoryService } from '@/services/supabase/inventoryService';

// ✅ NEW (Correct)
import { InventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
```

**Step 2: Update Method Calls**
```typescript
// ❌ OLD (Deprecated)
const response = await SupabaseInventoryService.getInventoryItems(filters);
const item = await SupabaseInventoryService.createInventoryItem(itemData);
const updated = await SupabaseInventoryService.updateInventoryItem(id, updates);

// ✅ NEW (Correct)
const inventoryService = InventoryServiceFacade.getInstance();
const response = await inventoryService.getAllItems(filters);
const item = await inventoryService.createItem(itemData);
const updated = await inventoryService.updateItem(id, updates);
```

**Step 3: Handle Response Format Changes**
```typescript
// ❌ OLD (Deprecated)
const { data, error, count } = await SupabaseInventoryService.getInventoryItems();

// ✅ NEW (Correct)
const response = await inventoryService.getAllItems();
const { data, error, count } = response;
```

**Files to Migrate (27 files)**:
1. `src/hooks/inventory/useCentralizedInventoryData.ts`
2. `src/hooks/inventory/useInventoryDataFetching.ts`
3. `src/components/Inventory/InventoryTableSection.tsx`
4. `src/pages/Inventory/InventoryDashboard.tsx`
5. `src/hooks/inventory/useInventoryPageLogic.ts`
6. `src/hooks/inventory/useInventoryModals.ts`
7. `src/hooks/inventory/useInventoryFormSubmission.ts`
8. `src/hooks/inventory/useInventoryFilters.ts`
9. `src/hooks/inventory/useInventoryCategoryManagement.ts`
10. `src/components/Inventory/modals/UploadBarcodeModal.tsx`
11. `src/services/inventory/UnifiedInventoryDataService.ts`
12. `src/services/inventory/adapters/SupabaseAdapter.ts`
13. `src/services/inventory/adapters/ApiAdapter.ts`
14. `src/services/inventory/adapters/LocalStorageAdapter.ts`
15. `src/services/inventory/utils/inventoryFilters.ts`
16. `src/services/inventory/utils/inventoryFilterOperations.ts`
17. `src/services/inventory/InventoryStateManager.ts`
18. `src/services/cache/CacheWarmingService.ts`
19. `src/hooks/useInventoryRealtimeUpdates.ts`
20. `src/utils/Inventory/filterUtils.ts`
21. `src/features/library/services/inventorySearchService.ts`
22. `src/pages/Inventory/services/index.ts`
23. `src/services/inventory/ARCHITECTURE_SIMPLIFICATION.md`
24. `src/services/inventory/MIGRATION_GUIDE.md`
25. `src/pages/Inventory/services/PHASE_4_CLEANUP_AUDIT.md`
26. `src/pages/Inventory/services/PHASE_2_CONSOLIDATION.md`
27. `src/pages/SERVICE_HIERARCHY_PATTERN.md`

### **Migration Guide 2: Authentication Services**

#### **Phase 2A: Critical Migration (Week 1-2)**

**Target**: Move 9 files from `authService` to `SecureAuthService`

**Step 1: Update Imports**
```typescript
// ❌ OLD (Deprecated)
import { login, validateToken } from '@/services/authService';

// ✅ NEW (Correct)
import { SecureAuthService } from '@/services/secureAuthService';
```

**Step 2: Update Method Calls**
```typescript
// ❌ OLD (Deprecated)
const { token, expiry } = await login(email, password);
const isValid = await validateToken(token);

// ✅ NEW (Correct)
const authService = new SecureAuthService();
const response = await authService.secureLogin({ email, password });
const isValid = await authService.validateToken(response.data?.accessToken);
```

**Step 3: Handle Response Format Changes**
```typescript
// ❌ OLD (Deprecated)
const { token, expiry } = await login(email, password);

// ✅ NEW (Correct)
const response = await authService.secureLogin({ email, password });
if (response.success && response.data) {
  const { accessToken, expiresIn } = response.data;
  const expiry = new Date(Date.now() + expiresIn * 1000).toISOString();
}
```

**Files to Migrate (9 files)**:
1. `src/components/ProtectedRoute.tsx`
2. `src/pages/Login/hooks/useLoginForm.ts`
3. `src/components/Navigation/DrawerMenu.tsx`
4. `src/services/packagingService.ts`
5. `src/services/loginQueryService.ts`
6. `src/services/loginApi.ts`
7. `src/services/loginApiService.ts`
8. `src/hooks/useLoginService.ts`
9. `src/__mocks__/supabase/typedSupabaseMock.ts`

### **Migration Guide 3: KnowledgeHub Services**

#### **Phase 2B: Moderate Migration (Week 3-4)**

**Target**: Move 0 files from deprecated services to `KnowledgeHubService`

**Status**: ✅ No migration needed - services not yet adopted by components

**Future Migration Pattern**:
```typescript
// ❌ OLD (Deprecated)
import { KnowledgeDataService } from '@/pages/KnowledgeHub/services/data/knowledgeDataService';

// ✅ NEW (Correct)
import { KnowledgeHubService } from '@/pages/KnowledgeHub/services/knowledgeHubService';
```

### **Migration Guide 4: BI Failure Services**

#### **Phase 2B: Moderate Migration (Week 3-4)**

**Target**: Consolidate duplicate BI failure services

**Status**: ✅ No migration needed - services not yet adopted by components

**Future Migration Pattern**:
```typescript
// ❌ OLD (Deprecated)
import { BIFailureNotificationService } from '@/services/bi/failure/BIFailureNotificationService';

// ✅ NEW (Correct)
import { BIFailureNotificationService } from '@/services/bi/failure/BIFailureNotificationService';
// (Same import path - just remove duplicates)
```

## 📋 Service Standards

### **Service Pattern Standards**

#### **1. Static Utilities (No State)**
```typescript
// Use for: Pure operations that don't maintain state
export class ServiceCrudOperations {
  static async getItems(filters?: Filters): Promise<Response> {
    // Pure operation, no state
  }
}
```

#### **2. Regular Instances (May Have State)**
```typescript
// Use for: Business logic services that may maintain state
export class ServiceCoreService {
  private cacheManager: ServiceCacheManager;
  
  constructor() {
    this.cacheManager = new ServiceCacheManager();
  }
}
```

#### **3. Singletons (Shared Resources)**
```typescript
// Use for: Infrastructure services that manage shared resources
export class ServiceSupabaseService {
  private static instance: ServiceSupabaseService;
  
  private constructor() {}
  
  static getInstance(): ServiceSupabaseService {
    if (!ServiceSupabaseService.instance) {
      ServiceSupabaseService.instance = new ServiceSupabaseService();
    }
    return ServiceSupabaseService.instance;
  }
}
```

### **Service Naming Standards**

- **Primary Services**: `{Module}Service` (e.g., `InventoryService`, `AuthService`)
- **Facade Services**: `{Module}ServiceFacade` (e.g., `InventoryServiceFacade`)
- **Utility Services**: `{Module}{Operation}Operations` (e.g., `InventoryCrudOperations`)
- **Provider Services**: `{Module}{Provider}Provider` (e.g., `InventoryDataProvider`)

### **Service Interface Standards**

- **Consistent Response Types**: All services return `OperationResult<T>` or similar
- **Error Handling**: All services use consistent error handling patterns
- **Performance Monitoring**: All services track response times and errors
- **Caching**: Services implement consistent caching strategies
- **Real-time Updates**: Services support real-time subscriptions where needed

## 🎯 Migration Priority Matrix

### **Phase 2A: Critical Services** (Week 1-2)
1. **Inventory Services** - 27 files, HIGH business impact, HIGH complexity
2. **Authentication Services** - 9 files, HIGH security risk, MEDIUM complexity

### **Phase 2B: Moderate Services** (Week 3-4)
3. **KnowledgeHub Services** - 0 files, LOW risk, LOW complexity
4. **BI Failure Services** - 0 files, LOW risk, LOW complexity

### **Phase 2C: Low Impact Services** (Week 5-6)
5. **AI Services** - Consolidate scattered AI functionality
6. **Utility Services** - Clean up remaining duplicates

---

**Status**: ✅ Phase 1.3 Complete - Service Responsibility Documentation & Migration Priorities
**Next**: Phase 2A - Critical Service Migration (Inventory & Authentication)
