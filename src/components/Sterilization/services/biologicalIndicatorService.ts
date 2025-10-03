import { BITestResult } from '../../../types/sterilizationTypes';

export interface BITestValidation {
  isValid: boolean;
  errorMessage?: string;
}

export class BiologicalIndicatorService {
  static validateBITestSubmission(
    selectedResult: 'pass' | 'fail' | 'skip' | null,
    lastTestDate: Date | null
  ): BITestValidation {
    if (!selectedResult) {
      return { isValid: false, errorMessage: 'Please select a test result' };
    }

    const today = new Date().toDateString();
    if (lastTestDate && new Date(lastTestDate).toDateString() === today) {
      return {
        isValid: false,
        errorMessage: 'A BI test has already been logged for today.',
      };
    }

    return { isValid: true };
  }

  static createBITestResult(
    result: 'pass' | 'fail' | 'skip',
    operatorName: string
  ): BITestResult {
    return {
      id: `bi-test-${Date.now()}`,
      toolId: 'default',
      passed: result === 'pass',
      date: new Date(),
      status: result,
      operator: operatorName,
    };
  }

  static getFailWarningMessage(): string {
    return 'All sterilization cycles since the last successful BI test must be quarantined and re-sterilized. Contact your supervisor immediately.';
  }

  static shouldShowFailWarning(
    result: 'pass' | 'fail' | 'skip' | null
  ): boolean {
    return result === 'fail';
  }

  static getSubmitButtonState(
    selectedResult: 'pass' | 'fail' | 'skip' | null,
    isSubmitting: boolean
  ): {
    disabled: boolean;
    className: string;
  } {
    const disabled = !selectedResult || isSubmitting;
    const className =
      selectedResult && !isSubmitting
        ? 'bg-orange-500 text-white hover:bg-orange-600'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed';

    return { disabled, className };
  }

  static getResultSelectionClasses(
    selectedResult: 'pass' | 'fail' | 'skip' | null,
    currentResult: 'pass' | 'fail' | 'skip'
  ): string {
    if (selectedResult === currentResult) {
      switch (currentResult) {
        case 'pass':
          return 'border-green-500 bg-green-50';
        case 'fail':
          return 'border-red-500 bg-red-50';
        case 'skip':
          return 'border-gray-500 bg-gray-50';
        default:
          return 'border-gray-200';
      }
    }
    return 'border-gray-200';
  }

  static getCurrentDateTime(): string {
    return `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
  }
}
