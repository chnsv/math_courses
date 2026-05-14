import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Topic {
    id: number;
    title: string;
    description: string;
    progress: number;
    completed: boolean;
}

interface TheoryBlock {
    id: number;
    title: string;
    content: string;
}

interface Task {
    id: number;
    type: string;
    question_text: string;
    correct_answer: string;
    difficulty: number;
}

const StudentCoursePage: React.FC = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [theoryBlocks, setTheoryBlocks] = useState<TheoryBlock[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState<'topics' | 'theory' | 'tasks'>('topics');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        setLoading(true);
        try {
            const [courseRes, progressRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                api.get(`/courses/my-courses/${courseId}/progress`)
            ]);
            setCourse(courseRes.data);
            setTopics(progressRes.data);
        } catch (error) {
            console.error('Ошибка загрузки курса:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectTopic = async (topic: Topic) => {
        setSelectedTopic(topic);
        try {
            const [theoryRes, tasksRes] = await Promise.all([
                api.get(`/topics/${topic.id}/theory`),
                api.get(`/tasks?topic_id=${topic.id}`)
            ]);
            setTheoryBlocks(theoryRes.data.blocks || []);
            setTasks(tasksRes.data);
            setActiveTab('theory');
        } catch (error) {
            console.error('Ошибка загрузки темы:', error);
        }
    };

    const handleTaskAnswer = async (taskId: number, answer: string) => {
        try {
            const response = await api.post(`/tasks/${taskId}/attempt`, { user_answer: answer });
            alert(response.data.is_correct ? 'Правильно! +' + response.data.earned_xp + ' XP' : 'Неправильно. ' + response.data.solution_explanation);
            loadCourseData();
        } catch (error) {
            alert('Ошибка при проверке');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка курса...</div>;
    if (!course) return <div style={{ textAlign: 'center', padding: '50px' }}>Курс не найден</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <button onClick={() => navigate('/profile', { state: { activeTab: 'mycourses' } })} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>
                ← Назад к моим курсам
            </button>

            <h1 style={{ marginBottom: '10px' }}>{course.title}</h1>
            <p style={{ marginBottom: '30px', color: '#666' }}>{course.description}</p>

            {/* Общий прогресс */}
            <div style={{ backgroundColor: '#f0f7ff', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>Общий прогресс по курсу</span>
                    <span>{Math.round(topics.reduce((acc, t) => acc + t.progress, 0) / (topics.length || 1))}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', backgroundColor: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round(topics.reduce((acc, t) => acc + t.progress, 0) / (topics.length || 1))}%`, height: '100%', backgroundColor: '#e94560' }} />
                </div>
            </div>

            {/* Вкладки */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('topics')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'topics' ? '#e94560' : 'transparent', color: activeTab === 'topics' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>Темы курса</button>
                {selectedTopic && (
                    <>
                        <button onClick={() => { setActiveTab('theory'); }} style={{ padding: '10px 20px', backgroundColor: activeTab === 'theory' ? '#e94560' : 'transparent', color: activeTab === 'theory' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Теория</button>
                        <button onClick={() => { setActiveTab('tasks'); }} style={{ padding: '10px 20px', backgroundColor: activeTab === 'tasks' ? '#e94560' : 'transparent', color: activeTab === 'tasks' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Задачи</button>
                    </>
                )}
            </div>

            {/* Список тем */}
            {activeTab === 'topics' && (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {topics.map(topic => (
                        <div key={topic.id} onClick={() => selectTopic(topic)} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', backgroundColor: '#f9f9f9', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div>
                                    <strong style={{ fontSize: '18px' }}>{topic.title}</strong>
                                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{topic.description}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '100px', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${topic.progress}%`, height: '100%', backgroundColor: topic.completed ? '#4CAF50' : '#ffd700' }} />
                                        </div>
                                        <span>{topic.progress}%</span>
                                        {topic.completed && <span style={{ fontSize: '20px' }}>✅</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Теория */}
            {activeTab === 'theory' && selectedTopic && (
                <div>
                    <h3 style={{ marginBottom: '15px' }}>Теория: {selectedTopic.title}</h3>
                    {theoryBlocks.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Теория пока не добавлена</p>
                    ) : (
                        theoryBlocks.map(block => (
                            <div key={block.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '20px', backgroundColor: '#fff' }}>
                                <h4 style={{ marginBottom: '10px' }}>{block.title}</h4>
                                <div dangerouslySetInnerHTML={{ __html: block.content }} style={{ lineHeight: 1.6 }} />
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Задачи */}
            {activeTab === 'tasks' && selectedTopic && (
                <div>
                    <h3 style={{ marginBottom: '15px' }}>Задачи: {selectedTopic.title}</h3>
                    {tasks.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Задачи пока не добавлены</p>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '15px', backgroundColor: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ display: 'inline-block', padding: '2px 8px', backgroundColor: task.type === 'equation' ? '#667eea' : task.type === 'numeric' ? '#4CAF50' : '#ff9800', color: 'white', borderRadius: '20px', fontSize: '12px', marginBottom: '10px' }}>
                                            {task.type === 'equation' ? 'Уравнение' : task.type === 'numeric' ? 'Числовая задача' : 'Тест'}
                                        </span>
                                        <div style={{ fontSize: '16px', marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: task.question_text }} />
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                                            <input type="text" id={`answer-${task.id}`} placeholder="Введите ответ" style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '8px', width: '200px' }} />
                                            <button onClick={() => {
                                                const input = document.getElementById(`answer-${task.id}`) as HTMLInputElement;
                                                handleTaskAnswer(task.id, input.value);
                                                input.value = '';
                                            }} style={{ padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Проверить</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentCoursePage;