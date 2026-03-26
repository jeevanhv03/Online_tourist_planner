import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const BookingPage = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [form, setForm] = useState({
        vehicleId: '', travelStartDate: '', travelEndDate: '',
        passengerCount: 1, specialRequests: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [baseAmount, setBaseAmount] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [redeemPoints, setRedeemPoints] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [promoSuccess, setPromoSuccess] = useState('');
    const [appliedPromoObj, setAppliedPromoObj] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const pkgReq = API.get(`/packages/public/${packageId}`);
                const vehReq = API.get('/vehicles/available');
                const profReq = API.get('/users/profile');

                const [pRes, vRes, uRes] = await Promise.allSettled([pkgReq, vehReq, profReq]);

                if (pRes.status === 'fulfilled') setPkg(pRes.value.data);
                else setError('Failed to load package details.');

                if (vRes.status === 'fulfilled') setVehicles(vRes.value.data);
                else console.error('Failed to load vehicles');

                if (uRes.status === 'fulfilled') setUserProfile(uRes.value.data);
                else console.warn('User profile not loaded (possibly guest or session expired)');

            } catch (err) {
                console.error('Initial fetch error:', err);
                setError('A system error occurred. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [packageId]);

    useEffect(() => {
        if (pkg && form.vehicleId && form.travelStartDate && form.travelEndDate) {
            const days = Math.max(1, Math.round((new Date(form.travelEndDate) - new Date(form.travelStartDate)) / 86400000));
            const vehicle = vehicles.find(v => v.vehicleId === parseInt(form.vehicleId));
            const vehicleCost = vehicle ? (vehicle.chargePerKm * 100 * days + (vehicle.miscCharges || 0)) : 0;
            const bAmount = (pkg.price || 0) * (form.passengerCount || 1) + vehicleCost;
            setBaseAmount(bAmount || 0);

            let dAmount = 0;
            if (appliedPromoObj) {
                let calc = bAmount * (appliedPromoObj.discountPercentage / 100.0);
                if (appliedPromoObj.maxDiscountAmount && calc > appliedPromoObj.maxDiscountAmount) calc = appliedPromoObj.maxDiscountAmount;
                dAmount += calc;
            }

            if (redeemPoints && userProfile?.loyaltyPoints > 0) {
                let pDiscount = userProfile.loyaltyPoints;
                if (pDiscount > (bAmount - dAmount)) pDiscount = bAmount - dAmount;
                dAmount += pDiscount;
            }

            setDiscountAmount(dAmount || 0);
            setTotalAmount(Math.max(0, bAmount - dAmount) || 0);
        }
    }, [form, pkg, vehicles, appliedPromoObj, redeemPoints, userProfile]);

    const handleApplyPromo = async () => {
        setPromoError(''); setPromoSuccess(''); setAppliedPromoObj(null);
        if (!promoCode) return;
        try {
            const res = await API.get(`/promos/validate?code=${promoCode}`);
            setAppliedPromoObj(res.data);
            setPromoSuccess(`Promo Code Applied! ${res.data.discountPercentage}% off`);
        } catch (err) {
            setPromoError(err.response?.data?.message || 'Invalid Promo Code');
        }
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        if (!form.vehicleId) {
            setError('Please select a vehicle.');
            setLoading(false);
            return;
        }

        try {
            await API.post('/bookings', {
                packageId: parseInt(packageId),
                vehicleId: parseInt(form.vehicleId),
                travelStartDate: form.travelStartDate,
                travelEndDate: form.travelEndDate,
                passengerCount: parseInt(form.passengerCount),
                specialRequests: form.specialRequests,
                promoCode: appliedPromoObj ? appliedPromoObj.code : null,
                redeemPoints: redeemPoints
            });
            setSuccess('🎉 Booking Created! Pending Admin approval.');
            setTimeout(() => navigate('/my-bookings', { state: { message: '✨ Your booking has been submitted. Please wait for Admin approval before payment.' } }), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally { setLoading(false); }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!pkg) return <div className="p-4 text-center"><div className="alert alert-danger">{error || 'Package not found'}</div><button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button></div>;

    return (
        <div>
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: '20px' }} onClick={() => navigate(-1)}>← Back</button>
            <div className="page-title">🎫 Book Your Package</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                <div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        {/* Travel Details */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div className="card-header"><h3>📅 Travel Details</h3></div>
                            <div className="card-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Travel Start Date *</label>
                                        <input type="date" name="travelStartDate" className="form-input"
                                            value={form.travelStartDate} onChange={handleChange} required
                                            min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Travel End Date *</label>
                                        <input type="date" name="travelEndDate" className="form-input"
                                            value={form.travelEndDate} onChange={handleChange} required
                                            min={form.travelStartDate} />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Passengers *</label>
                                        <input type="number" name="passengerCount" className="form-input"
                                            value={form.passengerCount} onChange={handleChange} min={1} max={pkg.packageCapacity} required />
                                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                                            Max allowed for this package: {pkg.packageCapacity}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Select Vehicle *</label>
                                        <select name="vehicleId" className="form-select" value={form.vehicleId} onChange={handleChange} required>
                                            <option value="">-- Choose Vehicle --</option>
                                            {vehicles.map(v => (
                                                <option key={v.vehicleId} value={v.vehicleId} disabled={v.capacity < form.passengerCount}>
                                                    {v.vehicleType} (Cap: {v.capacity}) {v.capacity < form.passengerCount ? '- TOO SMALL' : `- ₹${v.chargePerKm}/km`}
                                                </option>
                                            ))}
                                        </select>
                                        {form.vehicleId && vehicles.find(v => v.vehicleId === parseInt(form.vehicleId))?.capacity < form.passengerCount && (
                                            <div style={{ fontSize: '0.75rem', color: 'red', marginTop: '4px' }}>
                                                ⚠️ This vehicle cannot carry {form.passengerCount} passengers.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Special Requests</label>
                                    <textarea name="specialRequests" className="form-input" rows={3} placeholder="Any special requirements..."
                                        value={form.specialRequests} onChange={handleChange} style={{ resize: 'vertical' }} />
                                </div>
                            </div>
                        </div>

                        {/* Promotions */}
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div className="card-header"><h3>🎁 Promotions & Discounts</h3></div>
                            <div className="card-body">
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input type="text" className="form-input" placeholder="Enter Promo Code" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
                                    <button type="button" className="btn btn-secondary" onClick={handleApplyPromo}>Apply</button>
                                </div>
                                {promoError && <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{promoError}</div>}
                                {promoSuccess && <div style={{ color: 'var(--success)', fontSize: '0.875rem' }}>{promoSuccess}</div>}

                                {userProfile?.loyaltyPoints > 0 && (
                                    <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)' }}>
                                        <input type="checkbox" id="redeemPoints" checked={redeemPoints} onChange={e => setRedeemPoints(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                        <label htmlFor="redeemPoints" style={{ cursor: 'pointer', margin: 0, fontWeight: '500' }}>
                                            Redeem 🌟 {userProfile.loyaltyPoints} Loyalty Points (₹{userProfile.loyaltyPoints} off)
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Note */}
                        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                            ℹ️ After booking, our administrator will review your trip. Once approved, you can complete the payment from your dashboard.
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                            {loading ? '🔄 Processing...' : `Book Now - ₹${totalAmount.toLocaleString()}`}
                        </button>
                    </form>
                </div>

                {/* Summary */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '20px' }}>
                        <div className="card-header"><h3>📋 Booking Summary</h3></div>
                        <div className="card-body">
                            <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '12px' }}>🌍</div>
                            <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>{pkg.destinationName}</h3>
                            {[['📅 Duration', `${pkg.numberOfDays}D / ${pkg.numberOfNights}N`],
                            ['💰 Package Price', `₹${pkg.price?.toLocaleString()}/person`],
                            ['👥 Passengers', form.passengerCount],
                            ['🏔️ Max Capacity', `${pkg.packageCapacity} Pax`],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                    <span style={{ fontWeight: '600' }}>{val}</span>
                                </div>
                            ))}

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-color)', fontSize: '1.1rem', color: 'var(--text)' }}>
                                <span>Subtotal</span>
                                <span>₹{Math.round(baseAmount).toLocaleString()}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-color)', fontSize: '1.1rem', color: 'var(--success)' }}>
                                    <span>Discount (-{appliedPromoObj ? appliedPromoObj.discountPercentage + '%' : ''})</span>
                                    <span>- ₹{Math.round(discountAmount).toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                <span>Total Payable</span>
                                <span>₹{Math.round(totalAmount).toLocaleString()}</span>
                            </div>
                            <div className="alert alert-info" style={{ fontSize: '0.78rem', marginTop: '8px' }}>
                                🔒 Secure simulated payment. No real charges apply.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
