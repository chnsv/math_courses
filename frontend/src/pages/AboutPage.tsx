import React from 'react';

const AboutPage: React.FC = () => {
    const team = [
        { name: 'Екатерина Смирнова', role: 'Основатель курса, преподаватель математики', experience: 'Опыт 15 лет', avatar: '👩‍🏫', bio: 'Автор методики подготовки к ЕГЭ, эксперт по проверке экзаменационных работ.' },
        { name: 'Алексей Иванов', role: 'Технический директор', experience: 'Full-stack разработчик, 10 лет опыта', avatar: '👨‍💻', bio: 'Создатель платформы, внедрил проверку уравнений через SymPy.' },
        { name: 'Мария Петрова', role: 'Методолог курса', experience: 'Кандидат педагогических наук', avatar: '👩‍🔬', bio: 'Разрабатывает задания и контролирует качество контента.' },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Hero секция */}
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
                    MathCourse — это онлайн-платформа, которая помогает школьникам подготовиться к ОГЭ и ЕГЭ по математике
                </p>
            </div>

            {/* Миссия */}
            <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#1a1a2e' }}>Наша миссия</h2>
                <p style={{ fontSize: '18px', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto', color: '#555' }}>
                    Сделать качественную подготовку к экзаменам доступной для каждого школьника, независимо от его местоположения и финансовых возможностей.
                </p>
            </div>

            {/* Наши ценности */}
            <div style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#1a1a2e' }}>Наши ценности</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
                        <h3 style={{ marginBottom: '10px' }}>Качество</h3>
                        <p>Все задания соответствуют актуальным требованиям ЕГЭ и ОГЭ</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
                        <h3 style={{ marginBottom: '10px' }}>Инновации</h3>
                        <p>Используем ИИ для проверки решений и генерации задач</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>💚</div>
                        <h3 style={{ marginBottom: '10px' }}>Доступность</h3>
                        <p>Бесплатный доступ к основным материалам курса</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
                        <h3 style={{ marginBottom: '10px' }}>Поддержка</h3>
                        <p>Всегда готовы помочь с вопросами и трудностями</p>
                    </div>
                </div>
            </div>

            {/* Команда */}
            <div style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#1a1a2e' }}>Наша команда</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {team.map((member, idx) => (
                        <div key={idx} style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '15px' }}>{member.avatar}</div>
                            <h3 style={{ marginBottom: '5px' }}>{member.name}</h3>
                            <div style={{ color: '#e94560', marginBottom: '10px' }}>{member.role}</div>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>{member.experience}</div>
                            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.5 }}>{member.bio}</p>
                        </div>
                    ))}
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