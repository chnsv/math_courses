import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Шаблоны заданий по уровням сложности
const questionsByGrade: Record<string, any[]> = {
    '5-6': [
        { text: 'Решите пример: {a} + {b} × {c}', type: 'numeric', getAnswer: (a: number, b: number, c: number) => a + b * c },
        { text: 'Вычислите: {a} × {b} - {c}', type: 'numeric', getAnswer: (a: number, b: number, c: number) => a * b - c },
        { text: 'Найдите значение выражения: {a}² + {b}', type: 'numeric', getAnswer: (a: number, b: number) => a * a + b },
        { text: 'Решите уравнение: x + {a} = {b}', type: 'equation', getAnswer: (a: number, b: number) => b - a },
        { text: 'Найдите периметр квадрата со стороной {a}', type: 'geometry', getAnswer: (a: number) => a * 4 },
        { text: 'Вычислите площадь прямоугольника со сторонами {a} и {b}', type: 'geometry', getAnswer: (a: number, b: number) => a * b },
        { text: 'Сколько градусов в прямом угле?', type: 'theory', getAnswer: () => 90 },
    ],
    '7-8': [
        { text: 'Решите уравнение: {a}x + {b} = {c}', type: 'equation', getAnswer: (a: number, b: number, c: number) => (c - b) / a },
        { text: 'Упростите выражение: {a}x + {b} - {c}x', type: 'algebra', getAnswer: (a: number, b: number, c: number) => (a - c) },
        { text: 'Решите систему: x + y = {a}, x - y = {b}', type: 'system', getAnswer: (a: number, b: number) => (a + b) / 2 },
        { text: 'Найдите гипотенузу прямоугольного треугольника с катетами {a} и {b}', type: 'geometry', getAnswer: (a: number, b: number) => Math.sqrt(a * a + b * b) },
        { text: 'Вычислите площадь круга радиусом {a}', type: 'geometry', getAnswer: (a: number) => Math.PI * a * a },
        { text: 'Найдите значение выражения: {a}² - {b}²', type: 'algebra', getAnswer: (a: number, b: number) => a * a - b * b },
    ],
    '9': [
        { text: 'Решите квадратное уравнение: x² - {a}x + {b} = 0', type: 'quadratic', getAnswer: (a: number, b: number) => (a + Math.sqrt(a * a - 4 * b)) / 2 },
        { text: 'Найдите корень уравнения: √(x) = {a}', type: 'equation', getAnswer: (a: number) => a * a },
        { text: 'Вычислите sin({a}°)', type: 'trig', getAnswer: (a: number) => Math.sin(a * Math.PI / 180).toFixed(2) },
        { text: 'Решите неравенство: x + {a} > {b}', type: 'inequality', getAnswer: (a: number, b: number) => b - a + 1 },
        { text: 'Найдите площадь треугольника со сторонами {a}, {b}, {c} (формула Герона)', type: 'geometry', getAnswer: (a: number, b: number, c: number) => { const s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); } },
    ],
    '10-11': [
        { text: 'Найдите производную: {a}x^{b} + {c}x', type: 'calculus', getAnswer: (a: number, b: number, c: number) => a * b + c },
        { text: 'Вычислите интеграл: ∫({a}x) dx от 0 до {b}', type: 'calculus', getAnswer: (a: number, b: number) => a * b * b / 2 },
        { text: 'Решите логарифмическое уравнение: log₂(x) = {a}', type: 'equation', getAnswer: (a: number) => Math.pow(2, a) },
        { text: 'Найдите пределы функции: lim(x→{a}) (x² - {a}²)/(x - {a})', type: 'calculus', getAnswer: (a: number) => 2 * a },
        { text: 'Решите показательное уравнение: {a}^x = {b}', type: 'equation', getAnswer: (a: number, b: number) => Math.log(b) / Math.log(a) },
    ]
};

// Генерация случайного числа
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(1));

