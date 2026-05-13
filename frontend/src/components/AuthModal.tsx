import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    // Состояния для восстановления пароля
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register({ email, password, full_name: fullName, class_name: className, role });
            }
            onClose();
            setEmail('');
            setPassword('');
            setFullName('');
            setClassName('');
            setRole('student');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetEmail) {
            setResetError('Введите email');
            return;
        }
        setResetError('');
        setResetMessage('');
        try {
            await api.post('/auth/forgot-password', null, { params: { email: resetEmail } });
            setResetMessage('Инструкции по восстановлению отправлены на ваш email');
            setTimeout(() => {
                setShowResetForm(false);
                setResetEmail('');
                setResetMessage('');
            }, 3000);
        } catch (err: any) {
            setResetError(err.response?.data?.detail || 'Ошибка отправки');
        }
    };

    return (
        <>
            <div onClick={onClose} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
            }} />

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
                maxHeight: '90vh',
                overflow: 'auto'
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

                {/* Форма восстановления пароля */}
                {showResetForm ? (
                    <div>
                        <h2 style={{ marginBottom: '24px', textAlign: 'center', color: '#1a1a2e' }}>Восстановление пароля</h2>
                        <p style={{ marginBottom: '20px', textAlign: 'center', color: '#666' }}>Введите email, указанный при регистрации</p>

                        {resetMessage && (
                            <div style={{
                                backgroundColor: '#d4edda',
                                color: '#155724',
                                padding: '10px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontSize: '14px'
                            }}>
                                {resetMessage}
                            </div>
                        )}
                        {resetError && (
                            <div style={{
                                backgroundColor: '#fee',
                                color: '#e94560',
                                padding: '10px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontSize: '14px'
                            }}>
                                {resetError}
                            </div>
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '16px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '16px'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowResetForm(false);
                                    setResetEmail('');
                                    setResetMessage('');
                                    setResetError('');
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#ccc',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleResetPassword}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#e94560',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Отправить
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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

                                    {role === 'student' && (
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
                                    )}

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Регистрируюсь как:</label>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                <input type="radio" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} />
                                                Ученик
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                <input type="radio" value="teacher" checked={role === 'teacher'} onChange={(e) => setRole(e.target.value)} />
                                                Учитель
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                <input type="radio" value="admin" checked={role === 'admin'} onChange={(e) => setRole(e.target.value)} />
                                                Администратор
                                            </label>
                                        </div>
                                    </div>
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

                        {/* Кнопка "Забыли пароль?" */}
                        {isLogin && (
                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <button
                                    onClick={() => setShowResetForm(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#667eea',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Забыли пароль?
                                </button>
                            </div>
                        )}

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
                    </>
                )}
            </div>
        </>
    );
};

export default AuthModal;