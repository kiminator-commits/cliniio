export interface BarcodeData {
  itemId: string;
  itemName: string;
  category: string;
}

export interface FormDataFromBarcode {
  item: string;
  category: string;
  toolId: string;
  location: string;
  cost: number;
  p2Status: string;
}

/**
 * Parses barcode data and returns structured information
 * @param barcodeData - Raw barcode string (format: INV-001-Surgical Scissors)
 * @returns Parsed barcode data or null if invalid
 */
export const parseBarcodeData = (barcodeData: string): BarcodeData | null => {
  if (!barcodeData) return null;

  const parts = barcodeData.split('-');
  if (parts.length >= 3) {
    const itemId = parts[1];
    const itemName = parts.slice(2).join('-');

    return {
      itemId,
      itemName,
      category: 'tools', // Default category for barcode items
    };
  }

  return null;
};

/**
 * Converts barcode data to form data structure
 * @param barcodeData - Raw barcode string
 * @returns Form data object or default empty form
 */
export const createFormDataFromBarcode = (barcodeData?: string): FormDataFromBarcode => {
  if (!barcodeData) {
    return {
      item: '',
      category: '',
      toolId: '',
      location: '',
      cost: 0,
      p2Status: 'clean',
    };
  }

  const parsed = parseBarcodeData(barcodeData);
  if (!parsed) {
    return {
      item: '',
      category: '',
      toolId: '',
      location: '',
      cost: 0,
      p2Status: 'clean',
    };
  }

  return {
    item: parsed.itemName,
    category: parsed.category,
    toolId: parsed.itemId,
    location: '',
    cost: 0,
    p2Status: 'clean',
  };
};
