/**
 * Pure formatting functions for inventory data display
 * Handles text formatting, date formatting, and display transformations
 */

export interface InventoryItem {
  id?: string;
  name: string;
  quantity: number;
  category: string;
  status: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormattingOptions {
  dateFormat?: 'short' | 'long' | 'relative';
  numberFormat?: 'default' | 'compact' | 'currency';
  textCase?: 'default' | 'title' | 'upper' | 'lower';
}

/**
 * Formats a date string for display
 */
export const formatDate = (
  dateString: string | undefined,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return 'Invalid Date';

  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'relative':
      return formatRelativeDate(date);
    default:
      return date.toLocaleDateString();
  }
};

/**
 * Formats a date as relative time (e.g., "2 days ago")
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays === -1) return 'Tomorrow';
  if (diffInDays > 0) return `${diffInDays} days ago`;
  if (diffInDays < 0) return `In ${Math.abs(diffInDays)} days`;

  return date.toLocaleDateString();
};

/**
 * Formats a number for display
 */
export const formatNumber = (
  number: number,
  format: 'default' | 'compact' | 'currency' = 'default'
): string => {
  if (isNaN(number)) return 'N/A';

  switch (format) {
    case 'compact':
      return formatCompactNumber(number);
    case 'currency':
      return formatCurrency(number);
    default:
      return number.toLocaleString();
  }
};

/**
 * Formats a number in compact notation (e.g., 1.2K, 1.5M)
 */
export const formatCompactNumber = (number: number): string => {
  if (number < 1000) return number.toString();
  if (number < 1000000) return `${(number / 1000).toFixed(1)}K`;
  if (number < 1000000000) return `${(number / 1000000).toFixed(1)}M`;
  return `${(number / 1000000000).toFixed(1)}B`;
};

/**
 * Formats a number as currency
 */
export const formatCurrency = (number: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
};

/**
 * Formats text with specified case
 */
export const formatText = (
  text: string,
  textCase: 'default' | 'title' | 'upper' | 'lower' = 'default'
): string => {
  if (!text) return '';

  switch (textCase) {
    case 'title':
      return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    default:
      return text;
  }
};

/**
 * Formats inventory item name for display
 */
export const formatItemName = (name: string): string => {
  return formatText(name, 'title');
};

/**
 * Formats inventory item category for display
 */
export const formatCategory = (category: string): string => {
  return formatText(category, 'title');
};

/**
 * Formats inventory item status for display
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    expired: 'Expired',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };

  return statusMap[status.toLowerCase()] || formatText(status, 'title');
};

/**
 * Formats quantity with appropriate units
 */
export const formatQuantity = (quantity: number): string => {
  if (quantity === 0) return '0';
  if (quantity === 1) return '1 item';
  return `${formatNumber(quantity)} items`;
};

/**
 * Formats expiry date with warning indicators
 */
export const formatExpiryDate = (expiryDate: string | undefined): string => {
  if (!expiryDate) return 'No expiry date';

  const date = new Date(expiryDate);
  const now = new Date();
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `${formatDate(expiryDate)} (Expired)`;
  }

  if (diffInDays <= 7) {
    return `${formatDate(expiryDate)} (Expires in ${diffInDays} days)`;
  }

  if (diffInDays <= 30) {
    return `${formatDate(expiryDate)} (Expires soon)`;
  }

  return formatDate(expiryDate);
};

/**
 * Formats inventory item for table display
 */
export const formatItemForTable = (item: InventoryItem): Record<string, string> => {
  return {
    name: formatItemName(item.name),
    quantity: formatQuantity(item.quantity),
    category: formatCategory(item.category),
    status: formatStatus(item.status),
    expiryDate: formatExpiryDate(item.expiryDate),
    createdAt: formatDate(item.createdAt),
    updatedAt: formatDate(item.updatedAt),
  };
};

/**
 * Formats inventory item for card display
 */
export const formatItemForCard = (item: InventoryItem): Record<string, string> => {
  return {
    name: formatItemName(item.name),
    quantity: formatNumber(item.quantity),
    category: formatCategory(item.category),
    status: formatStatus(item.status),
    expiryDate: formatExpiryDate(item.expiryDate),
  };
};

/**
 * Formats inventory metrics for display
 */
export const formatMetrics = (metrics: Record<string, number>): Record<string, string> => {
  const formatted: Record<string, string> = {};

  Object.entries(metrics).forEach(([key, value]) => {
    if (typeof value === 'number') {
      formatted[key] = formatNumber(value);
    } else {
      formatted[key] = String(value);
    }
  });

  return formatted;
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats duration in milliseconds to human readable format
 */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;

  return `${seconds}s`;
};

/**
 * Formats percentage for display
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (isNaN(value)) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phoneNumber;
};

/**
 * Formats email for display (masks sensitive parts)
 */
export const formatEmail = (email: string, mask: boolean = false): string => {
  if (!email) return '';

  if (!mask) return email;

  const [localPart, domain] = email.split('@');

  if (localPart.length <= 2) return email;

  const maskedLocal =
    localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);

  return `${maskedLocal}@${domain}`;
};
