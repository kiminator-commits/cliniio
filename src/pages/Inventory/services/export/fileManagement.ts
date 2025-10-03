export class FileManagementService {
  /**
   * Create download URL for the exported data with memory cleanup
   */
  static createDownloadUrl(data: string | Blob, fileName: string): string {
    const blob =
      typeof data === 'string'
        ? new Blob([data], { type: 'text/plain' })
        : data;
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return url;
  }

  /**
   * Get data size in bytes
   */
  static getDataSize(data: string | Blob): number {
    if (typeof data === 'string') {
      return new Blob([data]).size;
    }
    return data.size;
  }

  /**
   * Get formatted date string for file names
   */
  static getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Generate filename with timestamp
   */
  static generateFileName(prefix: string, format: string): string {
    const timestamp = this.getDateString();
    return `${prefix}_${timestamp}.${format}`;
  }

  /**
   * Clean up URL object to prevent memory leaks
   */
  static revokeUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}
