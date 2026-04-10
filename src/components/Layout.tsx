import { NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ChatWidget from './ChatWidget';
import '../styles/Layout.css';

export default function Layout() {
	const { items } = useCart();
	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<>
			<header className="navbar">
				<div className="nav-container">
					<NavLink to="/" className="nav-brand" aria-label="Arcana Vault home">
						<span className="brand-icon" aria-hidden="true">✦</span>
						<span className="brand-text">Arcana Vault</span>
					</NavLink>

					<nav className="nav-links" aria-label="Main navigation">
						<NavLink to="/" end className="nav-link">Catalogue</NavLink>
						<NavLink to="/cart" className="nav-link cart-link">
							Cart
							{itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
						</NavLink>
						<NavLink to="/checkout" className="nav-link">Checkout</NavLink>
					</nav>
				</div>
			</header>

			<main className="page-shell">
				<Outlet />
			</main>

			<ChatWidget />
		</>
	);
}
