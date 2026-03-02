import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Axios default config
    axios.defaults.baseURL = 'http://localhost:5000/api';

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            localStorage.setItem('token', token);
            loadUser();
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setToken(null);
            setLoading(false);
        }
    };

    const register = async (formData) => {
        try {
            const res = await axios.post('/auth/register', formData);
            setToken(res.data.token);
            return true;
        } catch (err) {
            console.error(err.response.data);
            return false;
        }
    };

    const login = async (formData) => {
        try {
            const res = await axios.post('/auth/login', formData);
            setToken(res.data.token);
            return true;
        } catch (err) {
            console.error(err.response.data);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
