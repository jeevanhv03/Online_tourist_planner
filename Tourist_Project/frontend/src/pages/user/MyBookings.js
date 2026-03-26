import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';

const MyBookings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        API.get('/bookings/my-bookings').then(r => setBookings(r.data))
            .catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setCancelling(id);
        try {
            await API.put(`/bookings/${id}/cancel`);
            setBookings(prev => prev.map(b => b.bookingId === id ? { ...b, bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : b));
        } catch (e) { alert(e.response?.data?.message || 'Cancellation failed'); }
        finally { setCancelling(null); }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-title">🎫 My Bookings</div>
            <div className="page-subtitle">Track all your travel bookings</div>

            {location.state?.message && (
                <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                    {location.state.message}
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎫</div>
                    <p>No bookings yet! Explore our packages and book your dream vacation.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {bookings.map(b => (
                        <div key={b.bookingId} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <h3 style={{ fontSize: '1.1rem' }}>🌍 {b.destinationName}</h3>
                                            <span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-success' : b.bookingStatus === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>{b.bookingStatus}</span>
                                            <span className={`badge ${b.paymentStatus === 'PAID' ? 'badge-success' : b.paymentStatus === 'REFUNDED' ? 'badge-danger' : 'badge-warning'}`}>{b.paymentStatus}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '8px' }}>
                                            {[['🔖 Booking ID', `#BK${b.bookingId}`], ['🚌 Vehicle', b.vehicleType],
                                            ['📅 Start', b.travelStartDate], ['📅 End', b.travelEndDate],
                                            ['👥 Passengers', b.passengerCount], ['💰 Amount', `₹${b.totalAmount?.toLocaleString()}`]
                                            ].map(([lbl, val]) => (
                                                <div key={lbl}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lbl}</span>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {b.paymentStatus === 'PAID' && (
                                            <button className="btn btn-secondary btn-sm"
                                                onClick={async () => {
                                                    try {
                                                        const res = await API.get(`/invoices/download/${b.bookingId}`, { responseType: 'blob' });
                                                        const blob = new Blob([res.data], { type: 'application/pdf' });
                                                        const url = window.URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `Invoice_BK-${b.bookingId}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                        window.URL.revokeObjectURL(url);
                                                    } catch (err) {
                                                        console.error('Download error:', err);
                                                        const errorData = err.response?.data;
                                                        if (errorData instanceof Blob) {
                                                            const reader = new FileReader();
                                                            reader.onload = () => {
                                                                const text = reader.result;
                                                                alert(`Download Failed: ${text}`);
                                                            };
                                                            reader.readAsText(err.response.data);
                                                        } else {
                                                            const status = err.response?.status ? ` (Status: ${err.response.status})` : '';
                                                            alert(`Failed to download invoice${status}. Check console for details.`);
                                                        }
                                                    }
                                                }}>
                                                📄 Invoice
                                            </button>
                                        )}
                                        {b.paymentStatus === 'PAID' && b.bookingStatus === 'CONFIRMED' && (
                                            <button className="btn btn-primary btn-sm"
                                                onClick={() => navigate(`/packages/${b.packageId}#reviews`)}>
                                                ⭐ Review Trip
                                            </button>
                                        )}
                                        {b.paymentStatus === 'PENDING' && b.bookingStatus === 'CONFIRMED' && (
                                            <button className="btn btn-primary btn-sm"
                                                onClick={() => navigate(`/payment/${b.bookingId}`)}>
                                                💳 Pay Now
                                            </button>
                                        )}
                                        {b.paymentStatus === 'PENDING' && b.bookingStatus === 'PENDING' && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                ⏳ Awaiting Admin Approval
                                            </span>
                                        )}
                                        {(b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING') && (
                                            <button className="btn btn-danger btn-sm" disabled={cancelling === b.bookingId}
                                                onClick={() => handleCancel(b.bookingId)}>
                                                {cancelling === b.bookingId ? '...' : '❌ Cancel'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
