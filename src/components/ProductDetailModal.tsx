import { useEffect, useMemo, useState } from 'react';
import { Product } from '../types/Item';
import '../styles/ProductDetailModal.css';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const toTitle = (value: string): string =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const subtitle = useMemo(() => {
    const rarity = toTitle(product.rarity);
    const attunement = product.attunement ? ' (requires attunement)' : '';
    return `${product.type}, ${rarity}${attunement}`;
  }, [product]);

  const hasWeaponStat = product.die > 0;
  const hasArmorStat = product.ac > 0;

  return (
    <div className="product-modal-overlay" onClick={onClose} role="presentation">
      <article className="product-modal arcane-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="product-modal-close" onClick={onClose} aria-label="Close details">x</button>

        <div className="product-modal-grid">
          <div className="product-modal-image-wrap">
            <img
              src={product.image || 'https://placehold.co/640x860/191207/e8d9be?text=No+Illustration'}
              alt={product.name}
              className="product-modal-image"
            />
            <span className={`rarity-badge rarity-${product.rarity}`}>{toTitle(product.rarity)}</span>
          </div>

          <div className="product-modal-content">
            <h2>{product.name}</h2>
            <p className="product-modal-subtitle">{subtitle}</p>

            <div className="rule-divider" />

            <section className="product-5e-block">
              <h3>Item Entry</h3>
              <p><em>{subtitle}</em></p>
              <p>{product.description}</p>
            </section>

            <section className="product-stats-grid">
              <div>
                <span className="label">Category</span>
                <span>{product.category}</span>
              </div>
              <div>
                <span className="label">Type</span>
                <span>{product.type}</span>
              </div>
              <div>
                <span className="label">Rarity</span>
                <span>{toTitle(product.rarity)}</span>
              </div>
              <div>
                <span className="label">Attunement</span>
                <span>{product.attunement ? 'Required' : 'Not required'}</span>
              </div>
              {hasWeaponStat && (
                <div>
                  <span className="label">Weapon Damage</span>
                  <span>1d{product.die}</span>
                </div>
              )}
              {hasArmorStat && (
                <div>
                  <span className="label">Armor Class</span>
                  <span>{product.ac}</span>
                </div>
              )}
              {product.bonus > 0 && (
                <div>
                  <span className="label">Magical Bonus</span>
                  <span>+{product.bonus}</span>
                </div>
              )}
              {product.charges > 0 && (
                <div>
                  <span className="label">Charges</span>
                  <span>{product.charges}</span>
                </div>
              )}
            </section>

            {product.itemProperties?.length > 0 && (
              <section className="product-modal-properties">
                <h3>Properties</h3>
                <ul>
                  {product.itemProperties.map((prop) => (
                    <li key={prop.id}>
                      <strong>{prop.name}:</strong> {prop.description}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="product-modal-actions">
              <div className="quantity-input">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                />
                <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>

              <button className="btn-arcane" onClick={() => onAddToCart(product, quantity)}>
                Add to Cart
              </button>
            </div>

            <p className="product-modal-price">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
