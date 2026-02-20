import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        }
        else {
            setIsLoading(false);
        }
    }, []);
    const fetchUser = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/me');
            setUser(response.data.user);
        }
        catch (error) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
        finally {
            setIsLoading(false);
        }
    };
    const login = async (email, password) => {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password,
        });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
    };
    const register = async (name, email, password) => {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name,
            email,
            password,
        });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
    };
    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
