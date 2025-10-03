# Inventory Module Architecture Overview

This document outlines the high-level architecture of the Inventory module, including its key layers, data flow, and component responsibilities.

## 1. Store Layer

- **`useInventoryStore`** (Zustand store)
  - **Data Slice**: Manages inventory items, categories, filters, pagination
  - **UI Slice**: Manages UI state (search term, active tab, expanded sections)
  - **Modal Slice**: Manages open/close state for various modals

## 2. Providers

- **`InventoryProviders`**
  - Wraps the app in a single `InventoryActionsProvider`
  - **Note**: UI state provider layer has been removed; data and actions are now stored in Zustand

## 3. Services

- **`inventoryDataHandlers.ts`**
  - Consolidated data services from category, filter, and status services

- **`scanInventoryModalHandlers.ts`**
  - CSV processing, validation, and upload logic

- **`inventoryAnalyticsHandlers.ts`**
  - Data transformation for analytics charts

- **`inventoryHeaderHandlers.ts`**
  - Display formatting helpers for header components

- **`inventoryTableHandlers.ts`**
  - Table data formatting, sorting, filtering, pagination utilities

- **`inventoryControlHandlers.ts`**
  - Handlers for search, filter toggles, and items-per-page changes

## 4. Components

- **Page Entry**: `index.tsx` uses `useInventoryPageSetup()` to compose providers and render `InventoryDashboard`
- **Dashboard**: `InventoryDashboard.tsx` orchestrates layout and key sections
- **Analytics**: `InventoryAnalyticsSection.tsx` renders charts using precomputed data
- **Header**: `InventoryHeaderSection.tsx` displays title, search bar, and actions
- **Controls**: `InventoryControls.tsx` contains search input, filter toggles, pagination controls
- **Modals**: `InventoryModalsWrapper.tsx` wraps modal components and delegates logic to handlers
- **Table**: `InventoryTableWrapper.tsx` renders the item table, using table handlers for data

## 5. Hooks

- **`useInventoryUIState`**: Encapsulates UI state logic (replaced context provider)
- **`useInventoryPageSetup`**: Sets up provider tree and page content
- **`useInventoryDashboard`**, **`useInventorySearch`**: Context consumption hooks

## 6. Error Handling

- **Current Fallback**: Basic message-only fallback without actions
- **Upgraded Fallback**: Includes retry and contact support actions (enhanced in component)

---

_Next Steps_: Execute the atomic Cursor prompt to upgrade `InventoryErrorFallback` to include retry and support options.
