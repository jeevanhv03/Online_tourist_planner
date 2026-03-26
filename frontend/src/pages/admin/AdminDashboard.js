import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#eab308', '#a855f7'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/admin/dashboard').then(r => setData(r.data))
            .catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = (data?.monthlyRevenue || []).map(m => ({
        month: monthNames[m.month] || `M${m.month}`, revenue: m.revenue || 0
    }));
    const popularPackages = (data?.popularPackages || []).map(p => ({
        name: p.destination?.substring(0, 10) || '', bookings: parseInt(p.bookings) || 0
    }));
    const vehicleStats = (data?.vehicleUsageStats || []).map(v => ({
        name: v.vehicleType || '', value: parseInt(v.count) || 0
    }));

    const downloadAnalytics = () => {
        if (!data) return;
        let content = "--- TOURIST PLANNER ANALYTICS REPORT ---\n";
        content += `Date: ${new Date().toLocaleDateString()}\n\n`;
        content += `Total Bookings: ${data.totalBookings || 0}\n`;
        content += `Total Revenue: Rs. ${(data.totalRevenue || 0).toLocaleString()}\n`;
        content += `Top Destination: ${data.mostPopularPackage || 'N/A'}\n\n`;

        content += "--- Monthly Revenue ---\n";
        monthlyRevenue.forEach(m => {
            content += `${m.month}: Rs. ${m.revenue.toLocaleString()}\n`;
        });

        content += "\n--- Popular Packages ---\n";
        (data.popularPackages || []).forEach(p => {
            content += `${p.destination || 'Unknown'}: ${p.bookings} bookings\n`;
        });

        content += "\n--- Vehicle Distribution ---\n";
        (data.vehicleUsageStats || []).forEach(v => {
            content += `${v.vehicleType || 'Unknown'}: ${v.count}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <div className="page-title" style={{ margin: 0 }}>📊 Admin Command Center</div>
                    <div className="page-subtitle" style={{ margin: 0, marginTop: '4px' }}>Real-time business intelligence and performance overview</div>
                </div>
                <button className="btn btn-primary" onClick={downloadAnalytics} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⬇️ Download Analytics
                </button>
            </div>

            <div className="stat-grid">
                {[
                    { icon: '🎫', label: 'Total Bookings', value: data?.totalBookings || 0, color: 'var(--primary)' },
                    { icon: '💰', label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}`, color: 'var(--success)' },
                    { icon: '🏆', label: 'Top Destination', value: data?.mostPopularPackage || 'N/A', color: 'var(--secondary)' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: `hsla(${s.color === 'var(--primary)' ? '217, 89%, 61%' : s.color === 'var(--success)' ? '142, 70%, 45%' : '15, 100%, 60%'}, 0.1)`, color: s.color }}>{s.icon}</div>
                        <div className="stat-info">
                            <h3 style={{ fontSize: typeof s.value === 'string' && s.value.length > 12 ? '1.2rem' : '1.8rem' }}>{s.value}</h3>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '32px' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-display">📈 Revenue Analytics</h3>
                        <span className="badge badge-primary">Annual Trend</span>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                        {monthlyRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyRevenue}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="var(--text-dim)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis stroke="var(--text-dim)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={v => [`₹${v?.toLocaleString()}`, 'Revenue']}
                                        contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', backdropFilter: 'var(--glass-blur)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <div className="empty-state"><p>No revenue data yet</p></div>}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3 className="font-display">🚌 Vehicle Distribution</h3></div>
                    <div className="card-body" style={{ height: '300px' }}>
                        {vehicleStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={vehicleStats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                                        {vehicleStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="empty-state"><p>No vehicle data yet</p></div>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                            {vehicleStats.map((v, i) => (
                                <div key={v.name} style={{ display: 'flex', alignIcons: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i % COLORS.length] }}></div>
                                    {v.name} ({v.value})
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="font-display">🏆 Top Performing Packages</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/reports')}>Report Details</button>
                </div>
                <div className="card-body" style={{ height: '240px' }}>
                    {popularPackages.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularPackages} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="var(--text-dim)" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                <Bar dataKey="bookings" fill="var(--secondary)" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <div className="empty-state"><p>No booking data yet</p></div>}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
