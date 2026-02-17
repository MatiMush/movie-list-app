import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api/auth';
export const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            setIsAuthenticated(true);
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };
    const register = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/register`, { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            setIsAuthenticated(true);
        }
        catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };
    return (_jsx(AuthContext.Provider, { value: { user, login, register, logout, isAuthenticated }, children: children }));
};
