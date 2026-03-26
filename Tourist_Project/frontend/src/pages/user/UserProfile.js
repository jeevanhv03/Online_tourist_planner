import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
];

const UserProfile = () => {
    const { themePref, setThemePref } = useTheme();
    const { isAdmin } = useAuth();

    const [user, setUser] = useState(() => {
        const local = JSON.parse(localStorage.getItem('user') || '{}');
        return {
            id: local.id || null,
            username: local.username || '',
            fullName: local.fullName || local.name || '',
            email: local.email || '',
            phone: local.phone || '',
            address: local.address || '',
            avatarUrl: local.avatarUrl || ''
        };
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Password Modal State
    const [showPassModal, setShowPassModal] = useState(false);
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });

    // Avatar Modal State
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Profile Load Session Check:', userData);

        if (userData.id) {
            API.get('/users/profile').then(userRes => {
                const refreshedUser = {
                    ...userRes.data,
                    id: userData.id
                };
                setUser(prev => ({ ...prev, ...refreshedUser }));

                // Fetch reviews using the most accurate username from backend
                return API.get(`/reviews/user/${refreshedUser.username}`);
            }).then(revRes => {
                setReviews(revRes.data);
            }).catch(err => {
                console.error('Profile Fetch Error:', err);
                setMessage({ type: 'danger', text: 'Failed to load profile data.' });
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final guard: get ID directly from storage if state is corrupted
        const sessionUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activeId = user.id || sessionUser.id;

        if (!activeId) {
            setMessage({ type: 'danger', text: 'User session invalid. Please log in again.' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const updatePayload = { ...user, id: activeId };
            await API.put(`/users/${activeId}`, updatePayload);

            setMessage({ type: 'success', text: 'Profile updated successfully! ✨' });

            // Sync session but PRESERVE token and existing critical auth data
            const updatedSession = { ...sessionUser, ...user, id: activeId };
            localStorage.setItem('user', JSON.stringify(updatedSession));
            setUser(updatedSession);
        } catch (error) {
            console.error('Update Error:', error);
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        const sessionUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activeId = user.id || sessionUser.id;

        if (!activeId) {
            setPassMsg({ type: 'danger', text: 'User session invalid. Please log in again.' });
            return;
        }

        if (passData.newPassword !== passData.confirmPassword) {
            setPassMsg({ type: 'danger', text: 'New passwords do not match!' });
            return;
        }
        try {
            await API.post(`/users/${activeId}/change-password`, {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            setPassMsg({ type: 'success', text: 'Password changed successfully! 🔐' });
            setTimeout(() => {
                setShowPassModal(false);
                setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setPassMsg({ type: '', text: '' });
            }, 2000);
        } catch (error) {
            console.error('Password Update Error:', error);
            setPassMsg({ type: 'danger', text: error.response?.data?.message || 'Failed to change password.' });
        }
    };

    const selectAvatar = (url) => {
        setUser({ ...user, avatarUrl: url });
        setShowAvatarModal(false);
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <div className="page-title">👤 My Profile</div>
            <div className="page-subtitle">Manage your personal information and preferences</div>

            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <h3 className="font-display">Account Settings</h3>
                </div>
                <div className="card-body">
                    {message.text && (
                        <div className={`alert alert-${message.type}`} style={{ marginBottom: '24px' }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'center' }}>
                            <div className="user-avatar" style={{ width: '100px', height: '100px', overflow: 'hidden' }}>
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ fontSize: '2.5rem' }}>{user.fullName?.charAt(0) || user.username?.charAt(0)}</div>
                                )}
                            </div>
                            <div>
                                <h2 className="font-display" style={{ marginBottom: '4px' }}>{user.fullName || user.username}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                                    Account Identifier: {user.id ? `#USR-${user.id}` : <span style={{ color: 'var(--danger)', fontWeight: '700' }}>Session Error - Please Re-login</span>}
                                </p>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', border: '1px solid var(--border)', marginBottom: '12px' }}>
                                    🌟 {user.loyaltyPoints || 0} Travel Points Available
                                </div>
                                <div style={{ display: 'block' }}>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAvatarModal(true)}>
                                        ✨ Change Avatar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Full Name</label>
                                <input className="form-input" name="fullName" placeholder="Your full name" value={user.fullName || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input className="form-input" name="username" placeholder="Choose username" value={user.username || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input className="form-input" type="email" name="email" value={user.email || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="form-input" name="phone" placeholder="Contact number" value={user.phone || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Residential Address</label>
                                <input className="form-input" name="address" placeholder="Your address" value={user.address || ''} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving Changes...' : '✅ Save Profile Changes'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card" style={{ marginTop: '32px' }}>
                <div className="card-header">
                    <h3 className="font-display">Appearance & Preferences</h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ marginBottom: '4px', fontWeight: '600' }}>Application Theme</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select your preferred visual mode.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className={`btn btn-sm ${themePref === 'auto' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setThemePref('auto')}>💻 Auto</button>
                            <button type="button" className={`btn btn-sm ${themePref === 'light' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setThemePref('light')}>☀️ Light</button>
                            <button type="button" className={`btn btn-sm ${themePref === 'dark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setThemePref('dark')}>🌙 Dark</button>
                        </div>
                    </div>
                </div>
            </div>

            {!isAdmin && (
            <div className="card" style={{ marginTop: '32px' }}>
                <div className="card-header">
                    <h3 className="font-display">⭐ My Reviews</h3>
                </div>
                <div className="card-body">
                    {reviews.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>You haven't posted any reviews yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reviews.map(review => (
                                <div key={review.reviewId} style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 600 }}>{review.destinationName}</div>
                                        <div style={{ color: '#f1c40f' }}>{'⭐'.repeat(review.rating)}</div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{review.comment}</p>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Posted on {new Date(review.createdAt).toLocaleDateString()}</span>
                                        <span className={`badge ${review.isVisible ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                                            {review.isVisible ? 'Public' : 'Hidden by Admin'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            )}

            <div className="card" style={{ marginTop: '32px', border: '1px solid hsla(0, 84%, 60%, 0.15)' }}>
                <div className="card-header" style={{ borderBottom: '1px solid hsla(0, 84%, 60%, 0.1)' }}>
                    <h3 className="font-display" style={{ color: 'var(--danger)' }}>Security & Privacy</h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ marginBottom: '4px', fontWeight: '600' }}>Change Password</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Update your account password regularly to stay secure.</p>
                        </div>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPassModal(true)}>
                            🔒 Update Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPassModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 className="font-display">Update Password</h3>
                            <button className="close-btn" onClick={() => setShowPassModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handlePasswordChange}>
                            <div className="modal-body">
                                {passMsg.text && <div className={`alert alert-${passMsg.type}`} style={{ marginBottom: '16px' }}>{passMsg.text}</div>}
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input className="form-input" type="password" required value={passData.oldPassword}
                                        onChange={e => setPassData({ ...passData, oldPassword: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input className="form-input" type="password" required minLength={6} value={passData.newPassword}
                                        onChange={e => setPassData({ ...passData, newPassword: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <input className="form-input" type="password" required value={passData.confirmPassword}
                                        onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPassModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Avatar Selection Modal */}
            {showAvatarModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 className="font-display">Choose Avatar</h3>
                            <button className="close-btn" onClick={() => setShowAvatarModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                {AVATARS.map((url, i) => (
                                    <div key={i} className={`avatar-option ${user.avatarUrl === url ? 'selected' : ''}`}
                                        onClick={() => selectAvatar(url)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '10px',
                                            borderRadius: '12px',
                                            border: user.avatarUrl === url ? '2px solid var(--primary)' : '2px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <img src={url} alt={`Avatar ${i}`} style={{ width: '100%', borderRadius: '50%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAvatarModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
