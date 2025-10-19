# 🗺 Inventory Page File Map

## 📦 Main Files (Core Structure)

- `index.tsx` – 22 lines
- `InventoryDashboard.tsx` – 67 lines
- `InventoryLayout.tsx` – 8 lines
- `InventoryContent.tsx` – 5 lines
- `InventoryControls.tsx` – 5 lines
- `styles.css` – 50 lines
- `types.ts` – 1 line

## 📊 Components

- `InventoryAnalyticsSection.tsx` – 36 lines
- `InventoryHeaderSection.tsx` – 24 lines
- `InventoryModalsWrapper.tsx` – 77 lines
- `InventoryTableWrapper.tsx` – 79 lines
- `ScanModalWrapper.tsx` – 58 lines

## 🧠 Context

- `InventoryDashboardContext.tsx` – 6 lines
- `InventorySearchContext.tsx` – 5 lines

## ⚙️ Providers (🧨 Cleanup Priority)

- `InventoryActionsProvider.tsx` – 398 lines 🔥
- `InventoryUIStateProvider.tsx` – 218 lines ⚠️
- `InventoryDataProvider.tsx` – 97 lines
- `InventoryDataManagerProvider.tsx` – 85 lines
- `InventoryProviders.tsx` – 35 lines

## 🔍 Hooks

- `useInventoryState.ts` – 51 lines

## 🛠 Services

- `categoryService.ts` – 41 lines
- `filterService.ts` – 20 lines
- `statusService.ts` – 19 lines

## 🧾 Types

- `InventoryDashboard.types.ts` – 21 lines
- `InventorySearch.types.ts` – 6 lines

## 🧪 Utils

## 📛 Modals (Cleanup Priority)

- `ScanInventoryModal.tsx` – 216 lines ⚠️

---

## 🧼 Cleanup Priorities

1. **InventoryActionsProvider.tsx** – Split logic from provider
2. **ScanInventoryModal.tsx** – Extract handlers/hooks and shrink size
3. **InventoryUIStateProvider.tsx** – Collapse redundant state
4. **index.tsx** – Rebuild a leaner, cleaner entry point
5. **InventoryModalsWrapper.tsx** – Simplify modal registration flow

---
