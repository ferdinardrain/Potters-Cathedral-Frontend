import { createContext, useContext, useState, useEffect } from 'react';

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
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiBase}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            const userData = { ...data.user, token: data.token };
            setIsAuthenticated(true);
            setUser(userData);
            localStorage.setItem('porters_auth', JSON.stringify({ user: userData }));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
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
