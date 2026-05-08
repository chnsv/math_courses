import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

interface Question {
    id: number;
    text: string;
    answer: string;
    userAnswer: string;
    isCorrect: boolean | null;
    type: 'number' | 'string';
    check: (ans: string) => boolean;
}

// Функции для нормализации ответов
const normalizeAnswer = (ans: string): string => {
    return ans
        .toLowerCase()
        .replace(/\s/g, '')
        .replace(/π/g, 'pi')
        .replace(/pi/g, 'pi')
        .replace(/\+/g, '+')
        .replace(/\*/g, '*')
        .replace(/e\^x/g, 'e^x');
};

// Проверка эквивалентности выражений (упрощённая)
const areEquivalent = (user: string, correct: string): boolean => {
    const normUser = normalizeAnswer(user);
    const normCorrect = normalizeAnswer(correct);

    // Прямое сравнение
    if (normUser === normCorrect) return true;

    // Проверка для производной e^x sin x
    if (normCorrect === 'e^x(sinx+cosx)') {
        const variants = [
            'e^xsinx+e^xcosx',
            'e^x(sinx+cosx)',
            'e^x*sinx+e^x*cosx',
            'e^x(sinx+cosx)',
            '(e^x)(sinx+cosx)'
        ];
        if (variants.some(v => normUser === v)) return true;
    }

    // Проверка для уравнения cos x = -1
    if (normCorrect === 'pi') {
        const variants = [
            'pi', 'π', '180°', '180', 'pi+2pik', 'π+2πk',
            'pi+2pi*k', 'π+2πk', '180+360k', 'pi+2pik'
        ];
        if (variants.some(v => normUser === v)) return true;
    }

    // Проверка для ответов с pi (тригонометрия)
    if (normCorrect.includes('pi') && normUser.includes('pi')) {
        // Упрощаем оба выражения
        const simplifyPi = (s: string) => s.replace(/pi/gi, 'π').replace(/\*/g, '');
        if (simplifyPi(normUser) === simplifyPi(normCorrect)) return true;
    }

    return false;
};

// Реальные варианты заданий для ЕГЭ (базовый уровень)
const baseVariants: Record<string, Question[]> = {
    base: [
        { id: 1, text: 'Решите уравнение: √(x + 5) = 7', answer: '44', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 44) < 0.01 },
        { id: 2, text: 'Найдите значение: 5!', answer: '120', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 120) < 0.01 },
        { id: 3, text: 'Решите неравенство: 3x - 7 > 11', answer: '6', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => parseFloat(ans) > 6 },
        { id: 4, text: 'Найдите значение: log₂ 16', answer: '4', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 4) < 0.01 },
        { id: 5, text: 'Вычислите: 3² × 3³', answer: '243', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 243) < 0.01 },
        { id: 6, text: 'Найдите корень: √121', answer: '11', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 11) < 0.01 },
        { id: 7, text: 'Решите: 2^x = 32', answer: '5', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 5) < 0.01 },
        { id: 8, text: 'Найдите значение: sin 90°', answer: '1', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 1) < 0.01 },
        { id: 9, text: 'Вычислите: log₅ 125', answer: '3', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 3) < 0.01 },
        { id: 10, text: 'Найдите значение выражения: 7! / 5!', answer: '42', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 42) < 0.01 },
    ],
    profile1: [
        { id: 1, text: 'Найдите производную: f(x) = 3x⁴ + 2x³ - x', answer: '12x³ + 6x² - 1', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => areEquivalent(ans, '12x³+6x²-1') },
        { id: 2, text: 'Решите уравнение: log₂(x) + log₂(x - 2) = 3', answer: '4', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 4) < 0.01 },
        { id: 3, text: 'Найдите предел: lim(x→0) sin x / x', answer: '1', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 1) < 0.01 },
        { id: 4, text: 'Вычислите интеграл: ∫(2x) dx от 0 до 3', answer: '9', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 9) < 0.01 },
        { id: 5, text: 'Найдите точку экстремума: f(x) = x³ - 3x', answer: '-1,1', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => { const vals = ans.split(',').map(Number).sort(); return vals[0] === -1 && vals[1] === 1; } },
        { id: 6, text: 'Решите уравнение: sin x = 0.5 на [0, π]', answer: '30°,150°', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => ans.includes('30') && ans.includes('150') },
        { id: 7, text: 'Найдите: arctan(1)', answer: '45', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 45) < 0.01 || ans === 'π/4' || ans === 'pi/4' },
        { id: 8, text: 'Вычислите: e^0', answer: '1', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 1) < 0.01 },
        { id: 9, text: 'Решите: 5^(x+1) = 125', answer: '2', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 2) < 0.01 },
        { id: 10, text: 'Найдите значение: ∫(1/x) dx от 1 до e', answer: '1', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 1) < 0.01 },
    ],
    profile2: [
        { id: 1, text: 'Найдите производную: f(x) = e^x sin x', answer: 'e^x(sin x + cos x)', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => areEquivalent(ans, 'e^x(sinx+cosx)') },
        { id: 2, text: 'Решите уравнение: 2^(x+1) = 16', answer: '3', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 3) < 0.01 },
        { id: 3, text: 'Найдите предел: lim(x→∞) (1 + 1/x)^x', answer: 'e', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => ans.toLowerCase() === 'e' },
        { id: 4, text: 'Вычислите: ∫ sin x dx от 0 до π', answer: '2', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 2) < 0.01 },
        { id: 5, text: 'Найдите точку минимума: f(x) = x² + 4x + 3', answer: '-2', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) + 2) < 0.01 },
        { id: 6, text: 'Решите уравнение: cos x = -1', answer: 'π', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => areEquivalent(ans, 'pi') },
        { id: 7, text: 'Найдите: log₃ 81', answer: '4', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 4) < 0.01 },
        { id: 8, text: 'Вычислите: (2 + i)(2 - i)', answer: '5', userAnswer: '', isCorrect: null, type: 'number', check: (ans) => Math.abs(parseFloat(ans) - 5) < 0.01 },
        { id: 9, text: 'Решите уравнение: |x - 3| = 5', answer: '-2,8', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => { const vals = ans.split(',').map(Number).sort(); return vals[0] === -2 && vals[1] === 8; } },
        { id: 10, text: 'Найдите площадь фигуры под графиком y = x² от 0 до 2', answer: '8/3', userAnswer: '', isCorrect: null, type: 'string', check: (ans) => Math.abs(parseFloat(ans) - 2.666) < 0.01 || parseFloat(ans) === 8/3 },
    ],
};

