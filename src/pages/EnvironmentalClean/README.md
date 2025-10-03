# Environmental Clean Module

This README provides an overview of the **Environmental Clean** feature, its architecture, and instructions for using the new hooks and components added during the refactor.

---

## 📁 File Structure

```
src/pages/EnvironmentalClean/
├── analytics/
│   └── EnvironmentalCleanInsightsCard.tsx
├── components/
│   └── EnvironmentalCleanContent.tsx
├── hooks/
│   ├── useEnvironmentalCleanAudit.ts
│   ├── useEnvironmentalCleanBatch.ts
│   ├── useEnvironmentalCleanDataManager.ts
│   ├── useEnvironmentalCleanOffline.ts
│   ├── useEnvironmentalCleanRealtime.ts
│   └── useRoomScanner.ts  (existing)
├── models.ts
├── store/environmentalCleanStore.ts
└── EnvironmentalCleanPage.tsx
```

---

## 🔍 Feature Overview

- **Lazy loading & Suspense**: `EnvironmentalCleanContent` and `InsightsCard` now load asynchronously.
- **Page-specific error boundary**: Wrapped with `EnvironmentalCleanErrorFallback` for contextual error messaging.
- **Centralized data fetching**: `useEnvironmentalCleanDataManager` hook manages queries with polling.
- **Filters & search**: Dropdown and text input to filter cleans by status and name.
- **Audit logging**: `useEnvironmentalCleanAudit` logs page views and filter interactions.
- **Batch operations**: Checkboxes and `useEnvironmentalCleanBatch` allow bulk actions.
- **Real-time sync**: `useEnvironmentalCleanRealtime` subscribes to WebSocket updates.
- **Offline support**: `useEnvironmentalCleanOffline` registers a service worker.
- **Analytics**: `InsightsCard` shows total count and breakdown by status.

---

## ⚙️ Hook Usage

### `useEnvironmentalCleanDataManager()`

```ts
const { environmentalCleans, isLoading, error } =
  useEnvironmentalCleanDataManager();
```

- Fetches cleans with React Query
- **Options**: `staleTime: 5m`, `refetchInterval: 60s`, `retry: 2`

### `useEnvironmentalCleanAudit()`

```ts
const audit = useEnvironmentalCleanAudit();
audit.mutate({ action: 'view_page' });
```

- Logs user interactions
- Call on mount and on key events (e.g., filter changes)

### `useEnvironmentalCleanBatch()`

```ts
const batch = useEnvironmentalCleanBatch();
batch.mutate({ ids: selectedIds, action: 'custom_batch' });
```

- Performs batch API calls and invalidates cache

### `useEnvironmentalCleanRealtime()`

```ts
useEnvironmentalCleanRealtime();
```

- Subscribes to WebSocket real-time updates
- Updates cached data on `create`, `update`, or `delete` events

### `useEnvironmentalCleanOffline()`

```ts
useEnvironmentalCleanOffline();
```

- Registers service worker at `/sw.js`
- Enables offline caching

---

## 📦 Component Overview

### `EnvironmentalCleanPage.tsx`

Entry point that wraps content in Suspense and error boundary.

### `EnvironmentalCleanContent.tsx`

- Manages state for search, filter, audit, batch selection
- Renders:
  1. **Search input**
  2. **Status filter dropdown**
  3. **Insights card**
  4. **Batch action button**
  5. **Clean items list with checkboxes**

### `EnvironmentalCleanInsightsCard.tsx`

- Displays total items and counts by status

---

## 🚀 Next Steps

1. **Styling refinements**: Improve dropdown and button layouts, including spacing, font sizes, and responsive design breakpoints.
2. **Offline UI indicators**: Show an offline status badge or banner when service worker is offline or data cannot refresh.
3. **Advanced analytics**: Integrate charts for trends over time (e.g., line charts for cleans per day) using Recharts.
4. **Documentation**: Update top-level docs and add JSDoc comments for all hooks and components.
5. **Accessibility audit**: Ensure all inputs and buttons have proper ARIA labels and keyboard navigation support.
6. **Performance monitoring**: Add metrics for component render times and bundle size tracking.

Feel free to refer to this document for onboarding or future enhancements.
