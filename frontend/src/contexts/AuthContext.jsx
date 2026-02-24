import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateWithGoogle, getCurrentUser, logout as apiLogout, verifyAuth, clearTokens } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verify authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if we have tokens
                const hasToken = localStorage.getItem('accessToken');
                
                if (hasToken) {
                    // Verify token is still valid and get user
                    const userData = await getCurrentUser();
                    if (userData) {
                        setUser(userData);
                    } else {
                        // Token invalid, clear everything
                        clearTokens();
                        localStorage.removeItem('user');
                        localStorage.removeItem('googleCredential');
                    }
                } else {
                    // No token, clear any stale user data
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                clearTokens();
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (googleCredential) => {
        try {
            // Authenticate with Django backend
            const authData = await authenticateWithGoogle(googleCredential);
            
            // Store user data
            setUser(authData.user);
            localStorage.setItem('user', JSON.stringify(authData.user));
            
            // Store Google credential for Google Calendar API
            localStorage.setItem('googleCredential', googleCredential);
            
            return authData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call backend logout if needed
            await apiLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all local data
            setUser(null);
            clearTokens();
            localStorage.removeItem('user');
            localStorage.removeItem('googleCredential');
            localStorage.removeItem('googleGmailToken');
        }
    };

    const updateUser = async () => {
        try {
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const value = {
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
