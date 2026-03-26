import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const CustomPackageForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        destination: '',
        passengerCount: 1,
        startDate: '',
        endDate: '',
        preferences: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await API.post('/custom-requests', form);
            setSuccess('✨ Your custom trip request has been submitted! Admin will review and set a price shortly.');
            setTimeout(() => navigate('/my-custom-requests'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow-lg border-0 mx-auto" style={{ maxWidth: '600px' }}>
                <div className="card-body p-5">
                    <h2 className="text-center mb-4">🌍 Request Custom Trip</h2>
                    <p className="text-muted text-center mb-4">
                        Can't find what you're looking for? Tell us where you want to go, and we'll design a package just for you!
                    </p>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Destination</label>
                            <input type="text" name="destination" className="form-control" placeholder="e.g. Switzerland, Japan..."
                                value={form.destination} onChange={handleChange} required />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Total Pax</label>
                                <input type="number" name="passengerCount" className="form-control" min="1"
                                    value={form.passengerCount} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Start Date</label>
                                <input type="date" name="startDate" className="form-control"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={form.startDate} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">End Date</label>
                            <input type="date" name="endDate" className="form-control"
                                min={form.startDate || new Date().toISOString().split('T')[0]}
                                value={form.endDate} onChange={handleChange} required />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Tell us more (Preferences, Budget, etc.)</label>
                            <textarea name="preferences" className="form-control" rows="4"
                                placeholder="Any specific hotels, sights, or food requirements?"
                                value={form.preferences} onChange={handleChange}></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
                            {loading ? '🚀 Submitting...' : 'Send Request'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomPackageForm;
