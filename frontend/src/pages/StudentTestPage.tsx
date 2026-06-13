import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MathJax } from 'better-react-mathjax';

interface Question {
    id: number;
    text: string;
}

const StudentTestPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [test, setTest] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (assignmentId) {
            loadTest();
        }
    }, [assignmentId]);

    useEffect(() => {
        if (timeLeft > 0 && !submitted && test?.status === 'assigned') {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !submitted && test) {
            submitTest();
        }
    }, [timeLeft, submitted, test]);

    const loadTest = async () => {
        if (!assignmentId) {
            console.error('Нет assignmentId');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/teacher/tests/assignment/${assignmentId}`);
            const testData = response.data;

            console.log('Загружен тест:', testData);

            setTest(testData);

            if (testData.questions) {
                setQuestions(testData.questions);
            }

            if (testData.duration_minutes && testData.status === 'assigned') {
                setTimeLeft(testData.duration_minutes * 60);
            }

            if (testData.status === 'completed') {
                setSubmitted(true);
                setResult({
                    score: testData.score,
                    total: testData.total_questions
                });
            }
        } catch (error: any) {
            console.error('Ошибка загрузки теста:', error);
            alert(error.response?.data?.detail || 'Ошибка загрузки теста');
        } finally {
            setLoading(false);
        }
    };

    const submitTest = async () => {
        if (!test || submitted) return;

        const formattedAnswers: { [key: string]: string } = {};
        questions.forEach((question, idx) => {
            if (answers[idx]) {
                formattedAnswers[question.id.toString()] = answers[idx];
            }
        });

        console.log('Отправка ответов:', formattedAnswers);

        try {
            const response = await api.post(`/teacher/tests/submit/${assignmentId}`, {
                answers: formattedAnswers
            });
            console.log('Ответ сервера:', response.data);
            setResult(response.data);
            setSubmitted(true);
        } catch (error: any) {
            console.error('Ошибка при отправке теста:', error);
            alert(error.response?.data?.detail || 'Ошибка при отправке теста');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка теста...</div>;
    }

    if (submitted && result) {
        const percentage = (result.score / result.total * 100).toFixed(1);
        const isPassed = parseFloat(percentage) >= 70;

        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                <div style={{ textAlign: 'center', backgroundColor: isPassed ? '#d4edda' : '#f8d7da', borderRadius: '16px', padding: '30px' }}>
                    <h1 style={{ marginBottom: '20px' }}>Результаты теста</h1>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
                        {result.score} / {result.total}
                    </div>
                    <div style={{ fontSize: '24px', marginBottom: '20px' }}>
                        {percentage}%
                    </div>
                    <div style={{ marginBottom: '30px', fontSize: '18px' }}>
                        {isPassed ? 'Поздравляем! Вы успешно прошли тест!' : 'Попробуйте ещё раз!'}
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{ padding: '12px 24px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
                    >
                        Вернуться в профиль
                    </button>
                </div>
            </div>
        );
    }

    if (!test || !questions.length) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <p>Тест не найден или не содержит вопросов</p>
                <button onClick={() => navigate('/profile')} style={{ padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Вернуться в профиль
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h1>{test.title}</h1>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: timeLeft < 60 ? '#e94560' : '#333' }}>
                    ⏱️ {formatTime(timeLeft)}
                </div>
            </div>

            {test.description && (
                <p style={{ color: '#666', marginBottom: '30px' }}>{test.description}</p>
            )}

            <div style={{ marginBottom: '30px' }}>
                {questions.map((q, idx) => (
                    <div key={q.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#667eea' }}>Вопрос {idx + 1}</div>
                        <div style={{ marginBottom: '15px', fontSize: '16px', lineHeight: '1.5' }}>
                            <MathJax>{q.text}</MathJax>
                        </div>
                        <input
                            type="text"
                            placeholder="Введите ответ"
                            value={answers[idx] || ''}
                            onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                            onKeyPress={(e) => e.key === 'Enter' && idx === questions.length - 1 && submitTest()}
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={submitTest}
                disabled={submitted}
                style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#e94560',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: submitted ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                    opacity: submitted ? 0.7 : 1
                }}
            >
                {submitted ? 'Отправка...' : '📝 Завершить тест'}
            </button>
        </div>
    );
};

export default StudentTestPage;