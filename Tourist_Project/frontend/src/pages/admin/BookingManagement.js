import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;
        try {
            await API.put(`/bookings/${id}/${action}`);
            setBookings(prev => prev.map(b => b.bookingId === id ? { ...b, bookingStatus: action === 'confirm' ? 'CONFIRMED' : 'CANCELLED' } : b));
        } catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    };

    useEffect(() => {
        API.get('/bookings/all').then(r => setBookings(r.data))
            .catch(console.error).finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.bookingStatus === filter);

    const downloadReport = () => {
        const headers = ["Booking ID", "Customer", "Destination", "Vehicle", "Dates", "Pax", "Amount", "Status", "Payment"];
        const csvContent = [
            headers.join(","),
            ...filtered.map(b => [
                b.bookingId,
                `"${b.username || ''}"`,
                `"${b.destinationName || ''}"`,
                `"${b.vehicleType || ''}"`,
                `${b.travelStartDate} to ${b.travelEndDate}`,
                b.passengerCount,
                b.totalAmount,
                b.bookingStatus,
                b.paymentStatus
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <div className="page-title">🎫 Booking Management</div>
                    <div className="page-subtitle">{bookings.length} total bookings</div>
                </div>
                <button className="btn btn-primary" onClick={downloadReport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⬇️ Download Report
                </button>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}>{s === 'ALL' ? '📋 All' : s}</button>
                ))}
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr><th>Booking ID</th><th>Customer</th><th>Destination</th><th>Vehicle</th><th>Dates</th><th>Pax</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No bookings found</td></tr>
                            ) : filtered.map(b => (
                                <tr key={b.bookingId}>
                                    <td style={{ fontWeight: '600' }}>#BK{b.bookingId}</td>
                                    <td>{b.username}</td>
                                    <td>{b.destinationName}</td>
                                    <td>{b.vehicleType}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{b.travelStartDate}<br />→ {b.travelEndDate}</td>
                                    <td>{b.passengerCount}</td>
                                    <td style={{ fontWeight: '600' }}>₹{b.totalAmount?.toLocaleString()}</td>
                                    <td><span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-success' : b.bookingStatus === 'CANCELLED' ? 'badge-danger' : b.bookingStatus === 'COMPLETED' ? 'badge-primary' : 'badge-warning'}`}>{b.bookingStatus}</span></td>
                                    <td><span className={`badge ${b.paymentStatus === 'PAID' ? 'badge-success' : b.paymentStatus === 'REFUNDED' ? 'badge-danger' : 'badge-warning'}`}>{b.paymentStatus}</span></td>
                                    <td>
                                        {b.bookingStatus === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="btn btn-primary btn-xs" onClick={() => handleAction(b.bookingId, 'confirm')}>✅</button>
                                                <button className="btn btn-danger btn-xs" onClick={() => handleAction(b.bookingId, 'reject')}>❌</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingManagement;
