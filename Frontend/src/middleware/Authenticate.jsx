import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const Authenticate = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [isVerified, setIsVerified] = React.useState(null);

    React.useEffect(() => {
        if (!token) {
            setIsVerified(false);
            return;
        }
        axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/verify-token`, { token })
            .then(res => {
                setIsVerified(res.status === 200);
            })
            .catch(() => {
                setIsVerified(false);
            });
    }, [token]);

    if (!token || isVerified === false) {
        return <Navigate to="/login" replace />;
    }

    if (isVerified === null) {
        return <div className='h-screen w-screen bg-white dark:bg-black'></div>;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/admin/portal" replace />;
        } else {
            return <Navigate to="/user/dashboard" replace />;
        }
    }

    return <Outlet />;
}


export default Authenticate;
