import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
    const { user } = useAuth();
    const [showTestModal, setShowTestModal] = useState(false);
    const [testStep, setTestStep] = useState(0);
    const [grade, setGrade] = useState('');
    const [answers, setAnswers] = useState<number[]>([]);

    // Вопросы для тестирования (шаблоны)
    const questions = [
        { id: 1, text: 'Решите уравнение: 2x + 5 = 13', answer: 4 },
        { id: 2, text: 'Чему равен корень уравнения: 3x - 7 = 11', answer: 6 },
        { id: 3, text: '5x = 25, x = ?', answer: 5 },
        { id: 4, text: 'Решите уравнение: x/2 + 3 = 7', answer: 8 },
    ];

    const startTest = () => {
        setShowTestModal(true);
        setTestStep(0);
        setGrade('');
        setAnswers([]);
    };

    const handleGradeSelect = (selectedGrade: string) => {
        setGrade(selectedGrade);
        setTestStep(1);
    };

    const handleAnswer = (questionId: number, userAnswer: string) => {
        const numAnswer = parseInt(userAnswer);
        const isCorrect = numAnswer === questions.find(q => q.id === questionId)?.answer;
        setAnswers([...answers, isCorrect ? 1 : 0]);

        if (testStep < questions.length) {
            setTestStep(testStep + 1);
        } else {
            // Тест завершён
            setShowTestModal(false);
            alert(`Ваш результат: ${answers.filter(a => a === 1).length} из ${questions.length}`);
        }
    };

    const getRecommendations = () => {
        const correctCount = answers.filter(a => a === 1).length;
        if (correctCount <= 1) return 'Математика 5-6 класс';
        if (correctCount <= 2) return 'Алгебра 7-8 класс';
        if (correctCount <= 3) return 'Подготовка ОГЭ';
        return 'Подготовка ЕГЭ';
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
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Начать тестирование →
                </button>
            </div>

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

            {/* Модальное окно тестирования */}
            {showTestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        {testStep === 0 ? (
                            // Выбор класса
                            <div>
                                <h3 style={{ marginBottom: '20px' }}>В каком вы классе?</h3>
                                {['7 класс', '8 класс', '9 класс', '10 класс', '11 класс'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => handleGradeSelect(g)}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '12px',
                                            margin: '8px 0',
                                            backgroundColor: '#f0f0f0',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        ) : testStep <= questions.length ? (
                            // Вопросы теста
                            <div>
                                <div style={{ marginBottom: '10px', color: '#666' }}>
                                    Вопрос {testStep} из {questions.length}
                                </div>
                                <h3 style={{ marginBottom: '20px' }}>{questions[testStep - 1].text}</h3>
                                <input
                                    type="number"
                                    placeholder="Введите ответ"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAnswer(questions[testStep - 1].id, (e.target as HTMLInputElement).value);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        marginBottom: '15px'
                                    }}
                                />
                                <button
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                                        handleAnswer(questions[testStep - 1].id, input.value);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Ответить
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

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
                        <a href="#about" style={{ color: '#aaa', textDecoration: 'none' }}>О нас</a>
                        <a href="#reviews" style={{ color: '#aaa', textDecoration: 'none' }}>Отзывы</a>
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