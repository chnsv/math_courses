import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

interface Question {
    id: number;
    text: string;
    answer: number | string;
    userAnswer: string;
    isCorrect: boolean | null;
    type: 'number' | 'string';
    check: (ans: string) => boolean;
}

// Реальные варианты заданий ОГЭ (по 10 заданий на вариант)
const variantsQuestions: Record<number, Question[]> = {
    1: [
        { id: 1, text: 'Решите уравнение: 2x² - 5x + 2 = 0', answer: '0.5, 2', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => {
            const normalized = ans.replace(/,/g, ' ').replace(/;/g, ' ').replace(/\s+/g, ' ').trim();
            const values = normalized.split(' ').map(v => {
                if (v.includes('/')) { const [n, d] = v.split('/'); return parseFloat(n) / parseFloat(d); }
                return parseFloat(v);
            }).sort((a, b) => a - b);
            return values.length === 2 && Math.abs(values[0] - 0.5) < 0.01 && Math.abs(values[1] - 2) < 0.01;
        } },
        { id: 2, text: 'Найдите корень уравнения: √(x + 3) = 4', answer: 13, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 13 },
        { id: 3, text: 'Решите неравенство: x + 5 > 10', answer: 6, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) > 6 },
        { id: 4, text: 'Найдите площадь треугольника со сторонами 3, 4, 5', answer: 6, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 6 },
        { id: 5, text: 'Упростите выражение: (a + b)² - (a - b)²', answer: '4ab', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => ans.replace(/\s/g, '') === '4ab' },
        { id: 6, text: 'Решите уравнение: 3x² - 12 = 0', answer: '-2,2', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => { const vals = ans.split(',').map(Number).sort(); return vals[0] === -2 && vals[1] === 2; } },
        { id: 7, text: 'Найдите значение: sin 30°', answer: 0.5, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 0.5) < 0.01 },
        { id: 8, text: 'Решите: 2^(x) = 16', answer: 4, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 4 },
        { id: 9, text: 'Найдите модуль числа -7', answer: 7, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 7 },
        { id: 10, text: 'Вычислите: log₂ 8', answer: 3, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 3 },
    ],
    2: [
        { id: 1, text: 'Решите уравнение: x² - 7x + 12 = 0', answer: '3,4', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => { const vals = ans.split(',').map(Number).sort(); return vals[0] === 3 && vals[1] === 4; } },
        { id: 2, text: 'Найдите корень уравнения: √(2x - 1) = 5', answer: 13, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 13 },
        { id: 3, text: 'Решите неравенство: 2x - 7 < 13', answer: 10, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) < 10 },
        { id: 4, text: 'Найдите площадь прямоугольника со сторонами 8 и 6', answer: 48, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 48 },
        { id: 5, text: 'Упростите выражение: (3a - b)²', answer: '9a² - 6ab + b²', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => ans.replace(/\s/g, '') === '9a²-6ab+b²' },
        { id: 6, text: 'Решите уравнение: 4x² - 9 = 0', answer: '-1.5,1.5', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => { const vals = ans.split(',').map(Number).sort(); return Math.abs(vals[0] + 1.5) < 0.01 && Math.abs(vals[1] - 1.5) < 0.01; } },
        { id: 7, text: 'Найдите значение: cos 60°', answer: 0.5, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 0.5) < 0.01 },
        { id: 8, text: 'Решите: 3^(x) = 27', answer: 3, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 3 },
        { id: 9, text: 'Найдите расстояние от точки A(3,4) до начала координат', answer: 5, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 5 },
        { id: 10, text: 'Вычислите: log₃ 81', answer: 4, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 4 },
    ],
    3: [
        { id: 1, text: 'Решите уравнение: x² + 5x + 6 = 0', answer: '-3,-2', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => { const vals = ans.split(',').map(Number).sort(); return vals[0] === -3 && vals[1] === -2; } },
        { id: 2, text: 'Найдите корень уравнения: √(x + 8) = 6', answer: 28, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 28 },
        { id: 3, text: 'Решите неравенство: 5x - 3 ≥ 12', answer: 3, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) >= 3 },
        { id: 4, text: 'Найдите площадь круга радиусом 6', answer: 113.04, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 113.04) < 0.1 },
        { id: 5, text: 'Упростите выражение: (x + 2)(x - 3)', answer: 'x² - x - 6', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => ans.replace(/\s/g, '') === 'x²-x-6' },
        { id: 6, text: 'Решите уравнение: 5x² - 20 = 0', answer: '-2,2', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => { const vals = ans.split(',').map(Number).sort(); return vals[0] === -2 && vals[1] === 2; } },
        { id: 7, text: 'Найдите значение: tg 45°', answer: 1, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 1) < 0.01 },
        { id: 8, text: 'Решите: 4^(x) = 64', answer: 3, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 3 },
        { id: 9, text: 'Найдите координаты середины отрезка A(0,0) B(6,8)', answer: '3,4', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => { const vals = ans.split(',').map(Number); return vals[0] === 3 && vals[1] === 4; } },
        { id: 10, text: 'Вычислите: log₅ 125', answer: 3, userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) === 3 },
    ],
};

