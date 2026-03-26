import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const VehicleManagement = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ vehicleType: '', capacity: '', mileage: '', chargePerKm: '', miscCharges: '', status: 'AVAILABLE' });
    const [error, setError] = useState('');

    const load = () => API.get('/vehicles').then(r => setVehicles(r.data)).catch(console.error).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm({ vehicleType: '', capacity: '', mileage: '', chargePerKm: '', miscCharges: '', status: 'AVAILABLE' }); setError(''); setShowModal(true); };
    const openEdit = (v) => { setEditing(v); setForm({ vehicleType: v.vehicleType, capacity: v.capacity, mileage: v.mileage || '', chargePerKm: v.chargePerKm, miscCharges: v.miscCharges || '', status: v.status }); setError(''); setShowModal(true); };
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault(); setError('');
        const payload = { vehicleType: form.vehicleType, capacity: parseInt(form.capacity), mileage: parseFloat(form.mileage) || 0, chargePerKm: parseFloat(form.chargePerKm), miscCharges: parseFloat(form.miscCharges) || 0, status: form.status };
        try {
            if (editing) await API.put(`/vehicles/${editing.vehicleId}`, payload);
            else await API.post('/vehicles', payload);
            setShowModal(false); load();
        } catch (e) { setError(e.response?.data?.message || 'Failed to save vehicle'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return;
        await API.delete(`/vehicles/${id}`); load();
    };

    const statusBadge = s => s === 'AVAILABLE' ? 'badge-success' : s === 'BOOKED' ? 'badge-warning' : 'badge-danger';

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <div className="page-title">🚌 Vehicle Management</div>
                    <div className="page-subtitle">{vehicles.length} vehicles registered</div>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Vehicle</button>
            </div>
            <div className="card">
                <div className="table-responsive">
                    <table>
                        <thead><tr><th>ID</th><th>Type</th><th>Capacity</th><th>Mileage</th><th>Charge/km</th><th>Misc</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.vehicleId}>
                                    <td>#{v.vehicleId}</td>
                                    <td style={{ fontWeight: '600' }}>{v.vehicleType}</td>
                                    <td>{v.capacity} seats</td>
                                    <td>{v.mileage} km/l</td>
                                    <td>₹{v.chargePerKm}/km</td>
                                    <td>₹{v.miscCharges || 0}</td>
                                    <td><span className={`badge ${statusBadge(v.status)}`}>{v.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>✏️ Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.vehicleId)}>🗑️</button>
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
                    <div className="modal">
                        <h2>{editing ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Vehicle Type *</label>
                                    <input name="vehicleType" className="form-input" value={form.vehicleType} onChange={handleChange} required placeholder="e.g. SUV, Sedan" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Capacity *</label>
                                    <input name="capacity" type="number" className="form-input" value={form.capacity} onChange={handleChange} required min={1} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mileage (km/l)</label>
                                    <input name="mileage" type="number" className="form-input" value={form.mileage} onChange={handleChange} step="0.1" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Charge Per Km (₹) *</label>
                                    <input name="chargePerKm" type="number" className="form-input" value={form.chargePerKm} onChange={handleChange} required step="0.01" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Misc Charges (₹)</label>
                                    <input name="miscCharges" type="number" className="form-input" value={form.miscCharges} onChange={handleChange} step="0.01" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                                        <option>AVAILABLE</option><option>BOOKED</option><option>MAINTENANCE</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Vehicle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleManagement;
