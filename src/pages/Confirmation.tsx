import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Purchase } from '../types/Item';
import { api } from '../services/api';
import '../styles/Confirmation.css';

export default function Confirmation() {
  const { items, total, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [statusText, setStatusText] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = useMemo(() => searchParams.get('session_id') || '', [searchParams]);

  useEffect(() => {
    const syncPurchase = async () => {
      if (!sessionId) {
        setError('No Stripe session was provided.');
        setLoading(false);
        return;
      }

      try {
        const stripeStatus = await api.getSessionStatus(sessionId);
        setStatusText(stripeStatus.status.toUpperCase());

        let existingPurchase: Purchase | null = null;
        try {
          existingPurchase = await api.getPurchaseByStripeSession(sessionId);
        } catch {
          existingPurchase = null;
        }

        if (existingPurchase) {
          setPurchase(existingPurchase);
          if (existingPurchase.purchaseStatus === 'COMPLETED' || stripeStatus.status === 'complete') {
            clearCart();
          }
          return;
        }

        if (items.length === 0) {
          setError('Cart is empty, so we could not persist a purchase record.');
          return;
        }

        const created = await api.createPurchase({
          stripeSessionId: sessionId,
          purchaseTotal: total,
          lineItems: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        });

        setPurchase(created);
        if (stripeStatus.status === 'complete') {
          clearCart();
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load confirmation details';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void syncPurchase();
  }, [sessionId, items, total, clearCart]);

  if (loading) {
    return (
      <section className="confirmation-container">
        <div className="loading-spinner" aria-label="Loading confirmation" />
      </section>
    );
  }

  const resolvedTotal =
    typeof purchase?.purchaseTotal === 'number'
      ? purchase.purchaseTotal
      : typeof (purchase as any)?.purchase_total === 'number'
        ? (purchase as any).purchase_total
        : null;

  return (
    <section className="confirmation-container">
      <article className="confirmation-card arcane-card fade-in">
        <div className="success-icon">✓</div>
        <h1>Order Chronicle</h1>
        <p className="thank-you">Thank you for your purchase</p>

        {error && <p className="error-message">{error}</p>}

        <div className="order-details">
          <div className="detail-row">
            <span className="label">Stripe Session</span>
            <span className="value">{sessionId || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Payment Status</span>
            <span className="value">{statusText}</span>
          </div>
          <div className="detail-row">
            <span className="label">Purchase Status</span>
            <span className={`status status-${(purchase?.purchaseStatus || 'PENDING').toLowerCase()}`}>
              {purchase?.purchaseStatus || 'PENDING'}
            </span>
          </div>
          {purchase?.purchaseDateTime && (
            <div className="detail-row">
              <span className="label">Date</span>
              <span className="value">{new Date(purchase.purchaseDateTime).toLocaleString()}</span>
            </div>
          )}
        </div>

        {purchase && (
          <>
            <div className="items-summary">
              <h3>Line Items</h3>
              <ul className="items-list">
                {purchase.lineItems.map((line) => (
                  <li key={line.id}>
                    <span>{line.product?.name || `Product #${line.productId}`}</span>
                    <span>x{line.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-total">
              <span>Total</span>
              <span>{resolvedTotal !== null ? `$${resolvedTotal.toFixed(2)}` : 'N/A'}</span>
            </div>
          </>
        )}

        <Link className="btn-arcane" to="/">Return to Catalogue</Link>
      </article>
    </section>
  );
}