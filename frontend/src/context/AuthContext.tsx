import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Auto-check authentication on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${storedToken}` }
            })
                .then(response => {
                    setUser(response.data.user);
                    setToken(storedToken);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token: newToken, user: newUser } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            throw err;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/register`, { name, email, password });
            const { token: newToken, user: newUser } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};