import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const Math5_6Page: React.FC = () => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [draggedNumber, setDraggedNumber] = useState<number | null>(null);
    const [droppedNumbers, setDroppedNumbers] = useState<number[]>([]);
    const [gameMessage, setGameMessage] = useState('');
    const [visibleAnswers, setVisibleAnswers] = useState<{ [key: number]: boolean }>({});

    const numbers = [3, 7, 2, 9];
    const targetNumber = 12;

    const handleDragStart = (num: number) => setDraggedNumber(num);

    const handleDrop = () => {
        if (draggedNumber === null) return;

        const newDropped = [...droppedNumbers, draggedNumber];
        setDroppedNumbers(newDropped);

        const sum = newDropped.reduce((a, b) => a + b, 0);
        if (sum === targetNumber) {
            setGameMessage('Поздравляем! Вы собрали число 12!');
        } else if (sum < targetNumber && newDropped.length < 3) {
            setGameMessage(`Сумма: ${sum}. Нужно ещё число!`);
        } else {
            setGameMessage(`Сумма: ${sum}. Не получилось собрать ${targetNumber}. Попробуйте ещё раз!`);
        }

        setDraggedNumber(null);
    };

    const resetGame = () => {
        setDroppedNumbers([]);
        setGameMessage('');
    };

    const toggleAnswer = (idx: number) => setVisibleAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));

    const sampleTasks = [
        { text: 'Решите пример: 25 + 37 × 2', answer: '99' },
        { text: 'Найдите 30% от числа 150', answer: '45' },
        { text: 'Решите уравнение: x + 15 = 42', answer: '27' },
        { text: 'Найдите периметр квадрата со стороной 8 см', answer: '32 см' },
    ];

    const topics = [
        { name: 'Натуральные числа', icon: '🔢', desc: 'Сложение, вычитание, умножение, деление' },
        { name: 'Дроби', icon: '🥧', desc: 'Обыкновенные и десятичные дроби' },
        { name: 'Проценты', icon: '💯', desc: 'Нахождение процента от числа' },
        { name: 'Уравнения', icon: '✖️', desc: 'Решение простых линейных уравнений' },
    ];

    const handleStartLearning = () => !user ? setShowAuthModal(true) : window.location.href = '/topics?level=5-6';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '48px' }}>📚 Математика 5-6 класс</h1>
                <p>Фундамент, на котором строится вся школьная математика</p>
            </div>

            {/* Игра «Собери число» */}
            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#f0f7ff', borderRadius: '24px', textAlign: 'center' }}>
                <h2>🎮 Игра «Собери число {targetNumber}»</h2>
                <p>Перетащите числа в квадрат, чтобы получить сумму {targetNumber}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0', flexWrap: 'wrap' }}>
                    {numbers.map(num => (
                        <div
                            key={num}
                            draggable={!droppedNumbers.includes(num)}
                            onDragStart={() => !droppedNumbers.includes(num) && handleDragStart(num)}
                            style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: droppedNumbers.includes(num) ? '#ccc' : '#4CAF50',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: 'white',
                                cursor: droppedNumbers.includes(num) ? 'not-allowed' : 'grab',
                                opacity: droppedNumbers.includes(num) ? 0.5 : 1
                            }}
                        >
                            {num}
                        </div>
                    ))}
                </div>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                        width: '120px',
                        height: '100px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        gap: '10px'
                    }}
                >
                    <div>Сумма:</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{droppedNumbers.reduce((a, b) => a + b, 0)}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>Перетащите сюда</div>
                </div>
                <button onClick={resetGame} style={{ marginTop: '20px', padding: '8px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Сбросить игру</button>
                {gameMessage && <div style={{ marginTop: '15px', fontSize: '16px' }}>{gameMessage}</div>}
            </div>

            {/* Остальные блоки */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ textAlign: 'center' }}>📖 Что изучается на курсе</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {topics.map((t, i) => <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}><div style={{ fontSize: '40px' }}>{t.icon}</div><h3>{t.name}</h3><p style={{ color: '#666' }}>{t.desc}</p></div>)}
                </div>
            </div>

            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '24px' }}>
                <h2 style={{ textAlign: 'center' }}>🎯 Примеры заданий</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {sampleTasks.map((task, idx) => (
                        <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #e94560' }}>
                            <div style={{ fontSize: '18px', marginBottom: '10px' }}>{task.text}</div>
                            {visibleAnswers[idx] ? <div style={{ color: '#4CAF50' }}>Ответ: {task.answer}</div> : <button onClick={() => toggleAnswer(idx)} style={{ padding: '5px 15px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Показать ответ</button>}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign: 'center' }}><button onClick={handleStartLearning} style={{ backgroundColor: '#e94560', color: 'white', padding: '14px 40px', fontSize: '18px', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>Начать обучение →</button></div>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};
export default Math5_6Page;