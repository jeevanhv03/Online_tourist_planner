import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const { themePref, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">🛡️</div>
                    <h3>Admin Panel<br /><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Tourist Planner</span></h3>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-section-label">Dashboard</div>
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">📊</span> Analytics
                    </NavLink>
                    <div className="nav-section-label">Management</div>
                    <NavLink to="/admin/vehicles" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">🚌</span> Vehicles
                    </NavLink>
                    <NavLink to="/admin/packages" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">🗺️</span> Packages
                    </NavLink>
                    <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">🎫</span> Bookings
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">👥</span> Users
                    </NavLink>
                    <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">⭐</span> Reviews
                    </NavLink>
                    <NavLink to="/admin/custom-requests" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">✨</span> Custom Requests
                    </NavLink>
                    <div className="nav-section-label">Business</div>
                    <NavLink to="/admin/promotions" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">🎁</span> Promotions
                    </NavLink>
                    <div className="nav-section-label">Reports</div>
                    <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">📋</span> Reports
                    </NavLink>
                    <div className="nav-section-label" style={{ marginTop: '12px' }}>Account</div>
                    <NavLink to="/admin/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">👤</span> My Profile
                    </NavLink>
                    <button className="nav-link-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span> Logout
                    </button>
                </nav>
            </aside>
            <main className="main-content">
                <div className="topbar">
                    <h1>Administration Panel</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button onClick={toggleTheme} className="btn btn-secondary btn-sm" title={`Theme: ${themePref}`}>
                            {themePref === 'auto' ? '💻 Auto' : themePref === 'light' ? '☀️ Light' : '🌙 Dark'}
                        </button>
                        <div className="topbar-user" onClick={() => navigate('/admin/profile')} style={{ cursor: 'pointer' }}>
                            <div className="user-avatar" style={{ background: 'linear-gradient(135deg,#ff6b35,#f59e0b)' }}>
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <span>{user?.username}</span>
                            <span className="badge badge-warning">ADMIN</span>
                        </div>
                    </div>
                </div>
                <div className="page-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
