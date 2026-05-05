import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [className, setClassName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register({ email, password, full_name: fullName, class_name: className });
            }
            onClose();
            // Очищаем форму
            setEmail('');
            setPassword('');
            setFullName('');
            setClassName('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Затемнение фона */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* Модальное окно */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                width: '90%',
                maxWidth: '450px',
                zIndex: 1001,
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                animation: 'slideIn 0.3s ease'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '20px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#999'
                    }}
                >
                    ×
                </button>

                <h2 style={{ marginBottom: '24px', textAlign: 'center', color: '#1a1a2e' }}>
                    {isLogin ? 'Вход в систему' : 'Регистрация'}
                </h2>

                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#e94560',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '16px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '16px'
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '16px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '16px'
                        }}
                    />

                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                placeholder="ФИО"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginBottom: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Класс (например, 11А)"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginBottom: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            />
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#e94560',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#e94560',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {isLogin ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </p>
            </div>

            {/* Добавляем анимации */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -45%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `}</style>
        </>
    );
};

export default AuthModal;