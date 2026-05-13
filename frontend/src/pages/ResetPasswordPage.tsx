import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }

        try {
            await api.post('/auth/reset-password', null, { params: { token, new_password: password } });
            setMessage('Пароль успешно изменён!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setError('Неверный или просроченный токен');
        }
    };

    if (!token) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Неверная ссылка</div>;
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>Сброс пароля</h2>
            {message && <div style={{ color: '#4CAF50', marginBottom: '10px' }}>{message}</div>}
            {error && <div style={{ color: '#e94560', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Новый пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                <input
                    type="password"
                    placeholder="Подтвердите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Сбросить пароль</button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;