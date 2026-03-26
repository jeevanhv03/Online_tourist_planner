import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import PackageCard from '../../components/PackageCard';

const UserDashboard = () => {
    const [packages, setPackages] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [pkgRes, bkRes, favRes] = await Promise.all([
                    API.get('/packages/public/all'),
                    API.get('/bookings/my-bookings'),
                    API.get('/favorites').catch(() => ({ data: [] }))
                ]);
                setPackages(pkgRes.data.slice(0, 3));
                setBookings(bkRes.data.slice(0, 5));
                setFavorites(favRes.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleFavoriteToggle = (packageId, isNowFavorite) => {
        if (!isNowFavorite) {
            setFavorites(prev => prev.filter(f => f.packageId !== packageId));
        } else {
            // Re-fetch or add to favorites if needed, 
            // but usually a toggle-off is what happens in the dashboard wishlist
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    const favIds = favorites.map(f => f.packageId);

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="hero" style={{ marginBottom: '40px' }}>
                <h1 className="font-display">Explore India's Best Destinations</h1>
                <p>Book your perfect holiday package with curated travel experiences, comfortable vehicles, and unforgettable memories.</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/packages')}>
                        🔍 Explore Packages
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => navigate('/request-custom')}>
                        ✨ Custom Trip
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon">🗺️</div>
                    <div className="stat-info">
                        <h3>{packages.length}+</h3>
                        <p>Total Destinations</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'hsla(15, 100%, 60%, 0.1)', color: 'var(--secondary)' }}>🎫</div>
                    <div className="stat-info">
                        <h3>{bookings.length}</h3>
                        <p>Total Bookings</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'hsla(340, 80%, 60%, 0.1)', color: '#ff4757' }}>💖</div>
                    <div className="stat-info">
                        <h3>{favorites.length}</h3>
                        <p>Wishlisted Trips</p>
                    </div>
                </div>
            </div>

            {/* Wishlist Section */}
            {favorites.length > 0 && (
                <div className="card" style={{ marginBottom: '40px' }}>
                    <div className="card-header">
                        <h3 className="font-display">💖 My Wishlist</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{favorites.length} items saved</span>
                    </div>
                    <div className="card-body">
                        <div className="wishlist-grid">
                            {favorites.map(fav => (
                                <div key={fav.packageId} className="wishlist-item">
                                    <PackageCard
                                        pkg={{ packageId: fav.packageId, destinationName: fav.destinationName, price: fav.price, description: 'Saved to your wishlist' }}
                                        initialIsFavorite={true}
                                        onToggleFavorite={handleFavoriteToggle}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Featured Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-display">✨ Featured Packages</h3>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/packages')}>View All Packages →</button>
                    </div>
                    <div className="card-body">
                        <div className="package-grid">
                            {packages.map(pkg => (
                                <PackageCard
                                    key={pkg.packageId}
                                    pkg={pkg}
                                    initialIsFavorite={favIds.includes(pkg.packageId)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                {bookings.length > 0 && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-display">🎫 Recent Bookings</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/my-bookings')}>View All Activity →</button>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Booking Details</th>
                                            <th>Destination</th>
                                            <th>Travel Period</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(b => (
                                            <tr key={b.bookingId}>
                                                <td style={{ fontWeight: 600 }}>#BK-{b.bookingId}</td>
                                                <td>{b.destinationName}</td>
                                                <td style={{ fontSize: '0.85rem' }}>{b.travelStartDate} → {b.travelEndDate}</td>
                                                <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{b.totalAmount?.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-success' :
                                                        b.bookingStatus === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                                                        }`}>
                                                        {b.bookingStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
