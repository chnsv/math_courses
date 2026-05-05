import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tasksApi } from '../services/api';

interface Task {
    id: number;
    type: string;  // 'test', 'numeric', 'equation'
    question_text: string;
    difficulty: number;
    options?: { id: number; text: string }[];
}

interface AttemptResult {
    is_correct: boolean;
    score: number;
    earned_xp: number;
    solution_explanation: string;
}

const TasksPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState<AttemptResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [id]);

    const fetchTasks = async () => {
        try {
            const response = await tasksApi.getTasks(Number(id));
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            alert('Не удалось загрузить задачи');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!answer.trim()) {
            alert('Введите ответ');
            return;
        }

        setSubmitting(true);
        const currentTask = tasks[currentIndex];

        try {
            const response = await tasksApi.submitAttempt(currentTask.id, answer);
            setResult(response.data);
        } catch (error: any) {
            console.error('Ошибка при проверке:', error);
            alert(error.response?.data?.detail || 'Ошибка при проверке ответа');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        setResult(null);
        setAnswer('');
        if (currentIndex + 1 < tasks.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            alert('Поздравляем! Вы прошли все задачи по этой теме!');
        }
    };

    const handleRetry = () => {
        setResult(null);
        setAnswer('');
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 50 }}>Загрузка задач...</div>;
    }

    if (tasks.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <h2>Нет задач в этой теме</h2>
                <Link to="/topics">← Вернуться к темам</Link>
            </div>
        );
    }

    const currentTask = tasks[currentIndex];
    const progress = Math.round(((currentIndex + (result ? 1 : 0)) / tasks.length) * 100);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            {/* Верхняя панель */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Link to="/topics" style={{ textDecoration: 'none' }}>← Назад к темам</Link>
                <div>Задача {currentIndex + 1} из {tasks.length}</div>
            </div>

            {/* Прогресс */}
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    width: '100%',
                    height: 10,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 5,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: '#007bff',
                        transition: 'width 0.3s'
                    }} />
                </div>
                <div style={{ marginTop: 5, fontSize: 14, color: '#666' }}>Прогресс: {progress}%</div>
            </div>

            {/* Карточка задачи */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: 20
            }}>
                <div style={{ marginBottom: 20 }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 20,
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        fontSize: 12,
                        marginBottom: 10
                    }}>
                        {currentTask.type === 'test' ? 'Тест' :
                         currentTask.type === 'numeric' ? 'Числовая задача' :
                         'Уравнение'}
                        {currentTask.difficulty && ` • Сложность: ${currentTask.difficulty}`}
                    </span>
                </div>

                {/* Вопрос с поддержкой LaTeX */}
                <div style={{ fontSize: 18, marginBottom: 24, lineHeight: 1.6 }}>
                    <div dangerouslySetInnerHTML={{ __html: currentTask.question_text }} />
                </div>

                {/* Поле ввода ответа */}
                {currentTask.type === 'test' && currentTask.options ? (
                    <div style={{ marginBottom: 20 }}>
                        {currentTask.options.map(opt => (
                            <label key={opt.id} style={{ display: 'block', marginBottom: 10, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="answer"
                                    value={opt.id}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    checked={answer === String(opt.id)}
                                />
                                <span style={{ marginLeft: 8 }}>
                                    <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                                </span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div style={{ marginBottom: 20 }}>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Введите ваш ответ"
                            style={{
                                width: '100%',
                                padding: 12,
                                fontSize: 16,
                                border: '1px solid #ddd',
                                borderRadius: 8,
                            }}
                            disabled={!!result}
                        />
                    </div>
                )}

                {/* Кнопка проверки (показываем, только если ответ не отправлен) */}
                {!result && (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !answer.trim()}
                        style={{
                            width: '100%',
                            padding: 12,
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            cursor: 'pointer',
                        }}
                    >
                        {submitting ? 'Проверка...' : 'Проверить'}
                    </button>
                )}

                {/* Результат проверки */}
                {result && (
                    <div style={{
                        marginTop: 20,
                        padding: 16,
                        borderRadius: 8,
                        backgroundColor: result.is_correct ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${result.is_correct ? '#c3e6cb' : '#f5c6cb'}`,
                    }}>
                        <div style={{ fontSize: 18, marginBottom: 10 }}>
                            {result.is_correct ? '✓ Правильно!' : '✗ Неправильно'}
                        </div>
                        {result.earned_xp > 0 && (
                            <div style={{ marginBottom: 10, color: '#28a745' }}>
                                +{result.earned_xp} XP
                            </div>
                        )}
                        {result.solution_explanation && (
                            <div style={{ fontSize: 14, marginBottom: 10 }}>
                                <strong>Пояснение:</strong> {result.solution_explanation}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                            <button
                                onClick={handleRetry}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 5,
                                    cursor: 'pointer',
                                }}
                            >
                                Повторить
                            </button>
                            <button
                                onClick={handleNext}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 5,
                                    cursor: 'pointer',
                                }}
                            >
                                {currentIndex + 1 === tasks.length ? 'Завершить' : 'Следующая задача'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksPage;