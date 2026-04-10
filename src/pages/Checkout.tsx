import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe, StripeEmbeddedCheckoutOptions } from '@stripe/stripe-js';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import '../styles/Checkout.css';

export default function Checkout() {
  const { items, total } = useCart();
  const [error, setError] = useState<string | null>(null);

  const stripePromise = useMemo(() => {
    const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    return key ? loadStripe(key) : null;
  }, []);

  const fetchClientSecret = useCallback(async () => {
    try {
      const data = await api.createCheckoutSession();
      return data.clientSecret;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create Stripe session';
      setError(message);
      throw error;
    }
  }, []);

  const options: StripeEmbeddedCheckoutOptions = { fetchClientSecret };

  if (items.length === 0) {
    return (
      <section className="checkout-container">
        <h1>Arcane Checkout</h1>
        <div className="checkout-empty arcane-card">
          <p>No relics selected yet.</p>
          <Link className="btn-arcane" to="/">Return to Catalogue</Link>
        </div>
      </section>
    );
  }

  if (!stripePromise) {
    return (
      <section className="checkout-container">
        <h1>Arcane Checkout</h1>
        <p className="error-message">
          Stripe key is missing. Add REACT_APP_STRIPE_PUBLISHABLE_KEY to storefront/.env.
        </p>
      </section>
    );
  }

  return (
    <section className="checkout-container">
      <header className="checkout-header fade-in">
        <h1>Arcane Checkout</h1>
        <p>Complete secure payment through Stripe and seal your order.</p>
        <p className="checkout-total">Cart subtotal: ${total.toFixed(2)}</p>
      </header>

      {error && <p className="error-message">{error}</p>}

      <div id="checkout" className="checkout-embed arcane-card">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </section>
  );
}