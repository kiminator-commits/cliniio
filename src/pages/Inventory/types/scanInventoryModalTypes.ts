export interface ParsedItem {
  id?: string;
  item: string;
  name?: string;
  category: string;
  location: string;
  quantity: number;
  cost: number;
  vendor?: string;
  purchaseDate?: string;
  notes?: string;
  barcode?: string;
}
