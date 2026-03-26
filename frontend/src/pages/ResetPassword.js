import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [status, setStatus] = useState(''); // 'success' | 'error'
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid reset link. Please request a new one.');
        }
    }, [token]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }
        if (form.newPassword.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const res = await axios.post('/api/auth/reset-password', {
                token,
                newPassword: form.newPassword
            });
            setStatus('success');
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">🔑</div>
                <h2>Reset Password</h2>
                <p>Enter your new password below.</p>

                {message && (
                    <div className={`alert alert-${status === 'success' ? 'success' : 'danger'}`}
                        style={{ marginBottom: '16px' }}>
                        {message}
                        {status === 'success' && <span> Redirecting to login...</span>}
                    </div>
                )}

                {status !== 'success' && token && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                name="newPassword"
                                type="password"
                                className="form-input"
                                placeholder="Minimum 6 characters"
                                value={form.newPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                className="form-input"
                                placeholder="Repeat your new password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                        >
                            {loading ? '🔄 Resetting...' : '✅ Reset Password'}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Link to="/forgot-password" style={{ color: 'var(--primary)' }}>Request a new link</Link>
                    {' · '}
                    <Link to="/login" style={{ color: 'var(--primary)' }}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
