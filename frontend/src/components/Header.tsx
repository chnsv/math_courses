import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
        setIsDropdownOpen(false);
    };

    const handleDropdownClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const menuItems = [
        { label: 'Математика 5-6 класс', link: '/topics?level=5-6' },
        { label: 'Алгебра 7-8 класс', link: '/topics?level=7-8-algebra' },
        { label: 'Геометрия 7-8 класс', link: '/topics?level=7-8-geometry' },
        { label: 'Подготовка ОГЭ', link: '/topics?level=oge' },
        { label: 'Подготовка ЕГЭ', link: '/topics?level=ege' },
        { label: 'Пробники ОГЭ', link: '/tests/oge' },
        { label: 'Пробники ЕГЭ', link: '/tests/ege' },
    ];

    return (
        <>
            <style>{`
                @media (min-width: 769px) {
                    .desktop-nav {
                        display: flex !important;
                    }
                    .mobile-menu-btn {
                        display: none !important;
                    }
                    .mobile-menu {
                        display: none !important;
                    }
                }
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
            `}</style>

            <header style={{
                backgroundColor: '#1a1a2e',
                color: 'white',
                padding: '15px 20px',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
                        📐 MathCourse
                    </Link>

                    {/* Десктопная навигация */}
                    <nav className="desktop-nav" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={handleDropdownClick}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    padding: '8px 0'
                                }}
                            >
                                Меню ▼
                            </button>
                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '35px',
                                    left: 0,
                                    backgroundColor: 'white',
                                    color: '#333',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    minWidth: '200px',
                                    zIndex: 1001
                                }}>
                                    {menuItems.map((item, idx) => (
                                        <Link
                                            key={idx}
                                            to={item.link}
                                            style={{
                                                display: 'block',
                                                padding: '10px 20px',
                                                textDecoration: 'none',
                                                color: '#333',
                                                borderBottom: '1px solid #eee'
                                            }}
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link to="/reviews" style={{ color: 'white', textDecoration: 'none' }}>Отзывы</Link>
                        <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>О нас</Link>

                        {user ? (
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>
                                    👤 {user.full_name?.split(' ')[0] || user.email}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: '#e94560',
                                        border: 'none',
                                        color: 'white',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Выйти
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    console.log('🔴 Кнопка Войти нажата!');
                                    setIsAuthModalOpen(true);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                Войти
                            </button>
                        )}
                    </nav>

                    {/* Кнопка бургер-меню для мобильных устройств */}
                    <button
                        className="mobile-menu-btn"
                        onClick={handleMenuClick}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '28px',
                            cursor: 'pointer',
                            display: 'none'
                        }}
                    >
                        ☰
                    </button>
                </div>

                {/* Мобильное меню */}
                {isMenuOpen && (
                    <div className="mobile-menu" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#1a1a2e',
                        padding: '20px',
                        gap: '15px',
                        marginTop: '15px',
                        borderTop: '1px solid #333'
                    }}>
                        {menuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.link}
                                style={{ color: 'white', textDecoration: 'none', padding: '8px 0' }}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link to="/reviews" style={{ color: 'white', textDecoration: 'none', padding: '8px 0' }} onClick={() => setIsMenuOpen(false)}>Отзывы</Link>
                        <Link to="/about" style={{ color: 'white', textDecoration: 'none', padding: '8px 0' }} onClick={() => setIsMenuOpen(false)}>О нас</Link>

                        {user ? (
                            <>
                                <Link to="/profile" style={{ color: 'white', textDecoration: 'none', padding: '8px 0' }} onClick={() => setIsMenuOpen(false)}>
                                    👤 Личный кабинет
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    style={{
                                        background: '#e94560',
                                        border: 'none',
                                        color: 'white',
                                        padding: '10px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        marginTop: '10px'
                                    }}
                                >
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    console.log('🔴 Кнопка Войти нажата (мобильное меню)');
                                    setIsAuthModalOpen(true);
                                    setIsMenuOpen(false);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    padding: '8px 0',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                Войти
                            </button>
                        )}
                    </div>
                )}
            </header>

            {/* Модальное окно авторизации */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
};

export default Header;