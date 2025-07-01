import { StateCreator } from 'zustand';

export interface ScannerState {
  scannedData: string;
  setScannedData: (value: string) => void;
}

export const createScannerStateSlice: StateCreator<ScannerState, [], [], ScannerState> = set => ({
  scannedData: '',
  setScannedData: value => set({ scannedData: value }),
});
