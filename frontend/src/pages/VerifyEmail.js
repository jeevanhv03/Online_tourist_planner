import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. No token found.');
            return;
        }

        API.get(`/auth/verify-email?token=${token}`)
            .then(res => {
                setStatus('success');
                setMessage(res.data.message || 'Email verified successfully! You can now login.');
                // Auto redirect to login after 3 seconds
                setTimeout(() => navigate('/login'), 5000);
            })
            .catch(err => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
            });
    }, [token, navigate]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm p-4 text-center" style={{ maxWidth: '450px', width: '90%' }}>
                <div className="card-body">
                    {status === 'verifying' && (
                        <div className="py-4">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h5>{message}</h5>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-4">
                            <div className="display-1 text-success mb-3">✅</div>
                            <h3 className="text-success mb-3">Verified!</h3>
                            <p className="text-muted mb-4">{message}</p>
                            <p className="small text-muted">Redirecting to login in a few seconds...</p>
                            <Link to="/login" className="btn btn-primary px-4">Login Now</Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-4">
                            <div className="display-1 text-danger mb-3">❌</div>
                            <h3 className="text-danger mb-3">Verification Failed</h3>
                            <p className="text-muted mb-4">{message}</p>
                            <div className="d-grid gap-2">
                                <Link to="/register" className="btn btn-primary">Try Registering Again</Link>
                                <Link to="/login" className="btn btn-outline-secondary">Go to Login</Link>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-3 border-top">
                        <p className="small text-muted mb-0">
                            &copy; 2024 Online Tourist Planner. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
