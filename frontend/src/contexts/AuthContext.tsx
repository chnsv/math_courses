import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

interface User {
    id: number;
    email: string;
    full_name: string;
    class_name: string;
    role: string;  // 'student', 'teacher', 'admin'
    xp: number;
    level: number;
    avatar_url?: string;
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                console.log('Загружен пользователь из localStorage:', parsedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error('Ошибка парсинга user', e);
                localStorage.removeItem('user');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { access_token, refresh_token, user } = response.data;

        console.log('Логин получен пользователь:', user);
        console.log('Роль пользователя:', user.role);

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const register = async (userData: any) => {
        console.log('Регистрация с данными:', userData);
        const response = await api.post('/auth/register', userData);
        console.log('Ответ регистрации:', response.data);

        // После регистрации сразу логинимся
        await login(userData.email, userData.password);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};