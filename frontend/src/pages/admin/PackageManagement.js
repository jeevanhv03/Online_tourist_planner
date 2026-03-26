import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const PackageManagement = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const initForm = { destinationName: '', numberOfDays: '', numberOfNights: '', packageCapacity: '', price: '', foodDetails: '', accommodationDetails: '', sightseeingDetails: '', description: '', active: true, category: '', imageUrl: '' };
    const [form, setForm] = useState(initForm);
    const [error, setError] = useState('');

    const load = () => API.get('/packages').then(r => setPackages(r.data)).catch(console.error).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm(initForm); setError(''); setShowModal(true); };
    const openEdit = p => { setEditing(p); setForm({ ...p }); setError(''); setShowModal(true); };
    const handleChange = e => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async e => {
        e.preventDefault(); setError('');
        const payload = { ...form, numberOfDays: parseInt(form.numberOfDays), numberOfNights: parseInt(form.numberOfNights), packageCapacity: parseInt(form.packageCapacity), price: parseFloat(form.price) };
        try {
            if (editing) await API.put(`/packages/${editing.packageId}`, payload);
            else await API.post('/packages', payload);
            setShowModal(false); load();
        } catch (e) { setError(e.response?.data?.message || 'Failed to save'); }
    };

    const handleDelete = async id => {
        if (!window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) return;
        try {
            await API.delete(`/packages/${id}`);
            load();
        } catch (err) {
            alert('Failed to delete package. It might be linked to existing bookings.');
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '32px' }}>
                <div>
                    <div className="page-title">🗺️ Package Management</div>
                    <div className="page-subtitle">Curate and manage your premium travel offerings</div>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <span style={{ fontSize: '1.2rem' }}>+</span> Create New Package
                </button>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="font-display">Inventory Overview</h3>
                    <span className="badge badge-primary">{packages.length} Total</span>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Package</th>
                                <th>Duration</th>
                                <th>Capacity</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map(p => (
                                <tr key={p.packageId}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.destinationName}</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: #PKG-{p.packageId}</div>
                                            {p.category && <span className="badge bg-secondary" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{p.category}</span>}
                                        </div>
                                    </td>
                                    <td>{p.numberOfDays} Days / {p.numberOfNights} Nights</td>
                                    <td>{p.packageCapacity} Pax</td>
                                    <td style={{ fontWeight: 600 }}>₹{p.price?.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}>
                                            {p.active ? 'Active' : 'Archived'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                                            <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(p.packageId)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '700px', background: 'var(--bg-surface)', backdropFilter: 'var(--glass-blur)' }}>
                        <h2 className="font-display" style={{ marginBottom: '24px' }}>{editing ? '✏️ Edit Package' : '➕ Create New Package'}</h2>
                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Destination Name</label>
                                <input name="destinationName" className="form-input" placeholder="e.g. Majestic Ladakh Expedition" value={form.destinationName} onChange={handleChange} required rotate="0" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select name="category" className="form-input" value={form.category || ''} onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Honeymoon">Honeymoon</option>
                                    <option value="Beach">Beach</option>
                                    <option value="Heritage">Heritage</option>
                                    <option value="Nature">Nature</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>

                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Days</label>
                                    <input name="numberOfDays" type="number" className="form-input" value={form.numberOfDays} onChange={handleChange} required min={1} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nights</label>
                                    <input name="numberOfNights" type="number" className="form-input" value={form.numberOfNights} onChange={handleChange} required min={0} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max Capacity (Pax)</label>
                                    <input name="packageCapacity" type="number" className="form-input" value={form.packageCapacity} onChange={handleChange} required min={1} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Base Price (₹)</label>
                                    <input name="price" type="number" className="form-input" value={form.price} onChange={handleChange} required step="0.01" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Package Description</label>
                                <textarea name="description" className="form-input" rows={3} value={form.description || ''} onChange={handleChange} style={{ resize: 'none' }} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">External Image URL (Optional)</label>
                                <input name="imageUrl" type="url" className="form-input" placeholder="https://example.com/image.jpg" value={form.imageUrl || ''} onChange={handleChange} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Accommodation</label>
                                    <input name="accommodationDetails" className="form-input" value={form.accommodationDetails || ''} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Food Details</label>
                                    <input name="foodDetails" className="form-input" value={form.foodDetails || ''} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                                <label htmlFor="active" style={{ fontWeight: 600, cursor: 'pointer' }}>Active and Visible to Users</label>
                            </div>

                            <div className="modal-footer" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editing ? 'Save Changes' : 'Publish Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageManagement;
