import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const questionsByGrade: Record<string, any[]> = {
    '5-6': [
        { text: 'Решите пример: 25 + 37 × 2', answer: 99, check: (ans: number) => ans === 99, type: 'number' },
        { text: 'Найдите 30% от числа 150', answer: 45, check: (ans: number) => ans === 45, type: 'number' },
        { text: 'Решите уравнение: x + 15 = 42', answer: 27, check: (ans: number) => ans === 27, type: 'number' },
        { text: 'Найдите периметр квадрата со стороной 8 см', answer: 32, check: (ans: number) => ans === 32, type: 'number' },
        { text: 'Вычислите: 12 × 8 - 5', answer: 91, check: (ans: number) => ans === 91, type: 'number' },
        { text: 'Найдите значение: 3³', answer: 27, check: (ans: number) => ans === 27, type: 'number' },
        { text: 'Решите: 45 ÷ 9 + 7', answer: 12, check: (ans: number) => ans === 12, type: 'number' },
        { text: 'Сколько минут в 3 часах?', answer: 180, check: (ans: number) => ans === 180, type: 'number' },
        { text: 'Упростите: 5a + 3b - 2a - b', answer: '3a + 2b', check: (ans: string) => ans.replace(/\s/g, '') === '3a+2b', type: 'string' },
        { text: 'Найдите площадь прямоугольника со сторонами 6 см и 4 см', answer: 24, check: (ans: number) => ans === 24, type: 'number' },
    ],
    '7-8': [
        { text: 'Решите уравнение: 2x + 5 = 13', answer: 4, check: (ans: number) => ans === 4, type: 'number' },
        { text: 'Упростите: 3a + 5b - a + 2b', answer: '2a + 7b', check: (ans: string) => ans.replace(/\s/g, '') === '2a+7b', type: 'string' },
        { text: 'Вычислите: (-3)²', answer: 9, check: (ans: number) => ans === 9, type: 'number' },
        { text: 'Решите систему: x + y = 5, x - y = 1', answer: 'x=3,y=2', check: (ans: string) => ans.replace(/\s/g, '') === 'x=3,y=2', type: 'string' },
        { text: 'Найдите значение: 2³ × 2⁴', answer: 128, check: (ans: number) => ans === 128, type: 'number' },
        { text: 'Решите неравенство: 3x - 5 > 10', answer: 6, check: (ans: number) => ans > 6, type: 'number' },
        { text: 'Найдите корень: √64', answer: 8, check: (ans: number) => ans === 8, type: 'number' },
        { text: 'Упростите: (a + b)² - (a - b)²', answer: '4ab', check: (ans: string) => ans.replace(/\s/g, '') === '4ab', type: 'string' },
        { text: 'Решите: x² - 5x + 6 = 0', answer: '2,3', check: (ans: string) => { const a = ans.split(',').map(Number).sort(); return a[0] === 2 && a[1] === 3; }, type: 'string' },
        { text: 'Вычислите: 15% от 200', answer: 30, check: (ans: number) => ans === 30, type: 'number' },
    ],
    '9': [
        { text: 'Решите квадратное уравнение: 2x² - 5x + 2 = 0', answer: '0.5, 2', check: (ans: string) => {
            const normalized = ans.replace(/,/g, ' ').replace(/;/g, ' ').replace(/\s+/g, ' ').trim();
            const values = normalized.split(' ').map(v => {
                if (v.includes('/')) { const [num, den] = v.split('/'); return parseFloat(num) / parseFloat(den); }
                return parseFloat(v.replace(',', '.'));
            }).sort((a, b) => a - b);
            return Math.abs(values[0] - 0.5) < 0.01 && Math.abs(values[1] - 2) < 0.01;
        }, type: 'string' },
        { text: 'Найдите корень уравнения: √(x + 3) = 4', answer: 13, check: (ans: number) => ans === 13, type: 'number' },
        { text: 'Решите неравенство: x + 5 > 10', answer: 6, check: (ans: number) => ans > 6, type: 'number' },
        { text: 'Найдите площадь треугольника со сторонами 3, 4, 5', answer: 6, check: (ans: number) => ans === 6, type: 'number' },
        { text: 'Упростите выражение: (a + b)² - (a - b)²', answer: '4ab', check: (ans: string) => ans.replace(/\s/g, '') === '4ab', type: 'string' },
        { text: 'Решите уравнение: 3x² - 12 = 0', answer: '-2,2', check: (ans: string) => { const a = ans.split(',').map(Number).sort(); return a[0] === -2 && a[1] === 2; }, type: 'string' },
        { text: 'Найдите значение: sin 30°', answer: 0.5, check: (ans: number) => Math.abs(ans - 0.5) < 0.1, type: 'number' },
        { text: 'Решите: 2^(x) = 16', answer: 4, check: (ans: number) => ans === 4, type: 'number' },
        { text: 'Найдите модуль числа -7', answer: 7, check: (ans: number) => ans === 7, type: 'number' },
        { text: 'Вычислите: log₂ 8', answer: 3, check: (ans: number) => ans === 3, type: 'number' },
    ],
    '10-11': [
        { text: 'Найдите производную: f(x) = 3x² + 2x - 5', answer: '6x + 2', check: (ans: string) => ans.replace(/\s/g, '') === '6x+2', type: 'string' },
        { text: 'Решите уравнение: log₂(x) + log₂(x - 2) = 3', answer: 4, check: (ans: number) => ans === 4, type: 'number' },
        { text: 'Найдите предел: lim(x→0) sin x / x', answer: 1, check: (ans: number) => ans === 1, type: 'number' },
        { text: 'Вычислите интеграл: ∫(2x) dx от 0 до 3', answer: 9, check: (ans: number) => ans === 9, type: 'number' },
        { text: 'Решите показательное уравнение: 2^(x) = 32', answer: 5, check: (ans: number) => ans === 5, type: 'number' },
        { text: 'Найдите точку экстремума: f(x) = x³ - 3x', answer: '-1,1', check: (ans: string) => { const a = ans.split(',').map(Number).sort(); return a[0] === -1 && a[1] === 1; }, type: 'string' },
        { text: 'Решите: sin x = 0.5 на [0, π]', answer: '30°,150°', check: (ans: string) => ans.includes('30') && ans.includes('150'), type: 'string' },
        { text: 'Найдите: arctan(1)', answer: 45, check: (ans: number) => ans === 45, type: 'number' },
        { text: 'Вычислите: e^0', answer: 1, check: (ans: number) => ans === 1, type: 'number' },
        { text: 'Решите: 5^(x+1) = 125', answer: 2, check: (ans: number) => ans === 2, type: 'number' },
    ],
};

