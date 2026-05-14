import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '24px',
                padding: '60px 40px',
                textAlign: 'center',
                color: 'white',
                marginBottom: '60px'
            }}>
                <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>О нас</h1>
                <p style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto', opacity: 0.95 }}>
                    MathCourse — это онлайн-платформа для подготовки к ОГЭ и ЕГЭ по математике
                </p>
            </div>

            <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#1a1a2e' }}>Наша миссия</h2>
                <p style={{ fontSize: '18px', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto', color: '#555' }}>
                    Сделать качественную подготовку к экзаменам доступной для каждого школьника,
                    используя современные технологии.
                </p>
            </div>

            {/* О проекте */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
                marginBottom: '60px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '30px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎓</div>
                    <h3 style={{ marginBottom: '15px' }}>Для кого эти курсы</h3>
                    <p style={{ color: '#555', lineHeight: 1.5 }}>
                        Курсы разработаны для учащихся 5-11 классов.
                    </p>
                </div>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '30px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
                    <h3 style={{ marginBottom: '15px' }}>Уникальная технология</h3>
                    <p style={{ color: '#555', lineHeight: 1.5 }}>
                        Платформа использует SymPy для проверки решений уравнений и генерации уникальных вариантов задач.
                    </p>
                </div>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '30px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>📈</div>
                    <h3 style={{ marginBottom: '15px' }}>Результаты</h3>
                    <p style={{ color: '#555', lineHeight: 1.5 }}>
                        Более 5000 учеников уже подготовились к экзаменам и успешно сдали ЕГЭ и ОГЭ.
                    </p>
                </div>
            </div>

            {/* Ценности */}
            <div style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#1a1a2e' }}>
                    Наши ценности
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
                        <h3 style={{ marginBottom: '10px' }}>Качество</h3>
                        <p>Все задания соответствуют актуальным требованиям ЕГЭ и ОГЭ</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
                        <h3 style={{ marginBottom: '10px' }}>Инновации</h3>
                        <p>Используем SymPy для проверки решений и генерации задач</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>💚</div>
                        <h3 style={{ marginBottom: '10px' }}>Доступность</h3>
                        <p>Бесплатный доступ к материалам курса</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
                        <h3 style={{ marginBottom: '10px' }}>Поддержка</h3>
                        <p>Всегда готовы помочь с вопросами и трудностями</p>
                    </div>
                </div>
            </div>

            {/* Контакты */}
            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '24px',
                padding: '40px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#1a1a2e' }}>Свяжитесь с нами</h2>
                <p style={{ marginBottom: '30px', color: '#666' }}>Есть вопросы? Мы всегда рады помочь!</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>📧</div>
                        <div style={{ fontWeight: 'bold' }}>Email</div>
                        <div style={{ color: '#666' }}>support@mathcourse.ru</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>📱</div>
                        <div style={{ fontWeight: 'bold' }}>Телеграм</div>
                        <div style={{ color: '#666' }}>@mathcourse_support</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏰</div>
                        <div style={{ fontWeight: 'bold' }}>Часы работы</div>
                        <div style={{ color: '#666' }}>Пн-Пт: 10:00 - 19:00</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;