import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const Algebra7_8Page: React.FC = () => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [xValue, setXValue] = useState(0);
    const [demoEquation, setDemoEquation] = useState({ text: '2x + 5 = 13', answer: 4 });
    const [userAnswer, setUserAnswer] = useState('');
    const [equationMessage, setEquationMessage] = useState('');
    const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);

    const generateEquation = () => {
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 20) + 10;
        setDemoEquation({ text: `${a}x + ${b} = ${c}`, answer: (c - b) / a });
        setUserAnswer('');
        setEquationMessage('');
    };

    const checkEquation = () => {
        const numAnswer = parseFloat(userAnswer);
        if (!isNaN(numAnswer) && Math.abs(numAnswer - demoEquation.answer) < 0.01) setEquationMessage('✓ Правильно!');
        else if (userAnswer) setEquationMessage('✗ Неверно. Попробуйте ещё раз!');
    };

    const topics = [
        { name: 'Выражения и тождества', icon: '📝', example: '3a + 5b - a + 2b = 2a + 7b', color: '#FF6B6B' },
        { name: 'Линейные уравнения', icon: '✖️', example: '2x + 5 = 13 → x = 4', color: '#4ECDC4' },
        { name: 'Функции', icon: '📈', example: 'y = 2x + 3', color: '#45B7D1' },
        { name: 'Степени', icon: '🔋', example: '2³ = 8', color: '#96CEB4' },
        { name: 'Формулы сокращённого умножения', icon: '⚡', example: '(a+b)² = a² + 2ab + b²', color: '#FFEAA7' },
    ];

    const handleStartLearning = () => !user ? setShowAuthModal(true) : window.location.href = '/topics?level=7-8-algebra';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '48px' }}>📐 Алгебра 7-8 класс</h1>
                <p>Алгебра — это язык, на котором говорит математика</p>
            </div>

            {/* Живой график */}
            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#f0f7ff', borderRadius: '24px' }}>
                <h2 style={{ textAlign: 'center' }}>📈 Живой график функции y = 2x² + 3x - 5</h2>
                <label style={{ display: 'block', textAlign: 'center', marginBottom: '20px' }}>x = <input type="range" min="-5" max="5" step="0.5" value={xValue} onChange={(e) => setXValue(parseFloat(e.target.value))} /></label>
                <div style={{ textAlign: 'center', fontSize: '18px' }}>Значение функции: y = {2 * xValue * xValue + 3 * xValue - 5}</div>
                <div style={{ marginTop: '20px', textAlign: 'center' }}><svg width="400" height="200" viewBox="0 0 400 200"><line x1="0" y1="100" x2="400" y2="100" stroke="gray" strokeWidth="1" /><line x1="200" y1="0" x2="200" y2="200" stroke="gray" strokeWidth="1" /><circle cx={200 + xValue * 30} cy={100 - (2 * xValue * xValue + 3 * xValue - 5) * 2} r="6" fill="#e94560" /></svg></div>
            </div>

            {/* Генератор уравнений */}
            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '24px', textAlign: 'center' }}>
                <h2>✖️ Генератор уравнений</h2>
                <div style={{ fontSize: '28px', margin: '20px 0', fontWeight: 'bold' }}>{demoEquation.text}</div>
                <input type="number" placeholder="x = ?" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '150px', marginRight: '10px' }} />
                <button onClick={checkEquation} style={{ padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Проверить</button>
                <button onClick={generateEquation} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Новое уравнение</button>
                {equationMessage && <div style={{ marginTop: '15px', fontSize: '16px' }}>{equationMessage}</div>}
            </div>

            {/* Темы курса с примерами — интерактивные карточки */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ textAlign: 'center' }}>📖 Темы курса с примерами</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {topics.map((topic, idx) => (
                        <div key={idx} onMouseEnter={() => setHoveredTopic(idx)} onMouseLeave={() => setHoveredTopic(null)} style={{ backgroundColor: hoveredTopic === idx ? topic.color : 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s', cursor: 'pointer', transform: hoveredTopic === idx ? 'scale(1.02)' : 'scale(1)' }}>
                            <div style={{ fontSize: '48px' }}>{topic.icon}</div>
                            <h3 style={{ margin: '10px 0' }}>{topic.name}</h3>
                            <p style={{ fontFamily: 'monospace', fontSize: '14px', color: hoveredTopic === idx ? 'white' : '#e94560' }}>{topic.example}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Почему алгебра важна */}
            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#e8f5e9', borderRadius: '24px' }}>
                <h2 style={{ textAlign: 'center' }}>💡 Почему алгебра важна?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    <div><strong>💰 Финансы</strong><br />Расчёт процентов по вкладам</div>
                    <div><strong>📱 IT и программирование</strong><br />Алгоритмы — основа кода</div>
                    <div><strong>🏗️ Строительство</strong><br />Расчёт материалов</div>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}><button onClick={handleStartLearning} style={{ backgroundColor: '#e94560', color: 'white', padding: '14px 40px', fontSize: '18px', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>Начать обучение →</button></div>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};
export default Algebra7_8Page;