import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const AdminCustomRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [priceInput, setPriceInput] = useState({});
    const [notesInput, setNotesInput] = useState({});

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await API.get('/custom-requests/all');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        const price = priceInput[id];
        if (!price || price <= 0) {
            alert('Please set a valid price first!');
            return;
        }

        setActionLoading(id);
        try {
            await API.put(`/custom-requests/${id}/approve`, {
                price: parseFloat(price),
                notes: notesInput[id] || ''
            });
            fetchRequests();
        } catch (err) {
            alert('Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        const notes = notesInput[id];
        if (!notes) {
            alert('Please provide a reason for rejection in notes.');
            return;
        }

        setActionLoading(id);
        try {
            await API.put(`/custom-requests/${id}/reject`, { notes });
            fetchRequests();
        } catch (err) {
            alert('Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="text-center py-5">Loading requests...</div>;

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4">📋 Custom Trip Proposals</h2>

            <div className="table-responsive">
                <table className="table table-hover shadow-sm bg-white">
                    <thead className="table-dark">
                        <tr>
                            <th>User</th>
                            <th>Destination</th>
                            <th>Pax</th>
                            <th>Dates</th>
                            <th>Status</th>
                            <th>Pricing / Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-4">No custom requests found.</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req.id}>
                                    <td><strong>{req.username}</strong></td>
                                    <td>{req.destination}</td>
                                    <td>{req.passengerCount}</td>
                                    <td>
                                        <small>{req.startDate} to {req.endDate}</small>
                                    </td>
                                    <td>
                                        <span className={`badge bg-${req.status === 'PENDING' ? 'warning' : req.status === 'REJECTED' ? 'danger' : 'success'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td>
                                        {req.status === 'PENDING' ? (
                                            <>
                                                <input type="number" className="form-control form-control-sm mb-1" placeholder="Set Total Price (₹)"
                                                    onChange={e => setPriceInput({ ...priceInput, [req.id]: e.target.value })} />
                                                <input type="text" className="form-control form-control-sm" placeholder="Admin Notes"
                                                    onChange={e => setNotesInput({ ...notesInput, [req.id]: e.target.value })} />
                                            </>
                                        ) : (
                                            <>
                                                {req.price && <div>₹{req.price}</div>}
                                                <small className="text-muted">{req.adminNotes}</small>
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        {req.status === 'PENDING' && (
                                            <div className="btn-group">
                                                <button className="btn btn-success btn-sm" disabled={actionLoading === req.id} onClick={() => handleApprove(req.id)}>
                                                    Approve
                                                </button>
                                                <button className="btn btn-danger btn-sm" disabled={actionLoading === req.id} onClick={() => handleReject(req.id)}>
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCustomRequests;
