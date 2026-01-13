import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem('porters_auth');
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                setIsAuthenticated(true);
                setUser(authData.user);
            } catch (error) {
                localStorage.removeItem('porters_auth');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await apiClient.post('/api/auth/login', { username, password });

            if (response.error || !response.success) {
                return { success: false, error: response.error || 'Login failed' };
            }

            const userData = { ...response.user, token: response.token };
            setIsAuthenticated(true);
            setUser(userData);
            localStorage.setItem('porters_auth', JSON.stringify({ user: userData }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('porters_auth');
    };

    const updateUser = (userData) => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('porters_auth', JSON.stringify({ user: updatedUser }));
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
