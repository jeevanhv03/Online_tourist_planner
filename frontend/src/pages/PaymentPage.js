import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        cardNumber: '4111 1111 1111 1111',
        cardHolderName: '',
        expiryDate: '12/26',
        cvv: '123'
    });

    useEffect(() => {
        API.get(`/bookings/${bookingId}`)
            .then(res => {
                setBooking(res.data);
                if (res.data.paymentStatus === 'PAID') {
                    navigate('/my-bookings');
                }
            })
            .catch(err => setError('Could not load booking details.'))
            .finally(() => setLoading(false));
    }, [bookingId, navigate]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');
        setProcessing(true);
        try {
            await API.post('/payments/process', {
                bookingId: parseInt(bookingId),
                ...form
            });
            navigate('/my-bookings', { state: { message: '✨ Payment Successful! Your booking is now confirmed.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed. Please check your card details.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!booking) return <div className="alert alert-danger">Booking not found.</div>;

    return (
        <div className="auth-container" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💳</div>
                    <h2>Secure Checkout</h2>
                    <p>Paying for Booking #BK{bookingId}</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="card" style={{ backgroundColor: 'var(--bg-secondary)', marginBottom: '20px', border: 'none' }}>
                    <div className="card-body" style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Destination:</span>
                            <span style={{ fontWeight: '600' }}>{booking.destinationName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Travel Dates:</span>
                            <span style={{ fontWeight: '500' }}>{booking.travelStartDate}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                            <span>Total Amount:</span>
                            <span>₹{booking.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handlePayment}>
                    <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <input name="cardNumber" className="form-input" value={form.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Cardholder Name</label>
                        <input name="cardHolderName" className="form-input" value={form.cardHolderName} onChange={handleChange} placeholder="Full Name on Card" required />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Expiry Date</label>
                            <input name="expiryDate" className="form-input" value={form.expiryDate} onChange={handleChange} placeholder="MM/YY" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">CVV</label>
                            <input name="cvv" type="password" className="form-input" value={form.cvv} onChange={handleChange} placeholder="123" maxLength={4} required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={processing}>
                        {processing ? '🔄 Processing...' : `Pay ₹${booking.totalAmount?.toLocaleString()}`}
                    </button>
                    <button type="button" className="btn btn-secondary btn-full" style={{ marginTop: '10px' }} onClick={() => navigate('/my-bookings')}>
                        Cancel & Pay Later
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    🔒 This is a simulated payment gateway for demonstration purposes.
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
