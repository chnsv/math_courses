import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        class_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/topics');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
            <h1>Регистрация</h1>
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    style={{ width: '100%', padding: 10, marginBottom: 10 }}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    style={{ width: '100%', padding: 10, marginBottom: 10 }}
                />
                <input
                    type="text"
                    placeholder="ФИО"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    style={{ width: '100%', padding: 10, marginBottom: 10 }}
                />
                <input
                    type="text"
                    placeholder="Класс (например, 11А)"
                    value={formData.class_name}
                    onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                    style={{ width: '100%', padding: 10, marginBottom: 10 }}
                />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>
            <p style={{ marginTop: 20 }}>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
        </div>
    );
};

export default RegisterPage;