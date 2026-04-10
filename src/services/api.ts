import { Product, Purchase, PurchaseCreateDTO } from '../types/Item';

const BASE_URL = process.env.REACT_APP_API_BASEURL || 'http://localhost:8080';

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const api = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    return fetchJson<Product[]>(`${BASE_URL}/products`);
  },

  getProduct: async (id: number): Promise<Product> => {
    return fetchJson<Product>(`${BASE_URL}/products/${id}`);
  },

  createProduct: async (data: any): Promise<Product> => {
    return fetchJson<Product>(`${BASE_URL}/products/with-properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Checkout
  createCheckoutSession: async (): Promise<{ sessionId: string; clientSecret: string }> => {
    return fetchJson<{ sessionId: string; clientSecret: string }>(`${BASE_URL}/checkout/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  getSessionStatus: async (sessionId: string): Promise<{ status: string }> => {
    return fetchJson<{ status: string }>(`${BASE_URL}/checkout/session-status?sessionId=${encodeURIComponent(sessionId)}`);
  },

  // Purchases
  createPurchase: async (data: PurchaseCreateDTO): Promise<Purchase> => {
    return fetchJson<Purchase>(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  getPurchaseByStripeSession: async (stripeSessionId: string): Promise<Purchase> => {
    return fetchJson<Purchase>(`${BASE_URL}/purchases/stripe/${encodeURIComponent(stripeSessionId)}`);
  },

  chat: async (message: string, conversationId: string): Promise<string> => {
    const params = new URLSearchParams({ message, conversationId });
    const res = await fetch(`${BASE_URL}/chat?${params.toString()}`);
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Chat request failed');
    }
    return res.text();
  },
};