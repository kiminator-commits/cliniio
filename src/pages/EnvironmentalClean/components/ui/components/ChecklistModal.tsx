import React from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';
import { BaseModal } from '@/components/BaseModal';
import ChecklistItem from './ChecklistItem';
import { StolenItemsSection } from './StolenItemsSection';
import { PrnItemsSection } from './PrnItemsSection';
import { NotesSection } from './NotesSection';
import { Checklist } from '../types/cleaningChecklists';

interface ChecklistModalProps {
  showModal: boolean;
  selectedCategory: unknown;
  selectedChecklist: Checklist | null;
  bypassedItems: Set<string>;
  adjustedQuantities: Record<string, number>;
  stolenItems: unknown[];
  prnItems: unknown[];
  notes: string;
  isListening: boolean;
  transcript: string;
  onClose: () => void;
  onChecklistSelect: (checklist: Checklist) => void;
  onSetSelectedChecklist: (checklist: Checklist | null) => void;
  onBypassItem: (itemId: string) => void;
  onAdjustQuantity: (itemId: string, quantity: number) => void;
  onViewSDS: (sds: unknown) => void;
  onAddStolenItem: () => void;
  onUpdateStolenItem: (
    index: number,
    field: string,
    value: string | number
  ) => void;
  onClearStolenItems: () => void;
  onAddPrnItem: () => void;
  onUpdatePrnItem: (
    index: number,
    field: string,
    value: string | number
  ) => void;
  onClearPrnItems: () => void;
  onNotesChange: (notes: string) => void;
  onClearNotes: () => void;
  onStartSpeechRecognition: () => void;
  onStopSpeechRecognition: () => void;
  onApplyTranscriptToNotes: (setNotes: (notes: string) => void) => void;
  getChecklistsForCategory: (categoryId: string) => Checklist[];
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  showModal,
  selectedCategory,
  selectedChecklist,
  bypassedItems,
  adjustedQuantities,
  stolenItems,
  prnItems,
  notes,
  isListening,
  transcript,
  onClose,
  onChecklistSelect,
  onSetSelectedChecklist,
  onBypassItem,
  onAdjustQuantity,
  onViewSDS,
  onAddStolenItem,
  onUpdateStolenItem,
  onClearStolenItems,
  onAddPrnItem,
  onUpdatePrnItem,
  onClearPrnItems,
  onNotesChange,
  onClearNotes,
  onStartSpeechRecognition,
  onStopSpeechRecognition,
  onApplyTranscriptToNotes,
  getChecklistsForCategory,
}) => {
  return (
    <BaseModal
      show={showModal}
      onClose={onClose}
      title={selectedCategory?.title || 'Select Checklist'}
      footer={
        <div className="flex justify-end w-full">
          <button
            onClick={onClose}
            className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      {!selectedChecklist ? (
        <div className="space-y-3">
          {selectedCategory &&
            getChecklistsForCategory(selectedCategory.id).map((checklist) => (
              <div
                key={checklist.id}
                onClick={() => onChecklistSelect(checklist)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && onChecklistSelect(checklist)
                }
                className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Select ${checklist.title} checklist`}
              >
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  {checklist.title}
                </h3>
                <p className="text-sm text-gray-600">{checklist.description}</p>
              </div>
            ))}
          {selectedCategory &&
            getChecklistsForCategory(selectedCategory.id).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No published checklists available for this category.</p>
                <p className="text-sm mt-1">
                  Create and publish checklists in Settings to see them here.
                </p>
              </div>
            )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedChecklist.title}
            </h2>
            <button
              onClick={() => onSetSelectedChecklist(null)}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <Icon path={mdiArrowLeft} size={1} className="mr-1" />
              Back to Lists
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {selectedChecklist.items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                bypassedItems={bypassedItems}
                adjustedQuantities={adjustedQuantities}
                onBypassItem={onBypassItem}
                onAdjustQuantity={onAdjustQuantity}
                onViewSDS={onViewSDS}
              />
            ))}
          </div>

          <StolenItemsSection
            stolenItems={stolenItems}
            onAddStolenItem={onAddStolenItem}
            onUpdateStolenItem={onUpdateStolenItem}
            onClearStolenItems={onClearStolenItems}
          />

          <PrnItemsSection
            prnItems={prnItems}
            onAddPrnItem={onAddPrnItem}
            onUpdatePrnItem={onUpdatePrnItem}
            onClearPrnItems={onClearPrnItems}
          />

          <NotesSection
            notes={notes}
            isListening={isListening}
            transcript={transcript}
            onNotesChange={onNotesChange}
            onClearNotes={onClearNotes}
            onStartSpeechRecognition={onStartSpeechRecognition}
            onStopSpeechRecognition={onStopSpeechRecognition}
            onApplyTranscriptToNotes={onApplyTranscriptToNotes}
          />
        </div>
      )}
    </BaseModal>
  );
};
