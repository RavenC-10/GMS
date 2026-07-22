export interface ShoppingListItem {
  id?: number;
  name: string;
  brand?: string;
  qty: number;
  unit?: string;
  createdAt?: string;
}

export interface Category {
  id?: number;
  name: string;
}

export interface Location {
  id?: number;
  name: string;
}

export interface Unit {
  id?: number;
  name: string;
}

export interface ImageStore {
  id: string;
  dataUrl: string;
}

export interface InventoryItem {
  id?: number;
  imageId?: string | null;
  name: string;
  brand: string;
  category: string;
  location: string;
  qty: number;
  unit: string;
  price: number;
  purchaseDate: string;
  expiryDate: string;
  desc?: string;
}
