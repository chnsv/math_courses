import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface TheoryBlock {
    id: number;
    title: string;
    content: string;
    order_index: number;
}

interface Task {
    id: number;
    type: string;
    question_text: string;
    correct_answer: string;
    difficulty: number;
}

const TopicManagementPage: React.FC = () => {
    const { courseId, topicId } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState<any>(null);
    const [theoryBlocks, setTheoryBlocks] = useState<TheoryBlock[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeSubtab, setActiveSubtab] = useState<'theory' | 'tasks'>('theory');
    const [showAddTheoryModal, setShowAddTheoryModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTheory, setNewTheory] = useState({ title: '', content: '' });
    const [newTask, setNewTask] = useState({ type: 'equation', question_text: '', correct_answer: '', difficulty: 1 });
    const [loading, setLoading] = useState(true);
    const [selectedTheory, setSelectedTheory] = useState<TheoryBlock | null>(null);

    useEffect(() => {
        if (topicId) {
            loadData();
        }
    }, [topicId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const topicRes = await api.get(`/topics/${topicId}`).catch(() => ({ data: null }));
            if (!topicRes.data) {
                setLoading(false);
                return;
            }
            setTopic(topicRes.data);

            const [theoryRes, tasksRes] = await Promise.all([
                api.get(`/topics/${topicId}/theory`).catch(() => ({ data: { blocks: [] } })),
                api.get(`/tasks?topic_id=${topicId}`).catch(() => ({ data: [] }))
            ]);

            setTheoryBlocks(theoryRes.data.blocks || []);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTheoryBlock = async () => {
        if (!newTheory.title || !newTheory.content) {
            alert('Заполните заголовок и содержание');
            return;
        }
        try {
            await api.post(`/topics/${topicId}/theory`, newTheory);
            setShowAddTheoryModal(false);
            setNewTheory({ title: '', content: '' });
            loadData();
            alert('Теория добавлена');
        } catch (error) {
            alert('Ошибка добавления');
        }
    };

    const deleteTheoryBlock = async (blockId: number) => {
        if (confirm('Удалить блок теории?')) {
            try {
                await api.delete(`/topics/theory/${blockId}`);
                loadData();
                alert('Блок удален');
            } catch (error) {
                alert('Ошибка удаления');
            }
        }
    };

    const addTask = async () => {
        if (!newTask.question_text || !newTask.correct_answer) {
            alert('Заполните текст задачи и правильный ответ');
            return;
        }
        try {
            await api.post(`/topics/${topicId}/tasks`, { ...newTask, topic_id: topicId });
            setShowAddTaskModal(false);
            setNewTask({ type: 'equation', question_text: '', correct_answer: '', difficulty: 1 });
            loadData();
            alert('Задача добавлена');
        } catch (error) {
            alert('Ошибка добавления');
        }
    };

    const deleteTask = async (taskId: number) => {
        if (confirm('Удалить задачу?')) {
            try {
                await api.delete(`/tasks/${taskId}`);
                loadData();
                alert('Задача удалена');
            } catch (error) {
                alert('Ошибка удаления');
            }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
    if (!topic) return <div style={{ textAlign: 'center', padding: '50px' }}>Тема не найдена</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <button onClick={() => navigate('/profile', { state: { activeTab: 'catalog' } })} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>
                ← Назад к курсам
            </button>

            <h1>Управление темой: {topic.title}</h1>
            <p style={{ marginBottom: '30px', color: '#666' }}>{topic.description}</p>

            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0', marginBottom: '30px' }}>
                <button onClick={() => setActiveSubtab('theory')} style={{ padding: '10px 20px', backgroundColor: activeSubtab === 'theory' ? '#e94560' : 'transparent', color: activeSubtab === 'theory' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>Теория</button>
                <button onClick={() => setActiveSubtab('tasks')} style={{ padding: '10px 20px', backgroundColor: activeSubtab === 'tasks' ? '#e94560' : 'transparent', color: activeSubtab === 'tasks' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>Задачи</button>
            </div>

            {activeSubtab === 'theory' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <button onClick={() => setShowAddTheoryModal(true)} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            + Добавить блок теории
                        </button>
                    </div>

                    {theoryBlocks.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px' }}>Нет блоков теории. Добавьте первый!</p>
                    ) : (
                        <div>
                            {theoryBlocks.map(block => (
                                <div key={block.id} style={{ border: '1px solid #eee', borderRadius: '12px', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f5f5f5' }}>
                                        <strong style={{ cursor: 'pointer' }} onClick={() => setSelectedTheory(block)}>{block.title}</strong>
                                        <button onClick={(e) => { e.stopPropagation(); deleteTheoryBlock(block.id); }} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Удалить</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeSubtab === 'tasks' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <button onClick={() => setShowAddTaskModal(true)} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            + Добавить задачу
                        </button>
                    </div>

                    {tasks.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px' }}>Нет задач. Добавьте первую!</p>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ display: 'inline-block', padding: '2px 8px', backgroundColor: '#667eea', color: 'white', borderRadius: '20px', fontSize: '12px', marginBottom: '10px' }}>
                                            {task.type === 'equation' ? 'Уравнение' : task.type === 'numeric' ? 'Числовая задача' : 'Тест'}
                                        </span>
                                        <div style={{ fontSize: '16px', marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: task.question_text }} />
                                        <div style={{ fontSize: '14px', color: '#666' }}>Правильный ответ: {task.correct_answer}</div>
                                    </div>
                                    <button onClick={() => deleteTask(task.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>Удалить</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showAddTheoryModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '500px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Добавить блок теории</h3>
                            <button onClick={() => setShowAddTheoryModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <input type="text" placeholder="Заголовок" value={newTheory.title} onChange={(e) => setNewTheory({ ...newTheory, title: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        <textarea placeholder="Содержание" value={newTheory.content} onChange={(e) => setNewTheory({ ...newTheory, content: e.target.value })} rows={6} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAddTheoryModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                            <button onClick={addTheoryBlock} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddTaskModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '500px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Добавить задачу</h3>
                            <button onClick={() => setShowAddTaskModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <select value={newTask.type} onChange={(e) => setNewTask({ ...newTask, type: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <option value="equation">Уравнение</option>
                            <option value="numeric">Числовая задача</option>
                            <option value="test">Тест</option>
                        </select>
                        <textarea placeholder="Текст задачи" value={newTask.question_text} onChange={(e) => setNewTask({ ...newTask, question_text: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        <input type="text" placeholder="Правильный ответ" value={newTask.correct_answer} onChange={(e) => setNewTask({ ...newTask, correct_answer: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        <input type="number" placeholder="Сложность (1-5)" value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAddTaskModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                            <button onClick={addTask} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedTheory && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedTheory(null)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '30px',
                            width: '600px',
                            maxWidth: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>{selectedTheory.title}</h3>
                            <button
                                onClick={() => setSelectedTheory(null)}
                                style={{
                                    background: '#e94560',
                                    border: 'none',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: selectedTheory.content }} style={{ lineHeight: 1.6 }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicManagementPage;