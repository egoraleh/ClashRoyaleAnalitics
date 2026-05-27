import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as authApi from './auth';
import { clearTokens, getToken } from './client';
import type { User } from './auth';

type AuthState = {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, playerTag: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function getStoredUser(): User | null {
    const stored = localStorage.getItem('user');
    if (!stored || !getToken()) {
        return null;
    }

    try {
        return JSON.parse(stored) as User;
    } catch {
        localStorage.removeItem('user');
        clearTokens();
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => getStoredUser());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && !getToken()) {
            setUser(null);
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = useCallback(async (username: string, password: string) => {
        setLoading(true);
        try {
            const result = await authApi.login(username, password);
            setUser(result.user);
            localStorage.setItem('user', JSON.stringify(result.user));
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (username: string, email: string, password: string, playerTag: string) => {
        setLoading(true);
        try {
            const result = await authApi.register(username, email, password, playerTag);
            setUser(result.user);
            localStorage.setItem('user', JSON.stringify(result.user));
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        clearTokens();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
