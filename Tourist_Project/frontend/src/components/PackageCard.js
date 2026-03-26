import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const destIcons = { 'Goa': '🏖️', 'Kerala': '🌴', 'Rajasthan': '🏰', 'Manali': '🏔️', 'Andaman': '🏝️', 'Varanasi': '🕌' };
const getIcon = (name) => Object.entries(destIcons).find(([k]) => name?.includes(k))?.[1] || '🌍';

const PackageCard = ({ pkg, initialIsFavorite = false, onToggleFavorite }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const navigate = useNavigate();

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        try {
            if (isFavorite) {
                await API.delete(`/favorites/${pkg.packageId}`);
                setIsFavorite(false);
            } else {
                await API.post(`/favorites/${pkg.packageId}`);
                setIsFavorite(true);
            }
            if (onToggleFavorite) onToggleFavorite(pkg.packageId, !isFavorite);
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            // Optionally redirect to login if unauthorized
            if (err.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    return (
        <div className="package-card" onClick={() => navigate(`/packages/${pkg.packageId}`)}>
            <button
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            >
                <span>{isFavorite ? '❤️' : '🤍'}</span>
            </button>
            <div className="package-card-img" style={pkg.imageUrl ? { background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.5)), url(${pkg.imageUrl}) center/cover no-repeat` } : {}}>
                {!pkg.imageUrl && <span style={{ fontSize: '4rem' }}>{getIcon(pkg.destinationName)}</span>}
                <div className="package-price-tag">₹{pkg.price?.toLocaleString()}</div>
            </div>
            <div className="package-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 className="font-display" style={{ margin: 0 }}>{pkg.destinationName}</h3>
                    {pkg.averageRating > 0 && (
                        <div className="rating-badge" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1c40f', background: 'hsla(45, 100%, 50%, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                            ⭐ {pkg.averageRating.toFixed(1)}
                        </div>
                    )}
                </div>
                <div className="package-meta" style={{ marginBottom: '12px' }}>
                    <span className="package-meta-item">📅 {pkg.numberOfDays}D/{pkg.numberOfNights}N</span>
                    <span className="package-meta-item">👥 {pkg.packageCapacity} Pax</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', height: '44px', overflow: 'hidden' }}>
                    {pkg.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: '12px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate(`/packages/${pkg.packageId}#reviews`); }}>
                    ✍️ Experience this trip? Share your review
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/packages/${pkg.packageId}`); }}
                    >
                        Details
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/book/${pkg.packageId}`); }}
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackageCard;
