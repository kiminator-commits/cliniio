// Library feature types

export interface LibraryItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  isFavourite?: boolean;
}

export interface LibraryCategory {
  id: string;
  name: string;
  description?: string;
}

export interface SDSSheet {
  id: string;
  title: string;
  chemicalName: string;
  casNumber?: string;
  hazards?: string[];
}
