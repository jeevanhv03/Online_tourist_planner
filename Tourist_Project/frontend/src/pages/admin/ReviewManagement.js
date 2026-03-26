import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const loadReviews = async () => {
        try {
            const res = await API.get('/reviews/all');
            setReviews(res.data);
        } catch (e) {
            console.error('Review fetch error:', e);
            const errorMsg = e.response?.data?.message || e.message || 'Unknown error';
            alert(`Failed to load reviews: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const toggleVisibility = async (reviewId, currentVisibility) => {
        setActionLoading(reviewId);
        try {
            await API.patch(`/reviews/${reviewId}/visibility`, { isVisible: !currentVisibility });
            setReviews(reviews.map(r => r.reviewId === reviewId ? { ...r, isVisible: !currentVisibility } : r));
        } catch (e) {
            alert('Failed to update visibility');
        } finally {
            setActionLoading(null);
        }
    };

    const downloadReport = () => {
        const headers = ["Review ID", "User", "Package", "Rating", "Comment", "Date", "Status"];
        const csvContent = [
            headers.join(","),
            ...reviews.map(r => [
                r.reviewId,
                `"${r.username || ''}"`,
                `"${r.destinationName || ''}"`,
                r.rating,
                `"${(r.comment || '').replace(/"/g, '""')}"`,
                new Date(r.createdAt).toLocaleDateString(),
                r.isVisible ? 'Visible' : 'Hidden'
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reviews_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 className="font-display">⭐ Review Moderation</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Manage customer feedback and public visibility</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="badge badge-primary">{reviews.length} Total Reviews</div>
                    <button className="btn btn-primary" onClick={downloadReport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⬇️ Download Report
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Review ID</th>
                                    <th>User</th>
                                    <th>Package</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No reviews found</td>
                                    </tr>
                                ) : (
                                    reviews.map(review => (
                                        <tr key={review.reviewId}>
                                            <td style={{ fontWeight: 600 }}>#REV-{review.reviewId}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="avatar-sm" style={{ background: 'var(--primary-light)' }}>
                                                        {review.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span>{review.username}</span>
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {review.destinationName}
                                            </td>
                                            <td>
                                                <div style={{ color: '#f1c40f', fontWeight: 700 }}>
                                                    {'⭐'.repeat(review.rating)}
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: '250px' }}>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {review.comment}
                                                </p>
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>{new Date(review.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${review.isVisible ? 'badge-success' : 'badge-danger'}`}>
                                                    {review.isVisible ? 'Visible' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${review.isVisible ? 'btn-secondary' : 'btn-primary'}`}
                                                    onClick={() => toggleVisibility(review.reviewId, review.isVisible)}
                                                    disabled={actionLoading === review.reviewId}
                                                    style={{ minWidth: '80px' }}
                                                >
                                                    {actionLoading === review.reviewId ? '...' : (review.isVisible ? '🙈 Hide' : '👁️ Show')}
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
        </div>
    );
};

export default ReviewManagement;
