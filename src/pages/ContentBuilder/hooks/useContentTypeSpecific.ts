import { useState, useCallback } from 'react';

interface ContentTypeSpecificActions<T extends Record<string, unknown>> {
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateMultipleFields: (updates: Partial<T>) => void;
  resetFields: () => void;
  getFieldValue: <K extends keyof T>(field: K) => T[K];
  getAllFields: () => T;
}

export function useContentTypeSpecific<T extends Record<string, unknown>>(
  initialState: T,
  resetValues?: T
): T & ContentTypeSpecificActions<T> {
  const [state, setState] = useState<T>(initialState);

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetFields = useCallback(() => {
    setState(resetValues || initialState);
  }, [resetValues, initialState]);

  const getFieldValue = useCallback(
    <K extends keyof T>(field: K): T[K] => {
      return state[field];
    },
    [state]
  );

  const getAllFields = useCallback((): T => {
    return { ...state };
  }, [state]);

  return {
    ...state,
    updateField,
    updateMultipleFields,
    resetFields,
    getFieldValue,
    getAllFields,
  };
}

// Specialized hooks for specific content types
export function usePolicyEditor() {
  return useContentTypeSpecific({
    policyVersion: '1.0',
    requiresSignature: false,
    signatureDeadline: 30,
    acknowledgmentStatement:
      'I have read, understood, and agree to comply with this policy.',
    policyType: 'general',
  });
}

export function useProcedureEditor() {
  return useContentTypeSpecific({
    isRequired: false,
    reviewAnnually: false,
    estimatedDuration: 30,
    difficulty: 'beginner',
    department: '',
    responsiblePerson: '',
  });
}

export function useSMSEditor() {
  return useContentTypeSpecific({
    chemicalName: '',
    casNumber: '',
    hazardClass: '',
    storageRequirements: '',
    handlingInstructions: '',
    emergencyProcedures: '',
  });
}

export function usePathwayEditor() {
  return useContentTypeSpecific({
    pathwayDueDate: '',
    issueCertificate: false,
    requireFinalQuiz: false,
    quizQuestionCount: 10,
    quizPassingRate: 80,
    quizTimeLimit: 30,
  });
}
