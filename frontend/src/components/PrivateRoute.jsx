import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { token, loading } = useContext(AuthContext);

    if (loading) return <div className="flex justify-center items-center h-screen text-brand-500">Loading your journey...</div>;

    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
