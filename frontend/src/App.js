import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import UserDashboard from './pages/user/UserDashboard';
import PackageListing from './pages/user/PackageListing';
import PackageDetails from './pages/user/PackageDetails';
import BookingPage from './pages/user/BookingPage';
import MyBookings from './pages/user/MyBookings';
import AdminDashboard from './pages/admin/AdminDashboard';
import VehicleManagement from './pages/admin/VehicleManagement';
import PackageManagement from './pages/admin/PackageManagement';
import BookingManagement from './pages/admin/BookingManagement';
import ReportsPage from './pages/admin/ReportsPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PaymentPage from './pages/PaymentPage';
import CustomPackageForm from './pages/user/CustomPackageForm';
import MyCustomRequests from './pages/user/MyCustomRequests';
import AdminCustomRequests from './pages/admin/AdminCustomRequests';
import ReviewManagement from './pages/admin/ReviewManagement';
import UserManagement from './pages/admin/UserManagement';
import UserProfile from './pages/user/UserProfile';
import VerifyEmail from './pages/VerifyEmail';
import PromoManagement from './pages/admin/PromoManagement';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
};

const AppRoutes = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* User Routes */}
            <Route path="/" element={<PrivateRoute>{isAdmin ? <Navigate to="/admin" replace /> : <UserLayout />}</PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="packages" element={<PackageListing />} />
                <Route path="packages/:id" element={<PackageDetails />} />
                <Route path="book/:packageId" element={<BookingPage />} />
                <Route path="my-bookings" element={<MyBookings />} />
                <Route path="payment/:bookingId" element={<PaymentPage />} />
                <Route path="request-custom" element={<CustomPackageForm />} />
                <Route path="my-custom-requests" element={<MyCustomRequests />} />
                <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="vehicles" element={<VehicleManagement />} />
                <Route path="packages" element={<PackageManagement />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="custom-requests" element={<AdminCustomRequests />} />
                <Route path="reviews" element={<ReviewManagement />} />
                <Route path="promotions" element={<PromoManagement />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<UserProfile />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
