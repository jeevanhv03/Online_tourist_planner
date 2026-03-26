import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/users/all');
            setUsers(res.data);
            console.log('Successfully loaded ' + res.data.length + ' users');
        } catch (err) {
            console.error('Detailed fetch error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
            const statusCode = err.response?.status ? ` (${err.response.status})` : '';
            setMessage({ type: 'error', text: `Failed to load users: ${errorMsg}${statusCode}` });
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (user) => {
        try {
            const res = await API.patch(`/users/${user.id}/status`, { active: !user.active });
            setUsers(users.map(u => u.id === user.id ? res.data : u));
            setMessage({ type: 'success', text: `User ${user.username} ${!user.active ? 'unlocked' : 'locked'} successfully` });
        } catch (err) {
            console.error('Failed to toggle status:', err);
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-title">👥 User Management</div>
            <div className="page-subtitle">Monitor and manage application users and their access levels</div>

            {message && (
                <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`} role="alert">
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
            )}

            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-body">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="🔍 Search users by username, email or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Contact Info</th>
                                <th>Roles</th>
                                <th>Joined & Points</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">No users found match your search</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👤'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{user.fullName || 'No Name'}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem' }}>{user.email}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{user.phone || 'No phone'}</div>
                                        </td>
                                        <td>
                                            {user.roles.split(', ').map(role => (
                                                <span key={role} className={`badge ${role.includes('ADMIN') ? 'bg-primary' : 'bg-secondary'}`} style={{ marginRight: '4px' }}>
                                                    {role.replace('ROLE_', '')}
                                                </span>
                                            ))}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>🌟 {user.loyaltyPoints || 0} pts</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.active ? 'bg-success' : 'bg-danger'}`}>
                                                {user.active ? 'Active' : 'Locked'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`btn btn-sm ${user.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                onClick={() => toggleStatus(user)}
                                            >
                                                {user.active ? '🔒 Lock' : '🔓 Unlock'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
