import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const { themePref, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">✈️</div>
                    <h3>Online Tourist<br />Planner</h3>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-section-label">Navigation</div>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">🏠</span> Dashboard
                    </NavLink>
                    <NavLink to="/packages" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">🗺️</span> Travel Packages
                    </NavLink>
                    <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">🎫</span> My Bookings
                    </NavLink>
                    <NavLink to="/my-custom-requests" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">✨</span> Custom Proposals
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">👤</span> My Profile
                    </NavLink>
                    <div className="nav-section-label" style={{ marginTop: '12px' }}>Account</div>
                    <button className="nav-link-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span> Logout
                    </button>
                </nav>
            </aside>
            <main className="main-content">
                <div className="topbar">
                    <h1>Welcome, {user?.username}! 👋</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button onClick={toggleTheme} className="btn btn-secondary btn-sm" title={`Theme: ${themePref}`}>
                            {themePref === 'auto' ? '💻 Auto' : themePref === 'light' ? '☀️ Light' : '🌙 Dark'}
                        </button>
                        <div className="topbar-user" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
                            <span>{user?.username}</span>
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

export default UserLayout;
