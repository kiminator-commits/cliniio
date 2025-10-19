import { useState, useEffect } from 'react';
import { Checklist } from '@/store/checklistStore';
import { UnifiedAIService } from '@/services/ai/UnifiedAIService';
import {
  ChecklistFormData,
  DEFAULT_CHECKLIST_FORM_DATA,
} from '../../../../types/checklistTypes';

export const useChecklistFormState = (
  selectedChecklist: Checklist | null,
  isAddingChecklist: boolean
) => {
  const [checklistFormData, setChecklistFormData] = useState<ChecklistFormData>(
    DEFAULT_CHECKLIST_FORM_DATA
  );

  // AI Suggestion state
  const [showAIChecklistSuggestions, setShowAIChecklistSuggestions] =
    useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [aiChecklistSuggestions, setAiChecklistSuggestions] = useState<
    string[]
  >([]);

  // Initialize form data when selectedChecklist changes
  useEffect(() => {
    if (selectedChecklist) {
      setChecklistFormData({
        title: selectedChecklist.title,
        category: selectedChecklist.category,
        // Load scheduling data if it exists
        autoSchedule: selectedChecklist.autoSchedule || false,
        scheduleFrequency: selectedChecklist.scheduleFrequency || 'weekly',
        scheduleDay: selectedChecklist.scheduleDay || 'monday',
        scheduleTime: selectedChecklist.scheduleTime || '09:00',
        schedulePriority: selectedChecklist.schedulePriority || 'medium',
        schedulePoints: selectedChecklist.schedulePoints || 50,
        scheduleDuration: selectedChecklist.scheduleDuration || 30,
        triggerRoomStatus: selectedChecklist.triggerRoomStatus || false,
        triggerStaffSchedule: selectedChecklist.triggerStaffSchedule || false,
        triggerAdminDecision: selectedChecklist.triggerAdminDecision || false,
      });
    } else if (isAddingChecklist) {
      setChecklistFormData({
        title: '',
        category: 'setup',
        autoSchedule: false,
        scheduleFrequency: 'weekly',
        scheduleDay: 'monday',
        scheduleTime: '09:00',
        schedulePriority: 'medium',
        schedulePoints: 50,
        scheduleDuration: 30,
        triggerRoomStatus: false,
        triggerStaffSchedule: false,
        triggerAdminDecision: false,
      });
    }
  }, [selectedChecklist, isAddingChecklist]);

  // AI Suggestion Functions
  const generateAIChecklistSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      // Use UnifiedAIService for AI-powered checklist title suggestions
      try {
        // Generate AI suggestions using the unified AI service
        const aiResponse = await UnifiedAIService.askAI(
          `Generate 8 checklist title suggestions for the ${checklistFormData.category} category. Each title should be descriptive and follow healthcare facility naming conventions.`,
          {
            module: 'checklist-form',
            facilityId: 'unknown',
            userId: 'unknown'
          }
        );

        // Parse the AI response to extract title suggestions
        const suggestions = parseAIResponseToTitles(aiResponse);
        setAiChecklistSuggestions(suggestions);
        setShowAIChecklistSuggestions(true);
      } catch (aiError) {
        // Fallback to simulation if AI service fails
        console.warn('AI service failed, using fallback suggestions:', aiError);
        const suggestions = await simulateAIChecklistSuggestions(
          checklistFormData.category
        );
        setAiChecklistSuggestions(suggestions);
        setShowAIChecklistSuggestions(true);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Fallback to simulation on error
      const suggestions = await simulateAIChecklistSuggestions(
        checklistFormData.category
      );
      setAiChecklistSuggestions(suggestions);
      setShowAIChecklistSuggestions(true);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applyAIChecklistSuggestion = (suggestion: string) => {
    setChecklistFormData((prev) => ({ ...prev, title: suggestion }));
    setShowAIChecklistSuggestions(false);
  };

  // Helper function to parse AI response into title suggestions
  const parseAIResponseToTitles = (aiResponse: string): string[] => {
    try {
      // Try to extract JSON array from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item) =>
            typeof item === 'string'
              ? item
              : item.title ||
                item.name ||
                item.suggestion ||
                'Untitled Checklist'
          );
        }
      }

      // Fallback: parse text response into title list
      const lines = aiResponse.split('\n').filter((line) => line.trim());
      const titles = [];

      for (const line of lines) {
        if (line.match(/^\d+\./)) {
          // Extract title from numbered list
          const title = line.replace(/^\d+\.\s*/, '').trim();
          if (title) {
            titles.push(title);
          }
        } else if (
          line.trim() &&
          !line.toLowerCase().includes('category') &&
          !line.toLowerCase().includes('suggestions')
        ) {
          // Add non-category lines as potential titles
          titles.push(line.trim());
        }
      }

      return titles.length > 0
        ? titles
        : [
            'AI-generated checklist',
            'Custom checklist',
            'Professional checklist',
          ];
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return fallback titles
      return [
        'AI-generated checklist',
        'Custom checklist',
        'Professional checklist',
      ];
    }
  };

  // AI Simulation Functions (replace with actual AI API calls)
  const simulateAIChecklistSuggestions = async (
    category: string
  ): Promise<string[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const suggestionsByCategory = {
      setup: [
        'Treatment Room Setup Checklist',
        'Surgical Suite Preparation',
        'Examination Room Setup',
        'Emergency Room Preparation',
        'Laboratory Setup Protocol',
        'Radiology Room Setup',
        'Pharmacy Setup Checklist',
        'Reception Area Setup',
      ],
      patient: [
        'Patient Room Cleaning Protocol',
        'Isolation Room Procedures',
        'Post-Procedure Room Cleanup',
        'Patient Equipment Sanitization',
        'Bedside Supply Restocking',
        'Patient Safety Equipment Check',
        'Infection Control Protocol',
        'Patient Comfort Items Setup',
      ],
      weekly: [
        'Weekly Deep Cleaning Protocol',
        'Equipment Maintenance Schedule',
        'Supply Inventory Audit',
        'Safety Equipment Inspection',
        'Emergency Equipment Check',
        'Compliance Documentation Review',
        'Staff Training Verification',
        'Quality Assurance Audit',
      ],
      public: [
        'Waiting Room Maintenance',
        'Lobby Cleaning Protocol',
        'Restroom Sanitization',
        'Common Area Disinfection',
        'Public Equipment Cleaning',
        'Visitor Area Maintenance',
        'Cafeteria Cleaning Protocol',
        'Parking Area Maintenance',
      ],
      deep: [
        'Post-Contamination Deep Clean',
        'Equipment Sterilization Protocol',
        'Ventilation System Cleaning',
        'Structural Disinfection',
        'Biohazard Cleanup Protocol',
        'Emergency Response Cleanup',
        'Infection Outbreak Response',
        'Facility-Wide Sanitization',
      ],
    };

    return (
      suggestionsByCategory[category as keyof typeof suggestionsByCategory] ||
      []
    );
  };

  return {
    // State
    checklistFormData,
    showAIChecklistSuggestions,
    isGeneratingSuggestions,
    aiChecklistSuggestions,

    // Actions
    setChecklistFormData,
    setShowAIChecklistSuggestions,
    generateAIChecklistSuggestions,
    applyAIChecklistSuggestion,
  };
};
