import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';

// Fix for default marker icon in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const destIcons = { 'Goa': '🏖️', 'Kerala': '🌴', 'Rajasthan': '🏰', 'Manali': '🏔️', 'Andaman': '🏝️', 'Varanasi': '🕌' };
const getIcon = (name) => Object.entries(destIcons).find(([k]) => name?.includes(k))?.[1] || '🌍';

const PackageDetails = () => {
    const { id } = useParams();
    const { isAdmin } = useAuth();
    const [pkg, setPkg] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [pkgRes, revRes] = await Promise.all([
                    API.get(`/packages/public/${id}`),
                    API.get(`/reviews/package/${id}`)
                ]);
                setPkg(pkgRes.data);
                setReviews(revRes.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await API.post('/reviews', {
                packageId: id,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setReviews([res.data, ...reviews]);
            setNewReview({ rating: 5, comment: '' });
            // Refresh package to get new avg rating
            const pkgRes = await API.get(`/packages/public/${id}`);
            setPkg(pkgRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await API.get(`/itinerary/download/${id}`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Itinerary_${pkg.destinationName.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download itinerary. Please try again later.');
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!pkg) return <div className="empty-state">Package not found</div>;

    return (
        <div className="animate-fade-in">
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: '20px' }} onClick={() => navigate(-1)}>← Back to Explore</button>

            <div className="card" style={{ marginBottom: '40px' }}>
                <div style={
                    pkg.imageUrl 
                    ? { height: '350px', position: 'relative', overflow: 'hidden', background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.7)), url(${pkg.imageUrl}) center/cover no-repeat` }
                    : { height: '300px', background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', position: 'relative', overflow: 'hidden' }
                }>
                    {!pkg.imageUrl && <span style={{ position: 'relative', zIndex: 1 }}>{getIcon(pkg.destinationName)}</span>}
                    <div className="package-price-tag" style={{ fontSize: '1.5rem', padding: '10px 20px' }}>₹{pkg.price?.toLocaleString()}</div>
                </div>

                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                        <div>
                            <h1 className="font-display" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{pkg.destinationName}</h1>
                            <div className="package-meta">
                                <span className="package-meta-item">📅 {pkg.numberOfDays}D / {pkg.numberOfNights}N</span>
                                <span className="package-meta-item">👥 Max {pkg.packageCapacity} persons</span>
                                {pkg.averageRating > 0 && (
                                    <span className="package-meta-item" style={{ color: '#f1c40f', fontWeight: 700 }}>⭐ {pkg.averageRating.toFixed(1)} ({pkg.totalReviews} reviews)</span>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={handleDownloadPDF} title="Download Itinerary PDF">📄 PDF Itinerary</button>
                            <button className="btn btn-primary btn-lg" onClick={() => navigate(`/book/${pkg.packageId}`)}>
                                🚀 Book Now
                            </button>
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid var(--border)' }}>
                        <h3 className="font-display" style={{ marginBottom: '12px', fontSize: '1.2rem' }}>📝 Description</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>{pkg.description}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px', marginBottom: '40px' }}>
                        {[
                            { title: '🍽️ Food & Meals', content: pkg.foodDetails },
                            { title: '🏨 Stay & Accommodation', content: pkg.accommodationDetails },
                            { title: '🎯 Sightseeing & Activities', content: pkg.sightseeingDetails }
                        ].map((item, idx) => (
                            <div key={idx} className="card" style={{ background: 'hsla(217, 89%, 61%, 0.03)', border: '1px solid var(--border)' }}>
                                <div className="card-body" style={{ padding: '20px' }}>
                                    <h4 style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--primary)' }}>{item.title}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Map Section */}
                    {pkg.latitude && pkg.longitude && !isAdmin && (
                        <div style={{ marginBottom: '40px' }}>
                            <h3 className="font-display" style={{ marginBottom: '16px', fontSize: '1.2rem' }}>📍 Location on Map</h3>
                            <div style={{ height: '350px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', zIndex: 1 }}>
                                <MapContainer center={[pkg.latitude, pkg.longitude]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[pkg.latitude, pkg.longitude]}>
                                        <Popup>
                                            <strong>{pkg.destinationName}</strong><br />
                                            Explore this beautiful destination!
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-display">⭐ Customer Reviews</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{reviews.length} reviews found</span>
                    </div>
                    <div className="card-body">
                        {reviews.length === 0 ? (
                            <div className="empty-state">
                                <p>No reviews yet. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {reviews.map(review => (
                                    <div key={review.reviewId} style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: 700 }}>{review.username}</div>
                                            <div style={{ color: '#f1c40f' }}>{'⭐'.repeat(review.rating)}</div>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{review.comment}</p>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                            {!review.isVisible && (
                                                <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                                                    Hidden by Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ position: 'sticky', top: '24px' }}>
                    <div className="card-header">
                        <h3 className="font-display">Rate this Package</h3>
                    </div>
                    <div className="card-body">
                        {localStorage.getItem('user') ? (
                            <form onSubmit={handleSubmitReview}>
                                {error && <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div>}
                                <div className="form-group">
                                    <label className="form-label">Rating</label>
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '1.5rem' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                style={{ cursor: 'pointer', color: star <= newReview.rating ? '#f1c40f' : 'var(--border-bright)' }}
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                            >
                                                ⭐
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Comment</label>
                                    <textarea
                                        className="form-input"
                                        rows="4"
                                        placeholder="Share your travel experience..."
                                        required
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Post Review'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Please log in to share your experience.</p>
                                <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Login to Review</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageDetails;
