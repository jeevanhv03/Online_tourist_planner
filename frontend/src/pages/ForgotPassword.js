import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(''); // 'success' | 'error'
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setStatus('success');
            setMessage(res.data.message);
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
                <div className="auth-logo">🔒</div>
                <h2>Forgot Password</h2>
                <p>Enter your registered email to receive a reset link.</p>

                {message && (
                    <div className={`alert alert-${status === 'success' ? 'success' : 'danger'}`}
                        style={{ marginBottom: '16px' }}>
                        {message}
                    </div>
                )}

                {status !== 'success' && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                        >
                            {loading ? '📧 Sending...' : '📧 Send Reset Link'}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Remember your password? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
