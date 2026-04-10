import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Product, ProductCreateDTO, Rarity } from '../types/Item';
import { api } from '../services/api';
import '../styles/Admin.css';

interface DraftProperty {
  propertyName: string;
  propertyDescription: string;
}

const EMPTY_FORM: ProductCreateDTO = {
  name: '',
  price: 0,
  category: '',
  attunement: false,
  type: '',
  die: 0,
  ac: 0,
  bonus: 0,
  charges: 0,
  rarity: 'COMMON',
  description: '',
  image: '',
  properties: [],
};

const toProductPayload = (form: ProductCreateDTO): ProductCreateDTO => ({
  ...form,
  price: Number(form.price),
  die: Number(form.die),
  ac: Number(form.ac),
  bonus: Number(form.bonus),
  charges: Number(form.charges),
});

export default function Admin() {
  const [form, setForm] = useState<ProductCreateDTO>(EMPTY_FORM);
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [draftProperty, setDraftProperty] = useState<DraftProperty>({
    propertyName: '',
    propertyDescription: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);

  const rarityOptions: Rarity[] = useMemo(
    () => ['COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE', 'LEGENDARY', 'ARTIFACT'],
    []
  );

  const mode = selectedProductId ? 'edit' : 'create';

  const refreshCatalogue = async () => {
    try {
      setLoadingCatalogue(true);
      const products = await api.getProducts();
      setCatalogue(products);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to fetch catalogue';
      setMessage({ type: 'error', text });
    } finally {
      setLoadingCatalogue(false);
    }
  };

  useEffect(() => {
    void refreshCatalogue();
  }, []);

  const setField = <K extends keyof ProductCreateDTO>(key: K, value: ProductCreateDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addProperty = () => {
    if (!draftProperty.propertyName.trim() || !draftProperty.propertyDescription.trim()) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      properties: [...prev.properties, draftProperty],
    }));
    setDraftProperty({ propertyName: '', propertyDescription: '' });
  };

  const removeProperty = (index: number) => {
    setForm((prev) => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index),
    }));
  };

  const handleSelectionChange = (value: string) => {
    if (!value) {
      setSelectedProductId(null);
      setForm(EMPTY_FORM);
      setDraftProperty({ propertyName: '', propertyDescription: '' });
      return;
    }

    const id = Number(value);
    const selected = catalogue.find((product) => product.id === id);
    if (!selected) {
      return;
    }

    setSelectedProductId(id);
    setForm({
      name: selected.name,
      price: selected.price,
      category: selected.category,
      attunement: selected.attunement,
      type: selected.type,
      die: selected.die || 0,
      ac: selected.ac || 0,
      bonus: selected.bonus || 0,
      charges: selected.charges || 0,
      rarity: selected.rarity,
      description: selected.description,
      image: selected.image || '',
      properties: (selected.itemProperties || []).map((prop) => ({
        propertyName: prop.name,
        propertyDescription: prop.description,
      })),
    });
    setDraftProperty({ propertyName: '', propertyDescription: '' });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      setSubmitting(true);
      const payload = toProductPayload(form);

      if (mode === 'edit' && selectedProductId) {
        await api.updateProduct(selectedProductId, payload);
        setMessage({ type: 'success', text: 'Catalogue entry updated.' });
      } else {
        await api.createProduct(payload);
        setMessage({ type: 'success', text: 'Product forged successfully and stored in the database.' });
        setForm(EMPTY_FORM);
      }

      await refreshCatalogue();
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to submit product data';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!selectedProductId) {
      return;
    }

    const selected = catalogue.find((item) => item.id === selectedProductId);
    const confirmed = window.confirm(
      `Delete ${selected?.name || `product #${selectedProductId}`} from the catalogue?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      await api.deleteProduct(selectedProductId);
      setMessage({ type: 'success', text: 'Catalogue entry deleted.' });
      setSelectedProductId(null);
      setForm(EMPTY_FORM);
      await refreshCatalogue();
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to delete product';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-container">
      <h1>Catalogue Forge</h1>
      <p className="admin-subtitle">Create new relics or select existing entries to edit and delete.</p>

      {message && <p className={`message ${message.type}`}>{message.text}</p>}

      <div className="catalogue-panel arcane-card">
        <div className="catalogue-panel-header">
          <h2>Existing Catalogue Entries</h2>
          <button className="btn-ghost" type="button" onClick={() => handleSelectionChange('')}>
            New Product Mode
          </button>
        </div>

        <div className="catalogue-controls">
          <select
            value={selectedProductId ?? ''}
            onChange={(e) => handleSelectionChange(e.target.value)}
            disabled={loadingCatalogue}
          >
            <option value="">Select a product to edit/delete</option>
            {catalogue.map((product) => (
              <option key={product.id} value={product.id}>
                #{product.id} - {product.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-ghost danger"
            onClick={onDelete}
            disabled={!selectedProductId || submitting}
          >
            Delete Selected
          </button>
        </div>
      </div>

      <form className="product-form" onSubmit={onSubmit}>
        <div className="form-section arcane-card">
          <h2>{mode === 'edit' ? 'Edit Details' : 'Base Details'}</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                required
                min={0}
                step="0.01"
                type="number"
                value={form.price}
                onChange={(e) => setField('price', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                required
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <input id="type" required value={form.type} onChange={(e) => setField('type', e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="rarity">Rarity</label>
              <select id="rarity" value={form.rarity} onChange={(e) => setField('rarity', e.target.value as Rarity)}>
                {rarityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group checkbox">
            <label htmlFor="attunement">
              <input
                id="attunement"
                type="checkbox"
                checked={form.attunement}
                onChange={(e) => setField('attunement', e.target.checked)}
              />
              Requires Attunement
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              required
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input id="image" value={form.image} onChange={(e) => setField('image', e.target.value)} />
          </div>
        </div>

        <div className="form-section arcane-card">
          <h2>Stats</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="die">Damage Die</label>
              <input id="die" min={0} type="number" value={form.die} onChange={(e) => setField('die', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="ac">Armor Class</label>
              <input id="ac" min={0} type="number" value={form.ac} onChange={(e) => setField('ac', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="bonus">Bonus</label>
              <input id="bonus" min={0} type="number" value={form.bonus} onChange={(e) => setField('bonus', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="charges">Charges</label>
              <input id="charges" min={0} type="number" value={form.charges} onChange={(e) => setField('charges', Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="form-section arcane-card">
          <h2>Properties</h2>
          <div className="properties-input">
            <div className="form-group">
              <label htmlFor="prop-name">Property Name</label>
              <input
                id="prop-name"
                value={draftProperty.propertyName}
                onChange={(e) => setDraftProperty((prev) => ({ ...prev, propertyName: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prop-desc">Property Description</label>
              <input
                id="prop-desc"
                value={draftProperty.propertyDescription}
                onChange={(e) => setDraftProperty((prev) => ({ ...prev, propertyDescription: e.target.value }))}
              />
            </div>

            <button type="button" className="btn-ghost" onClick={addProperty}>Add Property</button>
          </div>

          <div className="properties-list">
            {form.properties.map((prop, idx) => (
              <div key={`${prop.propertyName}-${idx}`} className="property-item">
                <div>
                  <strong>{prop.propertyName}</strong>
                  <p>{prop.propertyDescription}</p>
                </div>
                <button type="button" className="remove-btn" onClick={() => removeProperty(idx)}>
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-arcane" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Product'}
        </button>
      </form>
    </section>
  );
}
