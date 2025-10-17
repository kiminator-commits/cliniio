import React from 'react';
import { useChecklistStore } from '@/store/checklistStore';
import { useChecklistState } from './hooks/useChecklistState';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { sampleSDSSheets } from './constants/cleaningData';
import { TabNavigation } from './components/TabNavigation';
import { ChecklistTab } from './components/ChecklistTab';
import { SDSTab } from './components/SDSTab';
import { ChecklistModal } from './components/ChecklistModal';
import { SDSModal } from './components/SDSModal';
import { Checklist, ActiveTab, SDSSheet } from './types/cleaningChecklists';

const CleaningChecklists: React.FC = () => {
  const { getPublishedChecklistsByCategory } = useChecklistStore();

  // Custom hooks for state management
  const {
    selectedCategory,
    selectedChecklist,
    activeTab,
    searchQuery,
    selectedSDS,
    sdsCategory,
    bypassedItems,
    adjustedQuantities,
    showModal,
    notes,
    stolenItems,
    prnItems,
    setSelectedChecklist,
    setActiveTab,
    setSearchQuery,
    setSelectedSDS,
    setSdsCategory,
    setNotes,
    handleCategoryClick,
    handleChecklistSelect,
    handleCloseModal,
    handleMarkComplete,
    handleBypassItem,
    handleAdjustQuantity,
    handleAddStolenItem,
    handleAddPrnItem,
    handleUpdateStolenItem,
    handleUpdatePrnItem,
    clearStolenItems,
    clearPrnItems,
    clearNotes,
  } = useChecklistState();

  // Speech recognition hook
  const {
    isListening,
    transcript,
    startSpeechRecognition,
    stopSpeechRecognition,
    applyTranscriptToNotes,
  } = useSpeechRecognition();

  // Helper function to get checklists for a category
  const getChecklistsForCategory = (categoryId: string): Checklist[] => {
    // Get published checklists from the store instead of using hardcoded data
    const publishedChecklists = getPublishedChecklistsByCategory(categoryId);

    // Transform the store data to match the expected interface
    return publishedChecklists.map((storeChecklist) => ({
      id: storeChecklist.id,
      title: storeChecklist.title,
      description: `Published checklist with ${storeChecklist.items.length} items`,
      items: storeChecklist.items.map((storeItem) => ({
        id: storeItem.id,
        title: storeItem.title,
        instructions: storeItem.instructions,
        inventoryItems: storeItem.requiredInventory?.map((inv) => ({
          id: inv.id,
          name: inv.name,
          currentStock: inv.available,
          requiredQuantity: inv.required,
          category: 'Cleaning Supplies',
        })),
        completed: storeItem.completed || false,
      })),
    }));
  };

  const filteredSDSSheets = sampleSDSSheets.filter((sheet) => {
    const matchesSearch = sheet.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      sdsCategory === 'all' || sheet.category === sdsCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className="p-6 bg-white rounded-lg shadow"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <TabNavigation activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as ActiveTab)} />

      {activeTab === 'checklists' && (
        <ChecklistTab
          selectedCategory={selectedCategory}
          selectedChecklist={selectedChecklist}
          bypassedItems={bypassedItems}
          adjustedQuantities={adjustedQuantities}
          onCategoryClick={handleCategoryClick}
          onChecklistSelect={handleChecklistSelect}
          onBypassItem={handleBypassItem}
          onAdjustQuantity={handleAdjustQuantity}
          onViewSDS={setSelectedSDS}
          onMarkComplete={handleMarkComplete}
          getChecklistsForCategory={getChecklistsForCategory}
        />
      )}

      {activeTab === 'sds' && (
        <SDSTab
          searchQuery={searchQuery}
          sdsCategory={sdsCategory}
          filteredSDSSheets={filteredSDSSheets}
          onTabChange={(tab: string) => setActiveTab(tab as ActiveTab)}
          onSearchQueryChange={setSearchQuery}
          onSdsCategoryChange={setSdsCategory}
          onSDSSelect={(sds: any) => setSelectedSDS(sds)}
        />
      )}

      <ChecklistModal
        showModal={showModal}
        selectedCategory={selectedCategory}
        selectedChecklist={selectedChecklist}
        bypassedItems={bypassedItems}
        adjustedQuantities={adjustedQuantities}
        stolenItems={stolenItems}
        prnItems={prnItems}
        notes={notes}
        isListening={isListening}
        transcript={transcript}
        onClose={handleCloseModal}
        onChecklistSelect={handleChecklistSelect}
        onSetSelectedChecklist={setSelectedChecklist}
        onBypassItem={handleBypassItem}
        onAdjustQuantity={handleAdjustQuantity}
        onViewSDS={setSelectedSDS}
        onAddStolenItem={handleAddStolenItem}
        onUpdateStolenItem={handleUpdateStolenItem}
        onClearStolenItems={clearStolenItems}
        onAddPrnItem={handleAddPrnItem}
        onUpdatePrnItem={handleUpdatePrnItem}
        onClearPrnItems={clearPrnItems}
        onNotesChange={setNotes}
        onClearNotes={clearNotes}
        onStartSpeechRecognition={startSpeechRecognition}
        onStopSpeechRecognition={stopSpeechRecognition}
        onApplyTranscriptToNotes={applyTranscriptToNotes}
        getChecklistsForCategory={getChecklistsForCategory}
      />

      <SDSModal
        selectedSDS={selectedSDS}
        onClose={() => setSelectedSDS(null)}
      />
    </div>
  );
};

export default CleaningChecklists;
