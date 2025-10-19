import { supabase } from '@/lib/supabaseClient';

/**
 * Inventory data transfer service
 * Handles export, import, and upload operations for inventory data
 */

/**
 * Convert array of objects to CSV string
 * @param data - Array of objects to convert
 * @returns CSV string representation
 */
function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))
  ];
  return csv.join('\n');
}

/**
 * Trigger browser download
 * @param filename - Name of the file to download
 * @param content - Content to download
 * @param type - MIME type of the file
 */
function triggerDownload(filename: string, content: string, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export selected items to CSV or JSON format
 * @param selectedItems - Array of selected items to export
 * @param format - Export format (csv or json)
 */
export async function handleBulkExport(selectedItems: any[], format: 'csv' | 'json' = 'csv') {
  if (!selectedItems.length) {
    console.warn('No items selected for export.');
    return;
  }
  const content = format === 'json' ? JSON.stringify(selectedItems, null, 2) : convertToCSV(selectedItems);
  const filename = `inventory_export_${new Date().toISOString().slice(0, 10)}.${format}`;
  triggerDownload(filename, content, format === 'json' ? 'application/json' : 'text/csv');
  console.info(`✅ Exported ${selectedItems.length} items to ${filename}`);
}

/**
 * Export all data or filtered subset
 * @param data - Array of data to export
 * @param format - Export format (csv or json)
 */
export async function handleExportData(data: any[], format: 'csv' | 'json' = 'csv') {
  const content = format === 'json' ? JSON.stringify(data, null, 2) : convertToCSV(data);
  const filename = `inventory_full_export_${new Date().toISOString().slice(0, 10)}.${format}`;
  triggerDownload(filename, content, format === 'json' ? 'application/json' : 'text/csv');
  console.info(`✅ Data exported as ${format.toUpperCase()} (${data.length} records)`);
}

/**
 * Import uploaded file data
 * @param file - File to import
 * @returns Parsed data array
 */
export async function handleImportData(file: File): Promise<any[]> {
  try {
    const text = await file.text();
    let parsed: any[];
    
    if (file.name.endsWith('.json')) {
      parsed = JSON.parse(text);
    } else if (file.name.endsWith('.csv')) {
      const [headerLine, ...lines] = text.split('\n');
      const headers = headerLine.split(',').map((h) => h.replace(/"/g, '').trim());
      parsed = lines.map((line) => {
        const values = line.split(',').map((v) => v.replace(/"/g, '').trim());
        return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
      });
    } else {
      throw new Error('Unsupported file format');
    }
    
    console.info(`✅ Imported ${parsed.length} records from ${file.name}`);
    return parsed;
  } catch (error: any) {
    console.error('❌ Failed to import file:', error.message);
    return [];
  }
}

/**
 * Upload scanned items to Supabase
 * @param items - Array of scanned items to upload
 */
export async function uploadScannedItems(items: any[]): Promise<void> {
  try {
    if (!items.length) {
      console.warn('No scanned items to upload.');
      return;
    }
    
    const { error } = await supabase
      .from('inventory_items')
      .upsert(items, { onConflict: 'id' });
      
    if (error) throw error;
    
    console.info(`✅ Uploaded ${items.length} scanned items to Supabase.`);
  } catch (error: any) {
    console.error('❌ Failed to upload scanned items:', error.message);
  }
}
