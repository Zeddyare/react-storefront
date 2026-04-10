import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/Item';
import { api } from '../services/api';
import '../styles/Home.css';

export default function Home() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('ALL');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await api.getProducts();
        setItems(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load products';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const visibleProducts = useMemo(() => {
    return items.filter((item) => {
      const matchesRarity = rarity === 'ALL' || item.rarity === rarity;
      const haystack = `${item.name} ${item.description} ${item.category} ${item.type}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase().trim());
      return matchesRarity && matchesQuery;
    });
  }, [items, query, rarity]);

  return (
    <section className="home-container">
      <header className="hero fade-in">
        <p className="hero-kicker">Artifacts. Armaments. Arcana.</p>
        <h1>The Grand Reliquary</h1>
        <p>Claim enchanted wares sourced from dungeons, empires, and dragon-hoards.</p>
      </header>

      <section className="catalog-controls arcane-card fade-in" aria-label="Catalog filters">
        <input
          type="search"
          placeholder="Seek by name, trait, or lore..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          <option value="ALL">All rarities</option>
          <option value="COMMON">Common</option>
          <option value="UNCOMMON">Uncommon</option>
          <option value="RARE">Rare</option>
          <option value="VERY_RARE">Very Rare</option>
          <option value="LEGENDARY">Legendary</option>
          <option value="ARTIFACT">Artifact</option>
        </select>

        <div className="results-count">{visibleProducts.length} relics found</div>
      </section>

      {loading && <div className="loading-spinner" aria-label="Loading products" />}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="products-grid">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((item) => <ProductCard key={item.id} product={item} />)
          ) : (
            <p className="no-products">No artifacts match your scrying criteria.</p>
          )}
        </div>
      )}

      <div className="store-blurb fade-in">
        <h2>Why Arcana Vault?</h2>
        <p>
          Every entry in this catalogue is seeded and tracked through your database-backed Spring service,
          so inventory and lore stay consistent across sessions.
        </p>
      </div>
    </section>
  );
}