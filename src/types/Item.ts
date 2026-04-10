// Enums
export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE' | 'LEGENDARY' | 'ARTIFACT';
export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// ItemProperty
export interface ItemProperty {
  id: number;
  name: string;
  description: string;
  productId?: number; // Optional reference to product (to avoid circular references)
}

// Product
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  attunement: boolean;
  type: string;
  rarity: Rarity;
  die: number;
  ac: number;
  bonus: number;
  charges: number;
  image: string;
  description: string;
  itemProperties: ItemProperty[];
  createdAt: string; // ISO 8601 timestamp
}

// Cart Item for frontend
export interface CartItem {
  product: Product;
  quantity: number;
}

// LineItem for API
export interface LineItem {
  id: number;
  purchaseId: number;
  productId: number;
  product?: Product; 
  quantity: number;
  price: number;
}

// Purchase
export interface Purchase {
  id: number;
  stripeSessionId: string;
  purchaseStatus: PurchaseStatus;
  purchaseTotal: number;
  purchaseDateTime: string; // ISO 8601 timestamp
  lineItems: LineItem[];
}

// DTOs
export interface PurchaseCreateDTO {
  stripeSessionId: string;
  purchaseTotal: number;
  lineItems: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface ProductCreateDTO {
  name: string;
  price: number;
  category: string;
  attunement: boolean;
  type: string;
  die: number;
  ac: number;
  bonus: number;
  charges: number;
  rarity: Rarity;
  description: string;
  image: string;
  properties: Array<{
    propertyName: string;
    propertyDescription: string;
  }>;
}