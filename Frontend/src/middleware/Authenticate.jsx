import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const Authenticate = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/admin/portal" replace />;
        } else {
            return <Navigate to="/user/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default Authenticate;
