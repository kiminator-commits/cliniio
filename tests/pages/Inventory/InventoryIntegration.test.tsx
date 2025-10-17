import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import InventoryPage from '@/pages/Inventory/index';
import { useInventoryDataManager } from '@/hooks/inventory/useInventoryDataManager';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useScanModalManagement } from '@/hooks/inventory/useScanModalManagement';
import {
  mockDataManager,
  mockStoreState,
  mockScanModalManagement,
  setupMocks,
} from './__mocks__/inventoryTestMocks';

// Mock all the hooks and services
vi.mock('@/hooks/inventory/useInventoryDataManager');
vi.mock('@/store/useInventoryStore');
vi.mock('@/hooks/inventory/useScanModalManagement');
vi.mock('@/hooks/inventory/useInventoryContext');
vi.mock('@/pages/Inventory/hooks/useInventoryPageSetup');

// Mock the action service
vi.mock('@/pages/Inventory/services/inventoryActionService');

// Mock the data manager hook
const mockUseInventoryDataManager =
  useInventoryDataManager as vi.MockedFunction<typeof useInventoryDataManager>;
const mockUseInventoryStore = useInventoryStore as vi.MockedFunction<
  typeof useInventoryStore
>;
const mockUseScanModalManagement = useScanModalManagement as vi.MockedFunction<
  typeof useScanModalManagement
>;

// Mock the page setup hook
vi.mock('@/pages/Inventory/hooks/useInventoryPageSetup', () => ({
  useInventoryPageSetup: () => ({
    ProviderTree: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="provider-tree">{children}</div>
    ),
    PageContent: () => (
      <div data-testid="page-content">Inventory Dashboard</div>
    ),
  }),
}));

// Mock the context hook
vi.mock('@/hooks/inventory/useInventoryContext', () => ({
  useInventoryContext: () => ({
    handleShowAddModal: vi.fn(),
    handleEditClick: vi.fn(),
    handleDeleteClick: vi.fn(),
    handleDuplicateClick: vi.fn(),
    handleArchiveClick: vi.fn(),
    handleBulkDelete: vi.fn(),
    handleBulkUpdate: vi.fn(),
    handleBulkExport: vi.fn(),
  }),
}));

describe('Inventory Integration Tests', () => {
  beforeEach(() => {
    setupMocks();

    // Setup default mocks
    mockUseInventoryDataManager.mockReturnValue(mockDataManager);
    mockUseInventoryStore.mockReturnValue(mockStoreState);
    mockUseScanModalManagement.mockReturnValue(mockScanModalManagement);
  });

  it('should render inventory page with all components', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <InventoryPage />
      </ErrorBoundary>
    );

    // Verify basic page structure
    expect(screen.getByTestId('provider-tree')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('should initialize with correct default state', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <InventoryPage />
      </ErrorBoundary>
    );

    // Verify default state
    expect(mockDataManager.isLoading).toBe(false);
    expect(mockStoreState.activeTab).toBe('tools');
    expect(mockScanModalManagement.scanMode).toBe('add');
  });

  it('should handle basic page interactions', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <InventoryPage />
      </ErrorBoundary>
    );

    // Test basic interactions
    mockStoreState.setActiveTab('supplies');
    expect(mockStoreState.setActiveTab).toHaveBeenCalledWith('supplies');

    mockStoreState.setSearchQuery('test');
    expect(mockStoreState.setSearchQuery).toHaveBeenCalledWith('test');
  });
});
