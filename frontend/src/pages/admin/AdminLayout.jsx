import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AdminDashboard.css';

const NAV_ITEMS = [
    { to: '/admin', icon: 'fa-chart-pie', label: 'Overview', end: true },
    { to: '/admin/users', icon: 'fa-users-cog', label: 'Users' },
    { to: '/admin/drivers', icon: 'fa-truck', label: 'Drivers' },
    { to: '/admin/orders', icon: 'fa-box', label: 'Orders' },
    { to: '/admin/properties', icon: 'fa-building', label: 'Properties' },
    { to: '/admin/settings', icon: 'fa-sliders-h', label: 'Settings' },
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleSignOut = () => {
        logout();
        navigate('/Login');
    };

    const greeting = () => {
        const h = currentTime.getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="admin-app">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            <i className="fas fa-bolt"></i>
                        </div>
                        {sidebarOpen && <span className="brand-text">SwiftAdmin</span>}
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            {sidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-link signout-link" onClick={handleSignOut}>
                        <i className="fas fa-sign-out-alt"></i>
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`admin-main ${sidebarOpen ? '' : 'expanded'}`}>
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <h2 className="topbar-greeting">{greeting()}, Admin</h2>
                        <p className="topbar-date">
                            {currentTime.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-indicator">
                            <span className="pulse-dot"></span>
                            <span>System Online</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
