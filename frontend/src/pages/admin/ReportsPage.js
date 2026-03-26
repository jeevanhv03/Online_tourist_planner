import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ReportsPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        API.get('/reports/summary').then(r => setSummary(r.data))
            .catch(console.error).finally(() => setLoading(false));
    }, []);

    const downloadExcel = async () => {
        setDownloading(true);
        try {
            const res = await API.get('/reports/bookings/excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'bookings_report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) { alert('Download failed'); }
        finally { setDownloading(false); }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    const bookings = summary?.bookings || [];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <div className="page-title">📋 Reports</div>
                    <div className="page-subtitle">Business reports and analytics export</div>
                </div>
                <button className="btn btn-success" onClick={downloadExcel} disabled={downloading}>
                    {downloading ? '⏳ Downloading...' : '📥 Export Excel'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="stat-grid" style={{ marginBottom: '28px' }}>
                {[
                    { icon: '🎫', label: 'Total Bookings', value: summary?.totalBookings || 0, color: 'rgba(26,115,232,0.15)' },
                    { icon: '✅', label: 'Confirmed', value: summary?.confirmedBookings || 0, color: 'rgba(34,197,94,0.15)' },
                    { icon: '❌', label: 'Cancelled', value: summary?.cancelledBookings || 0, color: 'rgba(239,68,68,0.15)' },
                    { icon: '💰', label: 'Total Revenue', value: `₹${(summary?.totalRevenue || 0).toLocaleString()}`, color: 'rgba(255,107,53,0.15)' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
                        <div className="stat-info">
                            <h3 style={{ fontSize: typeof s.value === 'string' ? '1.1rem' : '1.6rem' }}>{s.value}</h3>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bookings Table */}
            <div className="card">
                <div className="card-header">
                    <h3>📊 Booking History Report</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{bookings.length} records</span>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr><th>Booking ID</th><th>Customer</th><th>Destination</th><th>Vehicle</th><th>Travel Period</th><th>Pax</th><th>Amount</th><th>Booking Status</th></tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No booking records</td></tr>
                            ) : bookings.map(b => (
                                <tr key={b.bookingId}>
                                    <td>#BK{b.bookingId}</td>
                                    <td>{b.username}</td>
                                    <td>{b.destinationName}</td>
                                    <td>{b.vehicleType}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{b.travelStartDate} → {b.travelEndDate}</td>
                                    <td>{b.passengerCount}</td>
                                    <td>₹{b.totalAmount?.toLocaleString()}</td>
                                    <td><span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-success' : b.bookingStatus === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>{b.bookingStatus}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
