import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginOverride.css'; // Premium custom CSS for the login 

const Login = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [role, setRole] = useState('User'); // Default to User selection
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const data = await login(form.username, form.password);
            
            // Check if backend role matches user selection
            const isServerAdmin = data.roles?.includes('ROLE_ADMIN');
            
            if (role === 'Admin' && !isServerAdmin) {
                logout(); // remove token since it's an invalid selection
                setError('Access denied. Please login as a User or use Admin credentials.');
                setLoading(false);
                return;
            } else if (role === 'User' && isServerAdmin) {
                logout(); // remove token 
                setError('You are an Admin. Please select the Admin option to log in.');
                setLoading(false);
                return;
            }

            // Route based on what the server says about the user
            navigate(isServerAdmin ? '/admin' : '/dashboard');
        } catch (err) {
            console.error('Login error details:', err);
            const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
            setError(msg);
        } finally { setLoading(false); }
    };

    return (
        <div className="custom-auth-bg">
            <div className="glass-card">
                <div className="auth-logo-badge">✈️</div>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to your Tourist Planner account</p>

                {/* Only render tabs if the role is User, per requirement */}
                <div className="auth-tabs" style={{ display: role === 'Admin' ? 'none' : 'flex' }}>
                    <div className="tab-btn tab-active">Sign In</div>
                    <Link to="/register" className="tab-btn tab-inactive">Register</Link>
                </div>
                
                {error && <div className="error-alert">⚠️ {error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="custom-form-group">
                        <label className="custom-label">Username, Email or Phone</label>
                        <input name="username" type="text" className="custom-input" placeholder="Enter username, email or phone"
                            value={form.username} onChange={handleChange} required />
                    </div>
                    
                    <div className="custom-form-group">
                        <label className="custom-label">Password</label>
                        <input name="password" type="password" className="custom-input" placeholder="Enter password"
                            value={form.password} onChange={handleChange} required />
                    </div>
                    
                    <div className="login-as-section">
                        <div className="login-as-header">
                            <span className="login-as-label">Login As:</span>
                        </div>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input type="radio" name="role" value="User" className="custom-radio-input"
                                    checked={role === 'User'} onChange={() => setRole('User')} />
                                <div className="custom-radio-card">👨‍💼 User</div>
                            </label>
                            <label className="radio-option">
                                <input type="radio" name="role" value="Admin" className="custom-radio-input admin-radio"
                                    checked={role === 'Admin'} onChange={() => setRole('Admin')} />
                                <div className="custom-radio-card">🛡️ Admin</div>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                    
                    {/* Conditionally reveal register link! */}
                    {role === 'User' && (
                        <div className="register-link-container">
                            New user? <Link to="/register" className="register-link">Click here to register</Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
