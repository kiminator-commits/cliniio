import { toast } from 'react-hot-toast';

/**
 * Inventory feedback service
 * Provides toast-based user notifications for inventory workflows
 * UI-agnostic service that safely triggers global toast events
 */

/**
 * Generic toast helper
 * @param message - Message to display
 * @param type - Toast type (success, error, warning, info)
 */
export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast(message, {
        icon: '⚠️',
        style: {
          background: '#fef3c7',
          color: '#92400e',
        },
      });
      break;
    default:
      toast(message);
  }
  console.info(`[Toast:${type}] ${message}`);
}

/**
 * Feedback for successful exports
 * @param count - Number of items exported
 * @param format - Export format (csv, json)
 */
export function notifyExportSuccess(count: number, format: string) {
  const msg = `✅ Successfully exported ${count} items as ${format.toUpperCase()}`;
  showToast(msg, 'success');
}

/**
 * Feedback for export failures
 * @param error - Error message
 */
export function notifyExportFailure(error: string) {
  showToast(`❌ Export failed: ${error}`, 'error');
}

/**
 * Feedback for successful imports
 * @param count - Number of records imported
 * @param filename - Name of imported file
 */
export function notifyImportSuccess(count: number, filename: string) {
  showToast(`✅ Imported ${count} records from ${filename}`, 'success');
}

/**
 * Feedback for import failures
 * @param error - Error message
 */
export function notifyImportFailure(error: string) {
  showToast(`❌ Import failed: ${error}`, 'error');
}

/**
 * Feedback for successful uploads
 * @param count - Number of items uploaded
 */
export function notifyUploadSuccess(count: number) {
  showToast(`✅ Uploaded ${count} scanned items to Supabase`, 'success');
}

/**
 * Feedback for upload failures
 * @param error - Error message
 */
export function notifyUploadFailure(error: string) {
  showToast(`❌ Upload failed: ${error}`, 'error');
}

/**
 * Feedback for duplicate barcode scanning
 * @param barcode - Duplicate barcode value
 */
export function notifyDuplicateBarcode(barcode: string) {
  showToast(`⚠️ Item with barcode "${barcode}" already exists in inventory.`, 'warning');
}

/**
 * Feedback for missing item scanning
 * @param barcode - Missing barcode value
 */
export function notifyMissingItem(barcode: string) {
  showToast(`🚫 No item found for scanned barcode "${barcode}".`, 'error');
}
