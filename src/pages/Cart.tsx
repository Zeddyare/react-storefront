import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  const shipping = items.length > 0 ? 7.5 : 0;
  const tax = total * 0.15;
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <section className="cart-container">
        <h1>Your Satchel</h1>
        <div className="empty-cart arcane-card">
          <p>Your satchel is empty. Explore the catalogue and claim your first relic.</p>
          <Link className="btn-arcane" to="/">Browse Catalogue</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-container">
      <h1>Your Satchel</h1>

      <div className="cart-wrapper">
        <div className="cart-items">
          {items.map((item) => (
            <article key={item.product.id} className="cart-item arcane-card">
              <img
                className="item-image"
                src={item.product.image || 'https://placehold.co/160x220/191207/e8d9be?text=Relic'}
                alt={item.product.name}
                loading="lazy"
              />

              <div className="item-details">
                <h3>{item.product.name}</h3>
                <p className="item-category">{item.product.rarity} • {item.product.category}</p>
                <p className="item-price">${item.product.price.toFixed(2)}</p>
              </div>

              <div className="item-quantity">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Decrease quantity">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
              </div>

              <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Remove item">x</button>
            </article>
          ))}
        </div>

        <aside className="cart-summary arcane-card">
          <h2>Order Ledger</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>

          <Link className="btn-arcane checkout-link" to="/checkout">
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}