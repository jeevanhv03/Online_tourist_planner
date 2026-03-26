import React, { createContext, useContext, useState, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });

    const login = useCallback(async (username, password) => {
        const res = await API.post('/auth/login', { username, password });
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    }, []);

    const register = useCallback(async (data) => {
        const res = await API.post('/auth/register', data);
        return res.data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isAdmin, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
