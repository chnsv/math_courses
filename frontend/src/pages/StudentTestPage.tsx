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
    const { testId, assignmentId } = useParams();
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
        loadTest();
    }, [testId, assignmentId]);

    useEffect(() => {
        if (timeLeft > 0 && !submitted) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !submitted && test) {
            submitTest();
        }
    }, [timeLeft, submitted]);

    const loadTest = async () => {
        try {
            const response = await api.get(`/teacher/tests/generate/${assignmentId}`);
            setTest(response.data);
            setQuestions(response.data.questions);
            setTimeLeft(response.data.duration_minutes * 60);
        } catch (error) {
            console.error('Ошибка загрузки теста:', error);
            alert('Ошибка загрузки теста');
        } finally {
            setLoading(false);
        }
    };

    const submitTest = async () => {
        if (!test) return;

        const formattedAnswers: { [key: string]: string } = {};
        questions.forEach((question, idx) => {
            if (answers[idx]) {
                formattedAnswers[question.id.toString()] = answers[idx];
            }
        });

        console.log('Отправка ответов:', formattedAnswers);

        try {
            const response = await api.post(`/teacher/tests/${test.test_id}/submit/${assignmentId}`, {
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

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка теста...</div>;

    if (submitted && result) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                <h1>Результаты теста</h1>
                <div style={{ fontSize: '48px', textAlign: 'center', margin: '30px 0' }}>
                    {result.score} / {result.total}
                </div>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    {result.score / result.total * 100 >= 70 ? 'Поздравляем! Вы прошли тест!' : 'Попробуйте ещё раз'}
                </div>
                <button onClick={() => navigate('/profile')} style={{ padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Вернуться в профиль</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>{test?.test_title}</h1>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: timeLeft < 60 ? '#e94560' : '#333' }}>
                    ⏱️ {formatTime(timeLeft)}
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                {questions.map((q, idx) => (
                    <div key={q.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Вопрос {idx + 1}</div>
                        <div style={{ marginBottom: '15px', fontSize: '16px', lineHeight: '1.5' }}>
                            <MathJax>{q.text}</MathJax>
                        </div>
                        <input
                            type="text"
                            placeholder="Введите ответ"
                            value={answers[idx] || ''}
                            onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                        />
                    </div>
                ))}
            </div>

            <button onClick={submitTest} style={{ width: '100%', padding: '12px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
                Завершить тест
            </button>
        </div>
    );
};

export default StudentTestPage;