const TrialOGEPage: React.FC = () => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [testStarted, setTestStarted] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(235 * 60);
    const [testCompleted, setTestCompleted] = useState(false);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (testStarted && timeLeft > 0 && !testCompleted) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && testStarted) {
            finishTest();
        }
        return () => clearInterval(timer);
    }, [testStarted, timeLeft, testCompleted]);

    const startVariant = (variantNum: number) => {
        const variantQuestions = variantsQuestions[variantNum].map(q => ({ ...q, userAnswer: '', isCorrect: null }));
        setQuestions(variantQuestions);
        setSelectedVariant(variantNum);
        setTestStarted(true);
        setCurrentIndex(0);
        setTimeLeft(235 * 60);
        setTestCompleted(false);
        setAnswers({});
    };

    const handleAnswer = (qid: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [qid]: answer }));
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            finishTest();
        }
    };

    const finishTest = () => {
        const updatedQuestions = questions.map(q => ({
            ...q,
            userAnswer: answers[q.id] || '',
            isCorrect: answers[q.id] ? q.check(answers[q.id]!) : false
        }));
        setQuestions(updatedQuestions);
        setTestCompleted(true);
        setTestStarted(false);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const correctCount = questions.filter(q => q.isCorrect === true).length;
    const variants = [
        { number: 1, description: 'Вариант 1 — стандартный уровень сложности' },
        { number: 2, description: 'Вариант 2 — повышенный уровень сложности' },
        { number: 3, description: 'Вариант 3 — сложный уровень' },
    ];

    const handleStartLearning = () => !user ? setShowAuthModal(true) : null;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
                borderRadius: '24px',
                padding: '60px 40px',
                textAlign: 'center',
                color: 'white',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>📝 Пробники ОГЭ</h1>
                <p style={{ fontSize: '20px', maxWidth: '700px', margin: '0 auto', opacity: 0.9 }}>
                    Тренируйтесь в формате реального экзамена с автоматической проверкой
                </p>
            </div>

            {!testStarted && !testCompleted && (
                <>
                    <div style={{ marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>📖 Что это такое</h2>
                        <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#555', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                            Наши пробные тесты полностью соответствуют структуре ОГЭ.
                            Вы решаете задания в формате экзамена, а система автоматически проверяет ответы
                            и выставляет баллы. После завершения вы увидите свой результат и сможете проанализировать ошибки.
                        </p>
                    </div>

                    <div style={{ marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>🎯 Доступные варианты</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            {variants.map(v => (
                                <div key={v.number} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    padding: '25px',
                                    textAlign: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    border: selectedVariant === v.number ? '2px solid #e94560' : 'none'
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                                    <h3>Вариант {v.number}</h3>
                                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>{v.description}</p>
                                    <button onClick={() => startVariant(v.number)} style={{
                                        padding: '8px 20px',
                                        backgroundColor: '#e94560',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '20px',
                                        cursor: 'pointer'
                                    }}>
                                        Выбрать
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>✨ Преимущества</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px' }}>
                                <div style={{ fontSize: '36px', marginBottom: '10px' }}>⏱️</div>
                                <strong>Режим реального экзамена</strong>
                                <p style={{ color: '#666', marginTop: '10px' }}>Таймер и правила как на ОГЭ</p>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px' }}>
                                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🤖</div>
                                <strong>Автоматическая проверка</strong>
                                <p style={{ color: '#666', marginTop: '10px' }}>Мгновенный результат и разбор ошибок</p>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px' }}>
                                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📊</div>
                                <strong>Детальный анализ</strong>
                                <p style={{ color: '#666', marginTop: '10px' }}>Увидите свои слабые места по темам</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {testStarted && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: timeLeft < 300 ? '#e94560' : '#333' }}>⏱️ {formatTime(timeLeft)}</div>
                        <div>Вопрос {currentIndex + 1} из {questions.length}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>{questions[currentIndex]?.text}</h3>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <input type="text" placeholder="Введите ответ" value={answers[questions[currentIndex]?.id] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [questions[currentIndex]?.id]: e.target.value }))} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }} />
                            <button onClick={() => handleAnswer(questions[currentIndex]?.id, answers[questions[currentIndex]?.id] || '')} style={{ padding: '12px 30px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Ответить</button>
                        </div>
                    </div>
                </div>
            )}

            {testCompleted && (
                <div>
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', marginBottom: '30px', textAlign: 'center' }}>
                        <h2>Результаты тестирования</h2>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>{correctCount} / {questions.length}</div>
                        <div style={{ fontSize: '24px', marginBottom: '20px' }}>Оценка: {correctCount <= 7 ? '2' : correctCount <= 14 ? '3' : correctCount <= 21 ? '4' : '5'}</div>
                        <button onClick={() => { setTestCompleted(false); setSelectedVariant(null); }} style={{ padding: '12px 30px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Выбрать другой вариант</button>
                    </div>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {questions.map((q, idx) => (
                            <div key={q.id} style={{ padding: '15px', backgroundColor: q.isCorrect ? '#d4edda' : '#f8d7da', borderRadius: '12px' }}>
                                <div><strong>{idx + 1}. {q.text}</strong></div>
                                <div>Ваш ответ: {q.userAnswer || '—'}</div>
                                {!q.isCorrect && <div style={{ color: '#721c24' }}>Правильный ответ: {q.answer}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

export default TrialOGEPage;