import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Отсутствует токен подтверждения');
            return;
        }

        let isMounted = true;

        api.get('/auth/verify-email', { params: { token } })
            .then((response) => {
                if (isMounted) {
                    setStatus('success');
                    setMessage(response.data.message || 'Email успешно подтверждён!');
                    setTimeout(() => {
                        navigate('/profile');
                    }, 2000);
                }
            })
            .catch((error) => {
                if (isMounted) {
                    setStatus('error');
                    const errorMsg = error.response?.data?.detail || 'Ошибка подтверждения';
                    setMessage(errorMsg);
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [token, navigate]);

    if (status === 'loading') {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                <h2>Подтверждение email...</h2>
                <p>Пожалуйста, подождите</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ color: '#4CAF50' }}>Email подтверждён!</h2>
                <p>{message}</p>
                <p>Перенаправление в личный кабинет...</p>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#e94560' }}>Ошибка подтверждения</h2>
            <p>{message}</p>
            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '10px 30px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                Вернуться на главную
            </button>
        </div>
    );
};

export default VerifyEmailPage;