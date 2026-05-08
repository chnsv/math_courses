import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const OGEPage: React.FC = () => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<{ [key: string]: boolean | null }>({});

    const checkQuadraticAnswer = (ans: string): boolean => {
        const normalized = ans
            .replace(/,/g, ' ')
            .replace(/;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

        const parts = normalized.split(' ');
        const values: number[] = [];

        for (const part of parts) {
            if (part.includes('/')) {
                const [num, den] = part.split('/');
                values.push(parseFloat(num) / parseFloat(den));
            } else {
                const num = parseFloat(part.replace(',', '.'));
                if (!isNaN(num)) values.push(num);
            }
        }

        if (values.length !== 2) return false;
        values.sort((a, b) => a - b);
        return Math.abs(values[0] - 0.5) < 0.01 && Math.abs(values[1] - 2) < 0.01;
    };

    const demoQuestions = [
        {
            id: 'algebra',
            text: 'Алгебра: Решите уравнение 2x² - 5x + 2 = 0',
            answer: '0.5, 2',
            check: (ans: string) => checkQuadraticAnswer(ans)
        },
        {
            id: 'geometry',
            text: 'Геометрия: Найдите площадь треугольника со сторонами 3, 4, 5',
            answer: '6',
            check: (ans: string) => parseFloat(ans) === 6
        },
        {
            id: 'real',
            text: 'Реальная математика: В магазине скидка 20%. Сколько стоит товар за 500₽ со скидкой?',
            answer: '400',
            check: (ans: string) => parseFloat(ans) === 400
        },
    ];

    const checkAnswer = (id: string) => {
        const question = demoQuestions.find(q => q.id === id);
        if (question && answers[id]) {
            const isCorrect = question.check(answers[id]);
            setResults(prev => ({ ...prev, [id]: isCorrect }));
        } else {
            setResults(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleStartLearning = () => !user ? setShowAuthModal(true) : window.location.href = '/topics?level=oge';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '48px' }}>🎓 Подготовка к ОГЭ</h1>
                <p>Результат — «5»! Точно знаем, как устроен экзамен</p>
            </div>

            {/* Шкала оценок */}
            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '24px' }}>
                <h2 style={{ textAlign: 'center' }}>📊 Шкала перевода баллов ОГЭ</h2>
                <div style={{ display: 'flex', margin: '20px 0', height: '40px', borderRadius: '20px', overflow: 'hidden' }}>
                    <div style={{ flex: 0.2, backgroundColor: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0-7 → 2</div>
                    <div style={{ flex: 0.2, backgroundColor: '#ffa500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>8-14 → 3</div>
                    <div style={{ flex: 0.25, backgroundColor: '#ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>15-21 → 4</div>
                    <div style={{ flex: 0.35, backgroundColor: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>22-31 → 5</div>
                </div>
            </div>

            {/* Задания из ОГЭ */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ textAlign: 'center' }}>🎯 Попробуйте задания из ОГЭ</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {demoQuestions.map(q => (
                        <div key={q.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{q.text}</div>
                            <input
                                type="text"
                                placeholder="Ваш ответ"
                                value={answers[q.id] || ''}
                                onChange={(e) => {
                                    setAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
                                    setResults(prev => ({ ...prev, [q.id]: null }));
                                }}
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', marginBottom: '10px' }}
                            />
                            <button onClick={() => checkAnswer(q.id)} style={{ padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Проверить</button>
                            {results[q.id] !== null && <div style={{ marginTop: '10px', color: results[q.id] ? '#4CAF50' : '#ff6b6b' }}>{results[q.id] ? '✓ Правильно!' : '✗ Неверно'}</div>}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign: 'center' }}><button onClick={handleStartLearning} style={{ backgroundColor: '#e94560', color: 'white', padding: '14px 40px', fontSize: '18px', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>Начать подготовку →</button></div>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};
export default OGEPage;