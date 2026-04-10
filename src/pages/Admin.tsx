import { FormEvent, useMemo, useState } from 'react';
import { ProductCreateDTO, Rarity } from '../types/Item';
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

export default function Admin() {
	const [form, setForm] = useState<ProductCreateDTO>(EMPTY_FORM);
	const [draftProperty, setDraftProperty] = useState<DraftProperty>({
		propertyName: '',
		propertyDescription: '',
	});
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const rarityOptions: Rarity[] = useMemo(
		() => ['COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE', 'LEGENDARY', 'ARTIFACT'],
		[]
	);

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

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setMessage(null);

		try {
			setSubmitting(true);
			const payload: ProductCreateDTO = {
				...form,
				price: Number(form.price),
				die: Number(form.die),
				ac: Number(form.ac),
				bonus: Number(form.bonus),
				charges: Number(form.charges),
			};
			await api.createProduct(payload);
			setMessage({ type: 'success', text: 'Product forged successfully and stored in the database.' });
			setForm(EMPTY_FORM);
			setDraftProperty({ propertyName: '', propertyDescription: '' });
		} catch (error) {
			const text = error instanceof Error ? error.message : 'Failed to create product';
			setMessage({ type: 'error', text });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="admin-container">
			<h1>Forge New Relic</h1>
			<p className="admin-subtitle">Hidden route for seeding additional inventory from the frontend.</p>

			{message && <p className={`message ${message.type}`}>{message.text}</p>}

			<form className="product-form" onSubmit={onSubmit}>
				<div className="form-section arcane-card">
					<h2>Base Details</h2>

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
					{submitting ? 'Forging...' : 'Create Product'}
				</button>
			</form>
		</section>
	);
}
