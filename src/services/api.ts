import { Product, Purchase, PurchaseCreateDTO } from '../types/Item';

const BASE_URL = process.env.api_baseurl || 'http://localhost:8080';

export const api = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  getProduct: async (id: number): Promise<Product> => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  createProduct: async (data: any): Promise<Product> => {
    const res = await fetch(`${BASE_URL}/products/with-properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  // Checkout
  createCheckoutSession: async (): Promise<{ sessionId: string; clientSecret: string }> => {
    const res = await fetch(`${BASE_URL}/checkout/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to create checkout session');
    return res.json();
  },

  getSessionStatus: async (sessionId: string): Promise<{ status: string }> => {
    const res = await fetch(`${BASE_URL}/checkout/session-status?sessionId=${sessionId}`);
    if (!res.ok) throw new Error('Failed to get session status');
    return res.json();
  },

  // Purchases
  createPurchase: async (data: PurchaseCreateDTO): Promise<Purchase> => {
    const res = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create purchase');
    return res.json();
  },

  getPurchaseByStripeSession: async (stripeSessionId: string): Promise<Purchase> => {
    const res = await fetch(`${BASE_URL}/purchases/stripe/${stripeSessionId}`);
    if (!res.ok) throw new Error('Purchase not found');
    return res.json();
  },
};