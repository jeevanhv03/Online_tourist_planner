import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const MyCustomRequests = () => {
    const [requests, setRequests] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reqRes, vehRes] = await Promise.all([
                API.get('/custom-requests/my'),
                API.get('/vehicles/available')
            ]);
            setRequests(reqRes.data);
            setVehicles(vehRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (reqId) => {
        const vehicleId = selectedVehicle[reqId];
        if (!vehicleId) {
            alert('Please select a vehicle for your custom trip!');
            return;
        }

        setConverting(reqId);
        try {
            await API.post(`/bookings/from-custom/${reqId}?vehicleId=${vehicleId}`);
            alert('🎉 Custom booking confirmed! Redirecting to payment...');
            window.location.href = '/my-bookings';
        } catch (err) {
            alert('Failed to confirm booking');
        } finally {
            setConverting(null);
        }
    };

    if (loading) return <div className="text-center py-5">Loading your requests...</div>;

    return (
        <div className="container py-4">
            <h2 className="mb-4">✨ My Custom Trip Proposals</h2>

            {requests.length === 0 ? (
                <div className="text-center py-5 bg-light rounded shadow-sm">
                    <p className="lead">You haven't requested any custom trips yet.</p>
                    <a href="/request-custom" className="btn btn-primary">Create Your First Proposal</a>
                </div>
            ) : (
                <div className="row g-4">
                    {requests.map(req => (
                        <div className="col-md-6" key={req.id}>
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h4 className="card-title text-primary">{req.destination}</h4>
                                        <span className={`badge bg-${req.status === 'PENDING' ? 'warning' : req.status === 'REJECTED' ? 'danger' : 'success'}`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <div className="small text-muted mb-1">Proposed Dates:</div>
                                        <div>📅 {req.startDate} to {req.endDate} ({req.passengerCount} Pax)</div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="small text-muted mb-1">Your Preferences:</div>
                                        <p className="small border-start ps-3 py-1 bg-light">{req.preferences || 'No specific preferences.'}</p>
                                    </div>

                                    {req.status === 'APPROVED' && (
                                        <div className="mt-4 p-3 bg-light border rounded">
                                            <h5 className="text-success mb-2">Admin Offer: ₹{req.price}</h5>
                                            <p className="small text-muted">{req.adminNotes}</p>

                                            <hr />

                                            <label className="form-label small fw-bold">Select Vehicle for this trip:</label>
                                            <select className="form-select form-select-sm mb-3"
                                                onChange={e => setSelectedVehicle({ ...selectedVehicle, [req.id]: e.target.value })}>
                                                <option value="">-- Choose Vehicle --</option>
                                                {vehicles.filter(v => v.capacity >= req.passengerCount).map(v => (
                                                    <option key={v.vehicleId} value={v.vehicleId}>
                                                        {v.vehicleType} (Cap: {v.capacity})
                                                    </option>
                                                ))}
                                            </select>

                                            <button className="btn btn-primary w-100 fw-bold"
                                                disabled={converting === req.id}
                                                onClick={() => handleConfirm(req.id)}>
                                                {converting === req.id ? 'Processing...' : 'Accept & Book Now'}
                                            </button>
                                        </div>
                                    )}

                                    {req.status === 'REJECTED' && (
                                        <div className="alert alert-danger mt-3">
                                            <strong>Reason:</strong> {req.adminNotes}
                                        </div>
                                    )}

                                    {/* Admin notes for converted bookings */}
                                    {req.status === 'CONVERTED_TO_BOOKING' && (
                                        <div className="alert alert-info mt-3 py-2">
                                            ✅ This proposal has been converted to an active booking.
                                            <a href="/my-bookings" className="alert-link ms-2">View Bookings</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCustomRequests;
