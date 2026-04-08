import { useState } from 'react';
import { Product } from '../types/Item';
import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="arcane-card product-card fade-in">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        <span className={`rarity-badge rarity-${product.rarity}`}>
          {product.rarity}
        </span>
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        
        <p className="product-category">{product.category}</p>

        {product.attunement && (
          <p className="attunement-badge">⚡ Requires Attunement</p>
        )}

        {product.itemProperties.length > 0 && (
          <div className="properties">
            <p className="properties-label">Properties:</p>
            <ul className="properties-list">
              {product.itemProperties.map((prop) => (
                <li key={prop.id} title={prop.description}>
                  {prop.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <span className="price">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>

          <div className="add-to-cart-section">
            <div className="quantity-input">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <button
              className="btn-arcane"
              onClick={handleAddToCart}
              style={{ flex: 1 }}
            >
              {addedFeedback ? '✓ Added' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}