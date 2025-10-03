import React from 'react';
import { Checklist } from '../../store/checklistStore';
import {
  useChecklistFormState,
  BasicDetails,
  SchedulingConfiguration,
  ActionButtons,
} from './ChecklistForm/index';

interface ChecklistFormProps {
  selectedChecklist: Checklist | null;
  isAddingChecklist: boolean;
  onCancel: () => void;
  onSaveDraft: (formData: Partial<Checklist>) => void;
  onPublish: () => void;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({
  selectedChecklist,
  isAddingChecklist,
  onSaveDraft,
  onPublish,
}) => {
  const {
    checklistFormData,
    showAIChecklistSuggestions,
    isGeneratingSuggestions,
    aiChecklistSuggestions,
    setChecklistFormData,
    setShowAIChecklistSuggestions,
    generateAIChecklistSuggestions,
    applyAIChecklistSuggestion,
  } = useChecklistFormState(selectedChecklist, isAddingChecklist);

  const handleSaveDraft = () => {
    if (checklistFormData.title && checklistFormData.category) {
      onSaveDraft(checklistFormData);
    }
  };

  const handlePublish = () => {
    if (checklistFormData.title && checklistFormData.category) {
      // First save the draft with current form data
      onSaveDraft(checklistFormData);
      // Then publish the checklist
      onPublish();
    }
  };

  const isFormValid =
    checklistFormData.title.trim() !== '' &&
    checklistFormData.category !== null;

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="text-md font-medium mb-3">Checklist Details</h4>

      <BasicDetails
        checklistFormData={checklistFormData}
        setChecklistFormData={setChecklistFormData}
        showAIChecklistSuggestions={showAIChecklistSuggestions}
        isGeneratingSuggestions={isGeneratingSuggestions}
        aiChecklistSuggestions={aiChecklistSuggestions}
        onGenerateAISuggestions={generateAIChecklistSuggestions}
        onApplyAISuggestion={applyAIChecklistSuggestion}
        onCloseAISuggestions={() => setShowAIChecklistSuggestions(false)}
      />

      <SchedulingConfiguration
        checklistFormData={checklistFormData}
        setChecklistFormData={setChecklistFormData}
      />

      <ActionButtons
        selectedChecklist={selectedChecklist}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isValid={isFormValid}
      />
    </div>
  );
};

export default ChecklistForm;