const TrialEGEPage: React.FC = () => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [testStarted, setTestStarted] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(180 * 60);
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

    const startVariant = (variantType: string) => {
        let variantQuestions: Question[];
        let time = 180 * 60;

        if (variantType === 'base') {
            variantQuestions = baseVariants.base.map(q => ({ ...q, userAnswer: '', isCorrect: null }));
            time = 180 * 60;
        } else if (variantType === 'profile1') {
            variantQuestions = baseVariants.profile1.map(q => ({ ...q, userAnswer: '', isCorrect: null }));
            time = 235 * 60;
        } else {
            variantQuestions = baseVariants.profile2.map(q => ({ ...q, userAnswer: '', isCorrect: null }));
            time = 235 * 60;
        }

        setQuestions(variantQuestions);
        setSelectedVariant(variantType);
        setTestStarted(true);
        setCurrentIndex(0);
        setTimeLeft(time);
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
        return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const correctCount = questions.filter(q => q.isCorrect === true).length;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '24px',
                padding: '60px 40px',
                textAlign: 'center',
                color: '#1a1a2e',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>📝 Пробники ЕГЭ</h1>
                <p style={{ fontSize: '20px', maxWidth: '700px', margin: '0 auto', opacity: 0.9 }}>
                    Профильная и базовая математика — решайте варианты как на реальном экзамене
                </p>
            </div>

            {!testStarted && !testCompleted && (
                <>
                    <div style={{ marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>📖 Что это такое</h2>
                        <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#555', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                            Пробные варианты ЕГЭ с автоматической проверкой и разбором.
                            Доступны как базовый, так и профильный уровень. Каждый вариант включает все типы заданий,
                            которые встречаются на настоящем ЕГЭ.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '50px', justifyContent: 'center' }}>
                        <div style={{ flex: 1, minWidth: '250px', backgroundColor: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📘</div>
                            <h3 style={{ color: '#e94560', marginBottom: '10px' }}>Базовая математика</h3>
                            <p style={{ color: '#666' }}>Варианты для сдачи базового уровня ЕГЭ</p>
                            <button onClick={() => startVariant('base')} style={{
                                marginTop: '20px',
                                padding: '10px 30px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '25px',
                                cursor: 'pointer'
                            }}>
                                Выбрать
                            </button>
                        </div>
                        <div style={{ flex: 1, minWidth: '250px', backgroundColor: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📗</div>
                            <h3 style={{ color: '#e94560', marginBottom: '10px' }}>Профильная математика</h3>
                            <p style={{ color: '#666' }}>Варианты для сдачи профильного уровня ЕГЭ</p>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                                <button onClick={() => startVariant('profile1')} style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#e94560',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '25px',
                                    cursor: 'pointer'
                                }}>
                                    Вариант 1
                                </button>
                                <button onClick={() => startVariant('profile2')} style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#e94560',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '25px',
                                    cursor: 'pointer'
                                }}>
                                    Вариант 2
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>✨ Наши преимущества</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px' }}>
                                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎯</div>
                                <strong>Реалистичные варианты</strong>
                                <p style={{ color: '#666', marginTop: '10px' }}>Только актуальные задания из открытого банка ФИПИ</p>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px' }}>
                                <div style={{ fontSize: '36px', marginBottom: '10px' }}>⏱️</div>
                                <strong>Экзаменационный режим</strong>
                                <p style={{ color: '#666', marginTop: '10px' }}>Таймер, правила, условия как на ЕГЭ</p>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px' }}>
                                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📈</div>
                                <strong>Разбор ошибок</strong>
                                <p style={{ color: '#666', marginTop: '10px' }}>Подробный разбор каждого задания</p>
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
                        {selectedVariant === 'base' && <div style={{ fontSize: '24px', marginBottom: '20px' }}>Оценка: {correctCount <= 2 ? '2' : correctCount <= 3 ? '3' : correctCount <= 4 ? '4' : '5'}</div>}
                        {selectedVariant !== 'base' && <div style={{ fontSize: '24px', marginBottom: '20px' }}>Первичный балл: {correctCount}</div>}
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

export default TrialEGEPage;