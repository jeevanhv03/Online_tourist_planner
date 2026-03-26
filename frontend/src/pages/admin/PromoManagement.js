import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const PromoManagement = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        maxDiscountAmount: '',
        validUntil: ''
    });

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            const res = await API.get('/promos');
            setPromos(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch promos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/promos', {
                ...formData,
                discountPercentage: parseFloat(formData.discountPercentage),
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null
            });
            setFormData({ code: '', discountPercentage: '', maxDiscountAmount: '', validUntil: '' });
            fetchPromos();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating promo code');
        }
    };

    const handleDisable = async (id) => {
        if (!window.confirm("Are you sure you want to disable this promo code?")) return;
        try {
            await API.patch(`/promos/${id}/disable`);
            fetchPromos();
        } catch (err) {
            alert('Failed to disable promo code');
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-title">🎁 Promotions & Discounts</div>
            <div className="page-subtitle">Manage coupon codes for your customers</div>

            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                <div className="card h-fit">
                    <div className="card-header"><h3 className="font-display">Create New Promo</h3></div>
                    <form onSubmit={handleCreate} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                            <label>Promo Code (e.g. SUMMER20)</label>
                            <input type="text" className="form-control" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
                        </div>
                        <div className="form-group">
                            <label>Discount %</label>
                            <input type="number" className="form-control" min="1" max="100" value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Max Discount Amount (₹) - Optional</label>
                            <input type="number" className="form-control" value={formData.maxDiscountAmount} onChange={e => setFormData({ ...formData, maxDiscountAmount: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Valid Until</label>
                            <input type="date" className="form-control" value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Create Code</button>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header"><h3 className="font-display">Active Promos</h3></div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Discount</th>
                                    <th>Max ₹</th>
                                    <th>Valid Until</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promos.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.code}</strong></td>
                                        <td>{p.discountPercentage}%</td>
                                        <td>{p.maxDiscountAmount ? `₹${p.maxDiscountAmount}` : 'No Limit'}</td>
                                        <td>{p.validUntil}</td>
                                        <td>
                                            <span className={`badge ${p.active ? 'badge-success' : 'badge-secondary'}`}>
                                                {p.active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            {p.active && (
                                                <button onClick={() => handleDisable(p.id)} className="btn btn-danger btn-sm">Disable</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {promos.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No promo codes exist yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromoManagement;
