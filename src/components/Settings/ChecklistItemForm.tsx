import React, { useState } from 'react';
import { ChecklistItem, Checklist } from '../../store/checklistStore';
import { InventoryItem } from '@/types/inventoryTypes';
import InventorySearchModal from '@/features/library/components/InventorySearchModal';
import { UnifiedAIService } from '@/services/ai/UnifiedAIService';
import Icon from '@mdi/react';

import {
  mdiPlus,
  mdiDelete,
  mdiPencil,
  mdiLightbulb,
  mdiAutoFix,
  mdiCheck,
  mdiClose,
} from '@mdi/js';

interface ChecklistItemFormProps {
  selectedChecklist: Checklist;
  onAddItem: (item: Omit<ChecklistItem, 'id'>) => void;
  onUpdateItem: (itemId: string, item: Partial<ChecklistItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onGenerateAIItemSuggestions: () => void;
  showAIItemSuggestions: boolean;
  isGeneratingSuggestions: boolean;
  aiItemSuggestions: Array<{
    title: string;
    instructions: string;
    suggestedInventory: string[];
  }>;
  onApplyAIItemSuggestion: (suggestion: {
    title: string;
    instructions: string;
    suggestedInventory: string[];
  }) => void;
  onCloseAISuggestions: () => void;
  showSuccessMessage: string | null;
}

const ChecklistItemForm: React.FC<ChecklistItemFormProps> = ({
  selectedChecklist,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onGenerateAIItemSuggestions,
  showAIItemSuggestions,
  isGeneratingSuggestions,
  aiItemSuggestions,
  onApplyAIItemSuggestion,
  onCloseAISuggestions,
  showSuccessMessage,
}) => {
  // Inventory search modal state
  const [showInventorySearch, setShowInventorySearch] = useState(false);
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<
    InventoryItem[]
  >([]);

  // Checklist item state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState({
    title: '',
    instructions: '',
    inventoryItemIds: [] as string[],
    sdsId: '',
  });

  // AI Description Generation state
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleAddItem = () => {
    if (itemFormData.title && itemFormData.instructions && selectedChecklist) {
      onAddItem({
        title: itemFormData.title,
        instructions: itemFormData.instructions,
        requiredInventory: selectedInventoryItems.map((item) => ({
          id: item.id,
          name: item.name || '',
          required: 1,
          available: item.quantity || 0,
          used: 0,
          unit: 'unit',
        })),
        sdsId: itemFormData.sdsId || undefined,
      });
      setItemFormData({
        title: '',
        instructions: '',
        inventoryItemIds: [],
        sdsId: '',
      });
      setSelectedInventoryItems([]);
      setIsAddingItem(false);
    }
  };

  const handleUpdateItem = (itemId: string) => {
    if (itemFormData.title && itemFormData.instructions && selectedChecklist) {
      onUpdateItem(itemId, {
        title: itemFormData.title,
        instructions: itemFormData.instructions,
        requiredInventory: selectedInventoryItems.map((item) => ({
          id: item.id,
          name: item.name || '',
          required: 1,
          available: item.quantity || 0,
          used: 0,
          unit: 'unit',
        })),
        sdsId: itemFormData.sdsId || undefined,
      });
      setItemFormData({
        title: '',
        instructions: '',
        inventoryItemIds: [],
        sdsId: '',
      });
      setSelectedInventoryItems([]);
      setEditingItemId(null);
    }
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setItemFormData({
      title: item.title,
      instructions: item.instructions,
      inventoryItemIds: item.requiredInventory?.map((inv) => inv.id) || [],
      sdsId: item.sdsId || '',
    });

    // Load selected inventory items for editing
    const placeholderItems: InventoryItem[] = (
      item.requiredInventory || []
    ).map((inv) => ({
      id: inv.id,
      facility_id: 'unknown',
      name: inv.name,
      quantity: inv.available,
      data: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reorder_point: null,
      expiration_date: null,
      unit_cost: null,
      category: 'Unknown',
      status: 'Unknown',
      location: 'Unknown',
    }));
    setSelectedInventoryItems(placeholderItems);
  };

  const handleInventoryItemSelection = (items: InventoryItem[]) => {
    setSelectedInventoryItems(items);
  };

  // AI Description Generation for Individual Items
  const generateAIDescription = async (title: string, category?: string) => {
    if (!title.trim()) return;

    setIsGeneratingDescription(true);
    try {
      // Use UnifiedAIService for item description generation
      try {
        const description = await UnifiedAIService.askAI(
          `Generate detailed instructions for checklist item "${title}" in the ${category || selectedChecklist?.category} category. Provide step-by-step instructions that are clear and actionable.`,
          `Category: ${category || selectedChecklist?.category}, Title: ${title}`
        );
        setItemFormData((prev) => ({ ...prev, instructions: description }));
      } catch (aiError) {
        // Fallback to simulation if AI service fails
        console.warn('AI service failed, using fallback description:', aiError);
        const description = await simulateAIItemDescription(
          title,
          category || selectedChecklist?.category
        );
        setItemFormData((prev) => ({ ...prev, instructions: description }));
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      // Fallback to a simple description on error
      setItemFormData((prev) => ({
        ...prev,
        instructions: `Complete ${title.toLowerCase()} following established procedures and safety protocols.`,
      }));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Auto-generate description when title changes
  const handleItemTitleChange = (title: string) => {
    setItemFormData((prev) => ({ ...prev, title }));

    // Auto-generate description if title is substantial enough
    if (title.length >= 5 && !itemFormData.instructions) {
      // Debounce the AI call to avoid too many requests
      const timeoutId = setTimeout(() => {
        generateAIDescription(title);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  };

  // AI Item Description Simulation
  const simulateAIItemDescription = async (
    title: string,
    category?: string
  ): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const descriptionsByCategory = {
      setup: `Perform ${title.toLowerCase()} according to facility protocols. Ensure all equipment is properly prepared and safety measures are in place.`,
      patient: `Complete ${title.toLowerCase()} with patient safety as the priority. Follow infection control protocols and maintain patient privacy.`,
      weekly: `Conduct thorough ${title.toLowerCase()} as part of weekly maintenance schedule. Document all activities and report any issues.`,
      public: `Execute ${title.toLowerCase()} in public areas following facility standards. Maintain professional appearance and ensure accessibility.`,
      deep: `Perform intensive ${title.toLowerCase()} using specialized equipment and procedures. Follow all safety protocols and containment measures.`,
    };

    return (
      descriptionsByCategory[category as keyof typeof descriptionsByCategory] ||
      `Complete ${title.toLowerCase()} following established procedures and safety protocols.`
    );
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-medium">Checklist Items</h4>
        <div className="flex space-x-2">
          <button
            onClick={onGenerateAIItemSuggestions}
            disabled={isGeneratingSuggestions}
            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            title="Get AI suggestions for checklist items"
          >
            <Icon path={mdiAutoFix} size={0.8} className="mr-1" />
            {isGeneratingSuggestions ? 'Generating...' : 'AI Suggestions'}
          </button>
          <button
            onClick={() => {
              setIsAddingItem(true);
              setEditingItemId(null);
              setItemFormData({
                title: '',
                instructions: '',
                inventoryItemIds: [],
                sdsId: '',
              });
              setSelectedInventoryItems([]);
            }}
            className="flex items-center px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors"
          >
            <Icon path={mdiPlus} size={1} className="mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* AI Item Suggestions */}
      {showAIItemSuggestions && (
        <div className="mb-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-purple-800 flex items-center">
              <Icon path={mdiLightbulb} size={0.8} className="mr-1" />
              AI Item Suggestions
            </h5>
            <button
              onClick={onCloseAISuggestions}
              className="text-purple-600 hover:text-purple-800"
            >
              <Icon path={mdiClose} size={0.8} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiItemSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border border-purple-200 rounded-lg p-3 bg-white"
              >
                <h6 className="font-medium text-purple-800 mb-1">
                  {suggestion.title}
                </h6>
                <p className="text-sm text-gray-600 mb-2">
                  {suggestion.instructions}
                </p>
                {suggestion.suggestedInventory.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Suggested: </span>
                    <span className="text-xs text-purple-600">
                      {suggestion.suggestedInventory.join(', ')}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => onApplyAIItemSuggestion(suggestion)}
                  className="w-full px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Use This Item
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 p-3 border border-green-200 rounded-lg bg-green-50">
          <div className="flex items-center text-green-800">
            <Icon path={mdiCheck} size={0.8} className="mr-2" />
            <span className="text-sm font-medium">{showSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Existing Items List */}
      <div className="space-y-3 mb-4">
        {selectedChecklist.items.map((item: ChecklistItem) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-3 bg-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-gray-800">{item.title}</h5>
                <p className="text-sm text-gray-600 mt-1">
                  {item.instructions}
                </p>
                {item.requiredInventory &&
                  item.requiredInventory.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Required: </span>
                      {item.requiredInventory.map((inv) => inv.name).join(', ')}
                    </div>
                  )}
              </div>
              <div className="flex items-center space-x-2 ml-3">
                <button
                  onClick={() => handleEditItem(item)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Icon path={mdiPencil} size={0.8} />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Icon path={mdiDelete} size={0.8} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {selectedChecklist.items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No items added yet. Click "Add Item" to get started.
          </p>
        )}
      </div>

      {/* Add/Edit Item Form */}
      {isAddingItem && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h5 className="font-medium mb-3">
            {editingItemId ? 'Edit Item' : 'Add New Item'}
          </h5>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="item-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Item Title
              </label>
              <input
                id="item-title"
                type="text"
                value={itemFormData.title}
                onChange={(e) => handleItemTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                placeholder="e.g., Clean and sanitize surfaces"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                <span className="flex items-center">
                  Instructions
                  {isGeneratingDescription && (
                    <span className="ml-2 text-xs text-blue-600 flex items-center">
                      <Icon
                        path={mdiLightbulb}
                        size={0.6}
                        className="mr-1 animate-pulse"
                      />
                      AI generating...
                    </span>
                  )}
                </span>
                {itemFormData.title && !isGeneratingDescription && (
                  <button
                    type="button"
                    onClick={() => generateAIDescription(itemFormData.title)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    title="Generate AI description"
                  >
                    <Icon path={mdiLightbulb} size={0.6} className="mr-1" />
                    AI Generate
                  </button>
                )}
              </label>
              <textarea
                value={itemFormData.instructions}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    instructions: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] ${
                  isGeneratingDescription ? 'bg-blue-50 border-blue-200' : ''
                }`}
                rows={3}
                placeholder={
                  isGeneratingDescription
                    ? 'AI is generating instructions...'
                    : 'Detailed instructions for this task...'
                }
                disabled={isGeneratingDescription}
              />
            </div>
            <div>
              <label
                htmlFor="inventory-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Required Inventory
              </label>
              <button
                id="inventory-select"
                onClick={() => setShowInventorySearch(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              >
                {selectedInventoryItems.length > 0
                  ? `${selectedInventoryItems.length} item(s) selected`
                  : 'Click to select required inventory items'}
              </button>
              {selectedInventoryItems.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedInventoryItems.map((item) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      • {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingItem(false);
                  setEditingItemId(null);
                  setItemFormData({
                    title: '',
                    instructions: '',
                    inventoryItemIds: [],
                    sdsId: '',
                  });
                  setSelectedInventoryItems([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  editingItemId
                    ? handleUpdateItem(editingItemId)
                    : handleAddItem()
                }
                className="px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac]"
              >
                {editingItemId ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Search Modal */}
      <InventorySearchModal
        isOpen={showInventorySearch}
        onClose={() => setShowInventorySearch(false)}
        onSelectItems={handleInventoryItemSelection}
        selectedItems={selectedInventoryItems}
      />
    </div>
  );
};

export default ChecklistItemForm;