const HomePage: React.FC = () => {
    const [selectedGrade, setSelectedGrade] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [incorrectDetails, setIncorrectDetails] = useState<any[]>([]);
    const [userAnswer, setUserAnswer] = useState('');

    const startTest = () => setTestStarted(true);
    const closeTest = () => {
        setTestStarted(false);
        setSelectedGrade('');
        setQuestions([]);
        setCurrentIndex(0);
        setTestCompleted(false);
    };

    const generateTest = (grade: string) => {
        const pool = questionsByGrade[grade];
        if (!pool) return;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const newQuestions = shuffled.slice(0, 10).map((q, idx) => ({
            id: Date.now() + idx,
            text: q.text,
            answer: q.answer,
            check: q.check,
            type: q.type,
            userAnswer: '',
            isCorrect: null,
        }));
        setQuestions(newQuestions);
        setSelectedGrade(grade);
        setCurrentIndex(0);
        setTestCompleted(false);
        setRecommendations([]);
        setIncorrectDetails([]);
        setUserAnswer('');
    };

    const handleAnswer = () => {
        if (userAnswer.trim() === '') return;

        const currentQ = questions[currentIndex];
        let isCorrect = false;

        if (currentQ.type === 'number') {
            const numAnswer = parseFloat(userAnswer.replace(',', '.'));
            isCorrect = currentQ.check(numAnswer);
        } else {
            isCorrect = currentQ.check(userAnswer);
        }

        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex].userAnswer = userAnswer;
        updatedQuestions[currentIndex].isCorrect = isCorrect;
        setQuestions(updatedQuestions);

        if (!isCorrect) {
            setIncorrectDetails(prev => [...prev, { text: currentQ.text, answer: currentQ.answer }]);
        }

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
            setUserAnswer('');
        } else {
            finishTest(updatedQuestions);
        }
    };

    const finishTest = (finalQuestions: any[]) => {
        const correctCount = finalQuestions.filter((q: any) => q.isCorrect === true).length;
        const percent = (correctCount / finalQuestions.length) * 100;

        const newRecommendations: string[] = [];

        if (percent >= 80) {
            newRecommendations.push('Отличный результат! Вы готовы к следующему уровню.');
            if (selectedGrade === '9') newRecommendations.push('Рекомендуем курс "Подготовка к ОГЭ" для закрепления.');
            else if (selectedGrade === '10-11') newRecommendations.push('Рекомендуем курс "Подготовка к ЕГЭ (профиль)".');
        } else if (percent >= 50) {
            newRecommendations.push('Хороший результат! Есть темы, которые стоит подтянуть.');
            if (selectedGrade === '5-6') newRecommendations.push('Рекомендуем курс "Математика 5-6 класс".');
            else if (selectedGrade === '7-8') newRecommendations.push('Рекомендуем курс "Алгебра 7-8 класс".');
        } else {
            newRecommendations.push('Рекомендуем начать с курса соответствующего уровня и повторить теорию.');
        }

        if (incorrectDetails.length > 3) {
            newRecommendations.push('Рекомендуем больше практики и регулярное повторение материала.');
        }

        setRecommendations(newRecommendations);
        setTestCompleted(true);
        setTestStarted(false);
    };

    const resetTest = () => {
        setTestCompleted(false);
        setQuestions([]);
        setCurrentIndex(0);
        setRecommendations([]);
        setSelectedGrade('');
        setIncorrectDetails([]);
        setUserAnswer('');
    };

    return (
        <div>
            {/* Блок тестирования */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center',
                padding: '80px 20px',
            }}>
                <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
                    Не можете определиться с выбором курса?
                </h2>
                <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
                    Пройдите тестирование, и мы подберём курс специально для вас
                </p>
                {!testStarted && !testCompleted && (
                    <button
                        onClick={startTest}
                        style={{
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            padding: '14px 40px',
                            fontSize: '18px',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                        }}
                    >
                        Начать тестирование →
                    </button>
                )}
            </div>

            {/* Выбор класса с крестиком */}
            {testStarted && !selectedGrade && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '40px',
                        maxWidth: '500px',
                        width: '90%',
                        position: 'relative',
                    }}>
                        <button
                            onClick={closeTest}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '20px',
                                background: 'none',
                                border: 'none',
                                fontSize: '28px',
                                cursor: 'pointer',
                                color: '#999'
                            }}
                        >
                            ✕
                        </button>
                        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Выберите ваш класс</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { value: '5-6', label: '5-6 класс' },
                                { value: '7-8', label: '7-8 класс' },
                                { value: '9', label: '9 класс (ОГЭ)' },
                                { value: '10-11', label: '10-11 класс (ЕГЭ)' },
                            ].map(grade => (
                                <button
                                    key={grade.value}
                                    onClick={() => generateTest(grade.value)}
                                    style={{
                                        padding: '14px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {grade.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Процесс тестирования */}
            {testStarted && selectedGrade && questions.length > 0 && currentIndex < questions.length && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '40px',
                        maxWidth: '600px',
                        width: '90%',
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>Вопрос {currentIndex + 1} из {questions.length}</span>
                                <span style={{ fontSize: '14px', color: '#666' }}>
                                    Правильных: {questions.filter((q: any) => q.isCorrect === true).length}
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                                    height: '100%',
                                    backgroundColor: '#667eea',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        </div>
                        <h3 style={{ marginBottom: '30px', fontSize: '20px', lineHeight: 1.5 }}>{questions[currentIndex].text}</h3>
                        <input
                            type="text"
                            placeholder="Введите ответ"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAnswer()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}
                            autoFocus
                        />
                        <button
                            onClick={handleAnswer}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Ответить
                        </button>
                    </div>
                </div>
            )}

            {/* Результаты тестирования */}
            {testCompleted && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '40px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
                            Результаты тестирования
                            <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>
                                ({questions.filter(q => q.isCorrect === true).length} / {questions.length})
                            </span>
                        </h2>

                        <div style={{ marginBottom: '20px', maxHeight: '300px', overflow: 'auto' }}>
                            {questions.map((q, idx) => (
                                <div key={q.id} style={{
                                    padding: '10px',
                                    marginBottom: '8px',
                                    backgroundColor: q.isCorrect ? '#d4edda' : '#f8d7da',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}>
                                    <div>
                                        {idx + 1}. {q.text}
                                    </div>
                                    {!q.isCorrect && (
                                        <div style={{ fontSize: '12px', marginTop: '5px', color: '#721c24' }}>
                                            Правильный ответ: {q.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '10px', color: '#e94560' }}>Персональные рекомендации:</h3>
                            {recommendations.map((rec, idx) => (
                                <div key={idx} style={{
                                    padding: '12px',
                                    marginBottom: '10px',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '8px'
                                }}>
                                    {rec}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={resetTest}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>Почему выбирают нас?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div><h3>Проверка уравнений</h3><p>Автоматическая проверка решений с помощью SymPy</p></div>
                    <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '48px', marginBottom: '15px' }}>🎲</div><h3>Уникальные варианты</h3><p>У каждого ученика свои задачи</p></div>
                    <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div><h3>Статистика прогресса</h3><p>Отслеживайте успехи</p></div>
                    <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div><h3>Подготовка к ЕГЭ</h3><p>Все задания актуальны</p></div>
                </div>
            </div>

            <div style={{ backgroundColor: '#f8f9fa', padding: '60px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>Часто задаваемые вопросы</h2>
                    {[
                        { q: 'Как начать обучение?', a: 'Зарегистрируйтесь, выберите тему и приступайте к решению задач.' },
                        { q: 'Сколько времени длится курс?', a: 'Курс рассчитан на индивидуальный темп.' },
                        //{ q: 'Есть ли обратная связь от преподавателя?', a: 'Да, вы можете задать вопрос в комментариях к задаче.' },
                        { q: 'Подходит ли курс для подготовки к ЕГЭ?', a: 'Да, все темы и задачи соответствуют кодификатору ЕГЭ.' },
                    ].map((item, idx) => (
                        <details key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px 24px', marginBottom: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <summary style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.q}</summary>
                            <p style={{ marginTop: '12px', color: '#555', lineHeight: 1.5 }}>{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>

            <footer style={{ backgroundColor: '#1a1a2e', color: '#aaa', textAlign: 'center', padding: '40px 20px', fontSize: '14px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {/*<Link to="/reviews" style={{ color: '#aaa', textDecoration: 'none' }}>Отзывы</Link>*/}
                        <Link to="/about" style={{ color: '#aaa', textDecoration: 'none' }}>О нас</Link>
                        <a href="#privacy" style={{ color: '#aaa', textDecoration: 'none' }}>Политика конфиденциальности</a>
                        <a href="#contacts" style={{ color: '#aaa', textDecoration: 'none' }}>Контакты</a>
                    </div>
                    <p>© 2026 Подготовительные курсы по математике. Все права защищены.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;