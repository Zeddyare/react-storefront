import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Purchase } from '../types/Item';
import { api } from '../services/api';
import '../styles/Confirmation.css';

const CHECKOUT_SNAPSHOT_PREFIX = 'checkout_snapshot:';

type CheckoutSnapshot = {
  sessionId: string;
  purchaseTotal: number;
  lineItems: Array<{ productId: number; quantity: number }>;
};

export default function Confirmation() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [statusText, setStatusText] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const createAttemptedRef = useRef(false);

  const sessionId = useMemo(() => searchParams.get('session_id') || '', [searchParams]);

  useEffect(() => {
    const syncPurchase = async () => {
      setError(null);
      setLoading(true);

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
          localStorage.removeItem(`${CHECKOUT_SNAPSHOT_PREFIX}${sessionId}`);

          if (existingPurchase.purchaseStatus === 'COMPLETED' || stripeStatus.status === 'complete') {
            clearCart();
          }
          return;
        }

        // Prevent duplicate create calls in StrictMode double-effect behavior.
        if (createAttemptedRef.current) {
          return;
        }
        createAttemptedRef.current = true;

        const snapshotRaw = localStorage.getItem(`${CHECKOUT_SNAPSHOT_PREFIX}${sessionId}`);
        if (!snapshotRaw) {
          setError('Purchase record is not available yet, and no checkout snapshot was found.');
          return;
        }

        let snapshot: CheckoutSnapshot | null = null;
        try {
          snapshot = JSON.parse(snapshotRaw) as CheckoutSnapshot;
        } catch {
          snapshot = null;
        }

        if (
          !snapshot ||
          snapshot.sessionId !== sessionId ||
          typeof snapshot.purchaseTotal !== 'number' ||
          !Array.isArray(snapshot.lineItems) ||
          snapshot.lineItems.length === 0
        ) {
          setError('Checkout snapshot is invalid. Please contact support with your Stripe session id.');
          return;
        }

        const created = await api.createPurchase({
          stripeSessionId: sessionId,
          purchaseTotal: snapshot.purchaseTotal,
          lineItems: snapshot.lineItems,
        });

        setPurchase(created);
        localStorage.removeItem(`${CHECKOUT_SNAPSHOT_PREFIX}${sessionId}`);

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
  }, [sessionId, clearCart]);

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
                {(purchase.lineItems || []).map((line) => (
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