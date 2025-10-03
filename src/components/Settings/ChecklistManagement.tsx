import React, { useState } from 'react';
import {
  useChecklistStore,
  Checklist,
  ChecklistItem,
} from '../../store/checklistStore';
import Icon from '@mdi/react';
import { UnifiedAIService } from '../../services/ai/UnifiedAIService';
import { mdiPlus, mdiChevronDown, mdiChevronRight, mdiClose } from '@mdi/js';

// Import refactored components
import ChecklistForm from './ChecklistForm';
import ChecklistList from './ChecklistList';
import ChecklistItemForm from './ChecklistItemForm';

const ChecklistManagement: React.FC = () => {
  const {
    checklists,
    updateChecklist,
    deleteChecklist,
    publishChecklist,
    addItemToChecklist,
    updateChecklistItem,
    deleteChecklistItem,
  } = useChecklistStore();
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Handler functions for the refactored components
  const handleSaveDraft = (formData: Partial<Checklist>) => {
    if (selectedChecklist) {
      // Update existing checklist
      updateChecklist(selectedChecklist.id, formData);
    } else {
      // Create new checklist as draft
      const { addChecklist } = useChecklistStore.getState();
      addChecklist({
        ...formData,
        title: formData.title || 'New Checklist',
        items: [],
        status: 'draft',
      } as Checklist);
    }
    setSelectedChecklist(null);
    setIsAddingChecklist(false);
  };

  const handlePublishChecklist = () => {
    if (selectedChecklist) {
      publishChecklist(selectedChecklist.id);
      setSelectedChecklist(null);
    }
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
  };

  const handleCancel = () => {
    setIsAddingChecklist(false);
    setSelectedChecklist(null);
  };

  const handleAddItem = (item: Omit<ChecklistItem, 'id'>) => {
    if (selectedChecklist) {
      addItemToChecklist(selectedChecklist.id, item);
      // Update the selectedChecklist state to reflect the new item
      const updatedChecklist = checklists.find(
        (c) => c.id === selectedChecklist.id
      );
      if (updatedChecklist) {
        setSelectedChecklist(updatedChecklist);
      }
    }
  };

  const handleUpdateItem = (itemId: string, item: Partial<ChecklistItem>) => {
    if (selectedChecklist) {
      updateChecklistItem(selectedChecklist.id, itemId, item);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (selectedChecklist) {
      deleteChecklistItem(selectedChecklist.id, itemId);
    }
  };

  // AI-related state and handlers
  const [showAIItemSuggestions, setShowAIItemSuggestions] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [aiItemSuggestions, setAiItemSuggestions] = useState<
    Array<{
      title: string;
      instructions: string;
      suggestedInventory: string[];
    }>
  >([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(
    null
  );

  const generateAIItemSuggestions = async () => {
    if (!selectedChecklist) return;

    setIsGeneratingSuggestions(true);
    try {
      // Use UnifiedAIService for AI-powered checklist item suggestions
      try {
        // Generate AI suggestions using the unified AI service
        const aiResponse = await UnifiedAIService.askAI(
          `Generate 5-7 detailed checklist items for "${selectedChecklist.title}" in the ${selectedChecklist.category} category. Each item should include title, detailed instructions, and suggested inventory requirements.`,
          `Category: ${selectedChecklist.category}, Title: ${selectedChecklist.title}`
        );

        // Parse the AI response to extract structured suggestions
        const suggestions = parseAIResponseToSuggestions(aiResponse);
        setAiItemSuggestions(suggestions);
        setShowAIItemSuggestions(true);
      } catch (aiError) {
        // Fallback to simulation if AI service fails
        console.warn('AI service failed, using fallback suggestions:', aiError);
        const suggestions = await simulateAIItemSuggestions(
          selectedChecklist.category
        );
        setAiItemSuggestions(suggestions);
        setShowAIItemSuggestions(true);
      }
    } catch (error) {
      console.error('Error generating AI item suggestions:', error);
      // Fallback to simulation on error
      const suggestions = await simulateAIItemSuggestions(
        selectedChecklist.category
      );
      setAiItemSuggestions(suggestions);
      setShowAIItemSuggestions(true);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applyAIItemSuggestion = (suggestion: {
    title: string;
    instructions: string;
    suggestedInventory: string[];
  }) => {
    if (!selectedChecklist) return;

    // Add the suggested item directly to the checklist
    addItemToChecklist(selectedChecklist.id, {
      title: suggestion.title,
      instructions: suggestion.instructions,
      requiredInventory: [], // Empty for now, user can add inventory later
      sdsId: undefined,
    });

    // Update the selectedChecklist state to reflect the new item
    const updatedChecklist = checklists.find(
      (c) => c.id === selectedChecklist.id
    );
    if (updatedChecklist) {
      setSelectedChecklist(updatedChecklist);
    }

    // Close the AI suggestions modal
    setShowAIItemSuggestions(false);

    // Show success feedback
    setShowSuccessMessage(`✅ Added "${suggestion.title}" to checklist`);
    setTimeout(() => setShowSuccessMessage(null), 3000); // Clear after 3 seconds
  };

  // Helper function to parse AI response into structured suggestions
  const parseAIResponseToSuggestions = (aiResponse: string) => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({
            title: item.title || item.name || 'Untitled Item',
            instructions:
              item.instructions ||
              item.data?.description ||
              item.steps ||
              'No instructions provided',
            suggestedInventory: Array.isArray(item.suggestedInventory)
              ? item.suggestedInventory
              : Array.isArray(item.inventory)
                ? item.inventory
                : Array.isArray(item.requirements)
                  ? item.requirements
                  : [],
          }));
        }
      }

      // Fallback: parse text response into structured format
      const lines = aiResponse.split('\n').filter((line) => line.trim());
      const suggestions = [];
      let currentItem: {
        title: string;
        instructions: string;
        suggestedInventory: string[];
      } | null = null;

      for (const line of lines) {
        if (line.match(/^\d+\./)) {
          // New item starting
          if (currentItem) {
            suggestions.push(currentItem);
          }
          currentItem = {
            title: line.replace(/^\d+\.\s*/, '').trim(),
            instructions: '',
            suggestedInventory: [],
          };
        } else if (currentItem && line.trim()) {
          if (
            line.toLowerCase().includes('inventory') ||
            line.toLowerCase().includes('supplies')
          ) {
            // Extract inventory items
            const inventoryMatch = line.match(/[^:]+:\s*(.+)/);
            if (inventoryMatch) {
              currentItem.suggestedInventory = inventoryMatch[1]
                .split(',')
                .map((item) => item.trim());
            }
          } else {
            // Add to instructions
            currentItem.instructions +=
              (currentItem.instructions ? ' ' : '') + line.trim();
          }
        }
      }

      if (currentItem) {
        suggestions.push(currentItem);
      }

      return suggestions.length > 0
        ? suggestions
        : [
            {
              title: 'AI-generated item',
              instructions: aiResponse.substring(0, 200) + '...',
              suggestedInventory: [],
            },
          ];
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return fallback suggestion
      return [
        {
          title: 'AI-generated item',
          instructions: aiResponse.substring(0, 200) + '...',
          suggestedInventory: [],
        },
      ];
    }
  };

  // AI Simulation Functions (replace with actual AI API calls)
  const simulateAIItemSuggestions = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _category: string
  ): Promise<
    Array<{
      title: string;
      instructions: string;
      suggestedInventory: string[];
    }>
  > => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const baseSuggestions = [
      {
        title: 'Surface Disinfection',
        instructions:
          'Use EPA-approved disinfectant wipes. Clean all high-touch surfaces including door handles, light switches, and equipment controls. Allow 3-5 minutes contact time for proper disinfection.',
        suggestedInventory: [
          'Disinfectant Wipes',
          'Nitrile Gloves',
          'Safety Goggles',
        ],
      },
      {
        title: 'Equipment Sanitization',
        instructions:
          'Clean all medical equipment with appropriate cleaning agents. Pay special attention to patient contact surfaces. Verify equipment is operational after cleaning.',
        suggestedInventory: [
          'Equipment Cleaning Solution',
          'Microfiber Cloths',
          'Alcohol Wipes',
        ],
      },
      {
        title: 'Supply Restocking',
        instructions:
          'Check all supply levels and restock as needed. Verify expiration dates on all items. Ensure emergency supplies are readily accessible.',
        suggestedInventory: [
          'Various Medical Supplies',
          'Storage Containers',
          'Labeling Materials',
        ],
      },
      {
        title: 'Safety Equipment Check',
        instructions:
          'Verify all safety equipment is present and functional. Test emergency systems and alarms. Check fire extinguishers and emergency exits.',
        suggestedInventory: [
          'Safety Equipment',
          'Testing Tools',
          'Documentation Forms',
        ],
      },
      {
        title: 'Quality Control Verification',
        instructions:
          'Perform final quality control check. Verify all cleaning standards have been met. Document completion and any issues found.',
        suggestedInventory: [
          'Quality Control Checklist',
          'Documentation Forms',
          'Camera for Documentation',
        ],
      },
    ];

    return baseSuggestions;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
          >
            <Icon
              path={isExpanded ? mdiChevronDown : mdiChevronRight}
              size={1.2}
              className="mr-2"
            />
            Checklist Management
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({checklists.length} total)
            </span>
          </button>
          <button
            onClick={() => {
              setIsAddingChecklist(true);
              setSelectedChecklist(null);
            }}
            className="flex items-center px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors"
          >
            <Icon path={mdiPlus} size={1} className="mr-2" />
            Add Checklist
          </button>
        </div>

        {/* Checklists by Category */}
        {isExpanded && (
          <ChecklistList
            checklists={checklists}
            onEditChecklist={handleEditChecklist}
            onDeleteChecklist={deleteChecklist}
          />
        )}
      </div>

      {/* Consolidated Modal for Edit & Manage Items */}
      {(selectedChecklist || isAddingChecklist) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                {isAddingChecklist
                  ? 'Add New Checklist'
                  : `Edit: ${selectedChecklist?.title}`}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Icon path={mdiClose} size={1.2} />
              </button>
            </div>

            {/* Checklist Form */}
            <ChecklistForm
              selectedChecklist={selectedChecklist}
              isAddingChecklist={isAddingChecklist}
              onCancel={handleCancel}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublishChecklist}
            />

            {/* Checklist Items Section - Only show when editing existing checklist */}
            {selectedChecklist && (
              <ChecklistItemForm
                selectedChecklist={selectedChecklist}
                onAddItem={handleAddItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onGenerateAIItemSuggestions={generateAIItemSuggestions}
                showAIItemSuggestions={showAIItemSuggestions}
                isGeneratingSuggestions={isGeneratingSuggestions}
                aiItemSuggestions={aiItemSuggestions}
                onApplyAIItemSuggestion={applyAIItemSuggestion}
                onCloseAISuggestions={() => setShowAIItemSuggestions(false)}
                showSuccessMessage={showSuccessMessage}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChecklistManagement;