// Генерация вопроса на основе класса и типа
const generateQuestion = (grade: string, questionNumber: number) => {
    const questionsPool = questionsByGrade[grade] || questionsByGrade['7-8'];
    const template = questionsPool[Math.floor(Math.random() * questionsPool.length)];

    let params: any = {};
    let answer: any;
    let text = template.text;

    if (text.includes('{a}') && text.includes('{b}') && text.includes('{c}')) {
        const a = randomInt(2, 10);
        const b = randomInt(1, 15);
        const c = randomInt(10, 30);
        params = { a, b, c };
        answer = Number(template.getAnswer(a, b, c).toFixed(2));
    } else if (text.includes('{a}') && text.includes('{b}')) {
        let a = randomInt(2, 12);
        let b = randomInt(1, 20);
        if (grade === '10-11') {
            a = randomInt(2, 5);
            b = randomInt(2, 4);
        }
        params = { a, b };
        answer = Number(template.getAnswer(a, b).toFixed(2));
    } else if (text.includes('{a}')) {
        const a = randomInt(2, 15);
        params = { a };
        answer = Number(template.getAnswer(a).toFixed(2));
    } else {
        answer = template.getAnswer();
    }

    Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value));
    });

    return {
        id: Date.now() + Math.random() + questionNumber,
        text,
        type: template.type,
        correctAnswer: answer,
        userAnswer: '',
        isCorrect: null,
    };
};

