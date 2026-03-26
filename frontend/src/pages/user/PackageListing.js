import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import PackageCard from '../../components/PackageCard';

const PackageListing = () => {
    const [packages, setPackages] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [userFavorites, setUserFavorites] = useState([]);
    const [search, setSearch] = useState('');
    const [priceRange, setPriceRange] = useState(50000);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [pkgRes, favRes] = await Promise.all([
                    API.get('/packages/public/all'),
                    API.get('/favorites').catch(() => ({ data: [] })) // Optional: handle 401
                ]);
                setPackages(pkgRes.data);
                setFiltered(pkgRes.data);
                setUserFavorites(favRes.data.map(f => f.packageId));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const results = packages.filter(p =>
            p.destinationName.toLowerCase().includes(search.toLowerCase()) &&
            p.price <= priceRange &&
            (selectedCategory === '' || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()))
        );
        setFiltered(results);
    }, [search, priceRange, selectedCategory, packages]);

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-title">🗺️ Explore Travel Packages</div>
            <div className="page-subtitle">Premium curated destinations across India for your next adventure</div>

            <div className="card" style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-glass)', backdropFilter: 'var(--glass-blur)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 200px', gap: '20px', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Search Destinations</label>
                        <input
                            className="form-input"
                            placeholder="🔍 Type a destination (e.g. Goa, Manali)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Category</label>
                        <select
                            className="form-input"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Honeymoon">Honeymoon</option>
                            <option value="Beach">Beach</option>
                            <option value="Heritage">Heritage</option>
                            <option value="Nature">Nature</option>
                            <option value="Luxury">Luxury</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Max Price: ₹{priceRange.toLocaleString()}</label>
                        <input
                            type="range"
                            min="1000"
                            max="50000"
                            step="1000"
                            className="form-input"
                            style={{ height: '8px', padding: 0, cursor: 'pointer' }}
                            value={priceRange}
                            onChange={(e) => setPriceRange(parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>No packages found matching your criteria.</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setPriceRange(50000); setSelectedCategory(''); }}>Clear Filters</button>
                </div>
            ) : (
                <div className="package-grid">
                    {filtered.map(pkg => (
                        <PackageCard
                            key={pkg.packageId}
                            pkg={pkg}
                            initialIsFavorite={userFavorites.includes(pkg.packageId)}
                        />
                    ))}
                </div>
            )}

            <div className="card" style={{ marginTop: '60px', padding: '48px', textAlign: 'center', background: 'linear-gradient(135deg, hsla(217, 89%, 61%, 0.1) 0%, hsla(265, 89%, 65%, 0.1) 100%)', borderStyle: 'dashed' }}>
                <h2 className="font-display" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>✨ Want something unique?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', marginInline: 'auto' }}>
                    If you have a specific destination or plan in mind, our travel experts can design a custom trip tailored just for your preferences!
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/request-custom')}>
                    Request a Custom Trip Proposal 🗺️
                </button>
            </div>
        </div>
    );
};

export default PackageListing;
