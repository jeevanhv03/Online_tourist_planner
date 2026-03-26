import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '', phone: '', address: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            await register(form);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">🗺️</div>
                <h2>Create Account</h2>
                <p>Join Online Tourist Planner today</p>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input name="fullName" className="form-input" placeholder="Enter your full name"
                            value={form.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Username *</label>
                            <input name="username" className="form-input" placeholder="Choose username"
                                value={form.username} onChange={handleChange} required minLength={3} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input name="email" type="email" className="form-input" placeholder="Your email"
                                value={form.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input name="password" type="password" className="form-input" placeholder="Min 6 characters"
                            value={form.password} onChange={handleChange} required minLength={6} />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input name="phone" className="form-input" placeholder="Phone number"
                                value={form.phone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input name="address" className="form-input" placeholder="Your address"
                                value={form.address} onChange={handleChange} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? '🔄 Registering...' : '✅ Create Account'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