const HomePage: React.FC = () => {
    const { user } = useAuth();
    const [selectedGrade, setSelectedGrade] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [incorrectDetails, setIncorrectDetails] = useState<{ text: string; type: string }[]>([]);

    const startTest = () => {
        setTestStarted(true);
    };

    const generateTest = (grade: string) => {
        const newQuestions = Array(20).fill(null).map((_, idx) => generateQuestion(grade, idx));
        setQuestions(newQuestions);
        setSelectedGrade(grade);
        setCurrentIndex(0);
        setTestCompleted(false);
        setRecommendations([]);
        setIncorrectDetails([]);
    };

    const handleAnswer = (answer: string) => {
        const updatedQuestions = [...questions];
        const numAnswer = parseFloat(answer);
        const isCorrect = Math.abs(numAnswer - updatedQuestions[currentIndex].correctAnswer) < 0.01;

        updatedQuestions[currentIndex].userAnswer = answer;
        updatedQuestions[currentIndex].isCorrect = isCorrect;
        setQuestions(updatedQuestions);

        if (!isCorrect) {
            setIncorrectDetails(prev => [...prev, {
                text: updatedQuestions[currentIndex].text,
                type: updatedQuestions[currentIndex].type
            }]);
        }

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            finishTest(updatedQuestions);
        }
    };

    const finishTest = (finalQuestions: any[]) => {
        const correctCount = finalQuestions.filter((q: any) => q.isCorrect === true).length;
        const percent = (correctCount / finalQuestions.length) * 100;

        // Генерация персональных рекомендаций
        const newRecommendations: string[] = [];

        // Рекомендации по результатам
        if (percent >= 85) {
            newRecommendations.push('🎉 Отличный результат! Вы готовы к экзаменам на высокий балл.');
            if (selectedGrade === '9') {
                newRecommendations.push('📚 Рекомендуем курс "Подготовка к ЕГЭ (базовый уровень)" для углублённой подготовки.');
            } else if (selectedGrade === '10-11') {
                newRecommendations.push('🎯 Рекомендуем курс "Подготовка к ЕГЭ (профильный уровень)" для достижения максимальных результатов.');
            }
        } else if (percent >= 60) {
            newRecommendations.push('📖 Хороший результат! У вас есть потенциал, нужно немного подтянуть некоторые темы.');
        } else {
            newRecommendations.push('📘 Рекомендуем начать с курса, соответствующего вашему классу, чтобы закрыть пробелы в знаниях.');
        }

        // Анализ ошибок по типам
        const wrongByType: Record<string, number> = {};
        incorrectDetails.forEach(inc => {
            wrongByType[inc.type] = (wrongByType[inc.type] || 0) + 1;
        });

        if (wrongByType['equation']) {
            newRecommendations.push('🧮 У вас западают уравнения. Обратите внимание на раздел "Линейные и квадратные уравнения".');
        }
        if (wrongByType['geometry']) {
            newRecommendations.push('📐 Нужно больше практики с геометрическими задачами. Рекомендуем курс "Геометрия 7-8 класс".');
        }
        if (wrongByType['calculus']) {
            newRecommendations.push('📈 Сложности с производными и интегралами. Рекомендуем курс "Математический анализ для начинающих".');
        }
        if (wrongByType['trig']) {
            newRecommendations.push('🔄 Обратите внимание на тригонометрию — это важная часть ЕГЭ.');
        }

        setRecommendations(newRecommendations);
        setTestCompleted(true);
    };

    const resetTest = () => {
        setTestStarted(false);
        setTestCompleted(false);
        setQuestions([]);
        setCurrentIndex(0);
        setRecommendations([]);
        setSelectedGrade('');
        setIncorrectDetails([]);
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
                    Пройдите тестирование (20 вопросов), и мы подберём курс специально для вас
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
                            transition: 'transform 0.2s',
                        }}
                    >
                        Начать тестирование →
                    </button>
                )}
            </div>

            {/* Выбор класса */}
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
                        textAlign: 'center'
                    }}>
                        <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Выберите ваш класс</h2>
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
                                        transition: 'transform 0.2s',
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
                            type="number"
                            placeholder="Введите ответ"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAnswer((e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
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
                            onClick={(e) => {
                                const input = (e.target as HTMLElement).previousSibling as HTMLInputElement;
                                handleAnswer(input.value);
                                input.value = '';
                            }}
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

            {/* Результаты тестирования и рекомендации */}
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
                        <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>
                            Результаты тестирования
                            <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>
                                ({questions.filter((q: any) => q.isCorrect === true).length} / {questions.length})
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
                                            Правильный ответ: {q.correctAnswer}
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

            {/* Преимущества */}
            <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>
                    Почему выбирают нас?
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '30px',
                }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
                        <h3>Проверка уравнений</h3>
                        <p>Автоматическая проверка решений с помощью ИИ — вы сразу видите ошибки</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎲</div>
                        <h3>Уникальные варианты</h3>
                        <p>У каждого ученика свои задачи — списывание исключено</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
                        <h3>Статистика прогресса</h3>
                        <p>Отслеживайте успехи и получайте награды за достижения</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
                        <h3>Подготовка к ЕГЭ</h3>
                        <p>Все задания актуальны и соответствуют формату экзамена</p>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '60px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>
                        Часто задаваемые вопросы
                    </h2>
                    {[
                        { q: 'Как начать обучение?', a: 'Зарегистрируйтесь, выберите тему и приступайте к решению задач.' },
                        { q: 'Сколько времени длится курс?', a: 'Курс рассчитан на индивидуальный темп — вы можете заниматься в удобное время.' },
                        { q: 'Есть ли обратная связь от преподавателя?', a: 'Да, вы можете задать вопрос в комментариях к задаче.' },
                        { q: 'Подходит ли курс для подготовки к ЕГЭ?', a: 'Да, все темы и задачи соответствуют кодификатору ЕГЭ.' },
                    ].map((item, idx) => (
                        <details key={idx} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '16px 24px',
                            marginBottom: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <summary style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.q}</summary>
                            <p style={{ marginTop: '12px', color: '#555', lineHeight: 1.5 }}>{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>

            {/* Футер */}
            <footer style={{
                backgroundColor: '#1a1a2e',
                color: '#aaa',
                textAlign: 'center',
                padding: '40px 20px',
                fontSize: '14px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <Link to="/reviews" style={{ color: '#aaa', textDecoration: 'none' }}>Отзывы</Link>
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