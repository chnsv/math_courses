import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Course {
    id: number;
    title: string;
    description: string;
}

interface Topic {
    id: number;
    title: string;
    description: string;
    order_index: number;
}

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

interface TeacherCourseManagerProps {
    course: Course;
    onClose: () => void;
    onRefresh: () => void;
}

const TeacherCourseManager: React.FC<TeacherCourseManagerProps> = ({ course, onClose, onRefresh }) => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [theoryBlocks, setTheoryBlocks] = useState<TheoryBlock[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeSubtab, setActiveSubtab] = useState<'topics' | 'theory' | 'tasks' | 'tests'>('topics');
    const [showAddTopicModal, setShowAddTopicModal] = useState(false);
    const [showEditTopicModal, setShowEditTopicModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [newTopic, setNewTopic] = useState({ title: '', description: '' });
    const [showAddTheoryModal, setShowAddTheoryModal] = useState(false);
    const [editingTheory, setEditingTheory] = useState<TheoryBlock | null>(null);
    const [newTheory, setNewTheory] = useState({ title: '', content: '' });
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState({ type: 'equation', question_text: '', correct_answer: '', difficulty: 1, parameters: null });
    const [tests, setTests] = useState<any[]>([]);
    const [showAddTestModal, setShowAddTestModal] = useState(false);
    const [newTest, setNewTest] = useState({ title: '', description: '', duration_minutes: 45, selectedTasks: [] });
    const [students, setStudents] = useState<any[]>([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTestForAssign, setSelectedTestForAssign] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTopics();
        loadTests();
        loadStudents();
    }, []);

    const loadTopics = async () => {
        try {
            const response = await api.get(`/teacher/courses/${course.id}/topics`);
            setTopics(response.data);
        } catch (error) {
            console.error('Ошибка загрузки тем:', error);
        }
    };

    const loadTests = async () => {
        try {
            const response = await api.get('/teacher/tests');
            setTests(response.data);
        } catch (error) {
            console.error('Ошибка загрузки тестов:', error);
        }
    };

    const loadStudents = async () => {
        try {
            const response = await api.get('/admin/users?role=student');
            setStudents(response.data.items || []);
        } catch (error) {
            console.error('Ошибка загрузки учеников:', error);
        }
    };

    const loadTheory = async (topicId: number) => {
        try {
            const response = await api.get(`/teacher/topics/${topicId}/theory`);
            setTheoryBlocks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки теории:', error);
        }
    };

    const loadTasks = async (topicId: number) => {
        try {
            const response = await api.get(`/teacher/topics/${topicId}/tasks`);
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    };

    const selectTopic = (topic: Topic) => {
        setSelectedTopic(topic);
        loadTheory(topic.id);
        loadTasks(topic.id);
        setActiveSubtab('theory');
    };

    const addTopic = async () => {
        if (!newTopic.title) {
            alert('Введите название темы');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/teacher/courses/${course.id}/topics`, newTopic);
            setShowAddTopicModal(false);
            setNewTopic({ title: '', description: '' });
            loadTopics();
            alert('Тема добавлена');
        } catch (error) {
            alert('Ошибка добавления');
        } finally {
            setLoading(false);
        }
    };

    const updateTopic = async () => {
        if (!editingTopic) return;
        setLoading(true);
        try {
            await api.put(`/teacher/topics/${editingTopic.id}`, editingTopic);
            setShowEditTopicModal(false);
            setEditingTopic(null);
            loadTopics();
            if (selectedTopic?.id === editingTopic.id) {
                setSelectedTopic(editingTopic);
            }
            alert('Тема обновлена');
        } catch (error) {
            alert('Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    const deleteTopic = async (topicId: number) => {
        if (confirm('Удалить тему? Это удалит всю теорию и задачи по теме.')) {
            setLoading(true);
            try {
                await api.delete(`/teacher/topics/${topicId}`);
                loadTopics();
                if (selectedTopic?.id === topicId) {
                    setSelectedTopic(null);
                    setTheoryBlocks([]);
                    setTasks([]);
                    setActiveSubtab('topics');
                }
                alert('Тема удалена');
            } catch (error) {
                alert('Ошибка удаления');
            } finally {
                setLoading(false);
            }
        }
    };

    const addTheoryBlock = async () => {
        if (!selectedTopic) return;
        if (!newTheory.title || !newTheory.content) {
            alert('Заполните заголовок и содержание');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/teacher/topics/${selectedTopic.id}/theory`, newTheory);
            setShowAddTheoryModal(false);
            setNewTheory({ title: '', content: '' });
            loadTheory(selectedTopic.id);
            alert('Теория добавлена');
        } catch (error) {
            alert('Ошибка добавления');
        } finally {
            setLoading(false);
        }
    };

    const updateTheoryBlock = async () => {
        if (!editingTheory) return;
        setLoading(true);
        try {
            await api.put(`/teacher/theory/${editingTheory.id}`, editingTheory);
            setEditingTheory(null);
            if (selectedTopic) {
                loadTheory(selectedTopic.id);
            }
            alert('Теория обновлена');
        } catch (error) {
            alert('Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    const deleteTheoryBlock = async (blockId: number) => {
        if (confirm('Удалить блок теории?')) {
            setLoading(true);
            try {
                await api.delete(`/teacher/theory/${blockId}`);
                if (selectedTopic) {
                    loadTheory(selectedTopic.id);
                }
                alert('Блок удален');
            } catch (error) {
                alert('Ошибка удаления');
            } finally {
                setLoading(false);
            }
        }
    };

    const addTask = async () => {
        if (!selectedTopic) return;
        if (!newTask.question_text || !newTask.correct_answer) {
            alert('Заполните текст задачи и правильный ответ');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/teacher/topics/${selectedTopic.id}/tasks`, newTask);
            setShowAddTaskModal(false);
            setNewTask({ type: 'equation', question_text: '', correct_answer: '', difficulty: 1, parameters: null });
            loadTasks(selectedTopic.id);
            alert('Задача добавлена');
        } catch (error) {
            alert('Ошибка добавления');
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async () => {
        if (!editingTask) return;
        setLoading(true);
        try {
            await api.put(`/teacher/tasks/${editingTask.id}`, editingTask);
            setEditingTask(null);
            if (selectedTopic) {
                loadTasks(selectedTopic.id);
            }
            alert('Задача обновлена');
        } catch (error) {
            alert('Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (taskId: number) => {
        if (confirm('Удалить задачу?')) {
            setLoading(true);
            try {
                await api.delete(`/teacher/tasks/${taskId}`);
                if (selectedTopic) {
                    loadTasks(selectedTopic.id);
                }
                alert('Задача удалена');
            } catch (error) {
                alert('Ошибка удаления');
            } finally {
                setLoading(false);
            }
        }
    };

    const addTest = async () => {
        if (!newTest.title) {
            alert('Введите название теста');
            return;
        }
        setLoading(true);
        try {
            await api.post('/teacher/tests', {
                ...newTest,
                course_id: course.id,
                topic_ids: selectedTopic ? [selectedTopic.id] : []
            });
            setShowAddTestModal(false);
            setNewTest({ title: '', description: '', duration_minutes: 45, selectedTasks: [] });
            loadTests();
            alert('Тест создан');
        } catch (error) {
            alert('Ошибка создания');
        } finally {
            setLoading(false);
        }
    };

    const deleteTest = async (testId: number) => {
        if (confirm('Удалить тест?')) {
            setLoading(true);
            try {
                await api.delete(`/teacher/tests/${testId}`);
                loadTests();
                alert('Тест удален');
            } catch (error) {
                alert('Ошибка удаления');
            } finally {
                setLoading(false);
            }
        }
    };

    const assignTest = async () => {
        if (!selectedTestForAssign) return;
        setLoading(true);
        try {
            await api.post(`/teacher/tests/${selectedTestForAssign.id}/assign`, {
                student_ids: newTest.selectedTasks
            });
            setShowAssignModal(false);
            setSelectedTestForAssign(null);
            setNewTest({ ...newTest, selectedTasks: [] });
            alert('Тест назначен ученикам');
        } catch (error) {
            alert('Ошибка назначения');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
    }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, overflow: 'auto', padding: '40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Управление курсом: {course.title}</h2>
                    <button onClick={onClose} style={{ fontSize: '24px', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
                </div>
                <p style={{ marginBottom: '20px', color: '#666' }}>{course.description}</p>

                {/* Вкладки */}
                <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <button onClick={() => { setActiveSubtab('topics'); setSelectedTopic(null); }} style={{ padding: '10px 20px', backgroundColor: activeSubtab === 'topics' ? '#e94560' : 'transparent', color: activeSubtab === 'topics' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>Темы курса</button>
                    {selectedTopic && (
                        <>
                            <button onClick={() => { setActiveSubtab('theory'); loadTheory(selectedTopic.id); }} style={{ padding: '10px 20px', backgroundColor: activeSubtab === 'theory' ? '#e94560' : 'transparent', color: activeSubtab === 'theory' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Теория</button>
                            <button onClick={() => { setActiveSubtab('tasks'); loadTasks(selectedTopic.id); }} style={{ padding: '10px 20px', backgroundColor: activeSubtab === 'tasks' ? '#e94560' : 'transparent', color: activeSubtab === 'tasks' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Задачи</button>
                        </>
                    )}
                    <button onClick={() => setActiveSubtab('tests')} style={{ padding: '10px 20px', backgroundColor: activeSubtab === 'tests' ? '#e94560' : 'transparent', color: activeSubtab === 'tests' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Контрольные работы</button>
                </div>

                {/* Темы курса */}
                {activeSubtab === 'topics' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <button onClick={() => setShowAddTopicModal(true)} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Добавить тему</button>
                        </div>
                        {topics.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Нет тем. Добавьте первую тему</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {topics.map(topic => (
                                    <div key={topic.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '15px', backgroundColor: '#f9f9f9', cursor: 'pointer' }} onClick={() => selectTopic(topic)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ fontSize: '18px' }}>{topic.title}</strong>
                                                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{topic.description}</p>
                                            </div>
                                            <div>
                                                <button onClick={(e) => { e.stopPropagation(); setEditingTopic(topic); setShowEditTopicModal(true); }} style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                                                <button onClick={(e) => { e.stopPropagation(); deleteTopic(topic.id); }} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Теория */}
                {activeSubtab === 'theory' && selectedTopic && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <button onClick={() => setShowAddTheoryModal(true)} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Добавить теорию</button>
                        </div>
                        <h3 style={{ marginBottom: '15px' }}>Теория по теме: {selectedTopic.title}</h3>
                        {theoryBlocks.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Нет блоков теории. Добавьте первый</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {theoryBlocks.map(block => (
                                    <div key={block.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '15px', backgroundColor: '#f9f9f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <strong>{block.title}</strong>
                                            <div>
                                                <button onClick={() => { setEditingTheory(block); }} style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                                                <button onClick={() => deleteTheoryBlock(block.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                                            </div>
                                        </div>
                                        <div dangerouslySetInnerHTML={{ __html: block.content.substring(0, 200) + (block.content.length > 200 ? '...' : '') }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Задачи */}
                {activeSubtab === 'tasks' && selectedTopic && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <button onClick={() => setShowAddTaskModal(true)} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Добавить задачу</button>
                        </div>
                        <h3 style={{ marginBottom: '15px' }}>Задачи по теме: {selectedTopic.title}</h3>
                        {tasks.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Нет задач. Добавьте первую</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {tasks.map(task => (
                                    <div key={task.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '15px', backgroundColor: '#f9f9f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <span style={{ display: 'inline-block', padding: '2px 8px', backgroundColor: task.type === 'equation' ? '#667eea' : task.type === 'numeric' ? '#4CAF50' : '#ff9800', color: 'white', borderRadius: '20px', fontSize: '12px', marginBottom: '10px' }}>
                                                    {task.type === 'equation' ? 'Уравнение' : task.type === 'numeric' ? 'Числовая' : 'Тест'}
                                                </span>
                                                <div dangerouslySetInnerHTML={{ __html: task.question_text }} style={{ marginBottom: '10px' }} />
                                                <div style={{ fontSize: '14px', color: '#666' }}>Ответ: {task.correct_answer}</div>
                                            </div>
                                            <div>
                                                <button onClick={() => { setEditingTask(task); }} style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                                                <button onClick={() => deleteTask(task.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Контрольные работы */}
                {activeSubtab === 'tests' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <button onClick={() => setShowAddTestModal(true)} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Создать контрольную работу</button>
                        </div>
                        {tests.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Нет созданных контрольных работ</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {tests.map(test => (
                                    <div key={test.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '15px', backgroundColor: '#f9f9f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ fontSize: '16px' }}>{test.title}</strong>
                                                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{test.description}</p>
                                                <p style={{ fontSize: '12px', color: '#666' }}>Длительность: {test.duration_minutes} минут</p>
                                            </div>
                                            <div>
                                                <button onClick={() => { setSelectedTestForAssign(test); setShowAssignModal(true); }} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', marginRight: '5px', cursor: 'pointer' }}>📋 Назначить</button>
                                                <button onClick={() => deleteTest(test.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Модальные окна */}
                {showAddTopicModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '400px' }}>
                            <h3>Добавить тему</h3>
                            <input type="text" placeholder="Название темы" value={newTopic.title} onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <textarea placeholder="Описание" value={newTopic.description} onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowAddTopicModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                                <button onClick={addTopic} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditTopicModal && editingTopic && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '400px' }}>
                            <h3>Редактировать тему</h3>
                            <input type="text" placeholder="Название темы" value={editingTopic.title} onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <textarea placeholder="Описание" value={editingTopic.description} onChange={(e) => setEditingTopic({ ...editingTopic, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowEditTopicModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                                <button onClick={updateTopic} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Сохранить</button>
                            </div>
                        </div>
                    </div>
                )}

                {showAddTheoryModal && selectedTopic && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '500px' }}>
                            <h3>Добавить теорию</h3>
                            <input type="text" placeholder="Заголовок" value={newTheory.title} onChange={(e) => setNewTheory({ ...newTheory, title: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <textarea placeholder="Содержание (поддерживается LaTeX: $$...$$)" value={newTheory.content} onChange={(e) => setNewTheory({ ...newTheory, content: e.target.value })} rows={6} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowAddTheoryModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                                <button onClick={addTheoryBlock} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button>
                            </div>
                        </div>
                    </div>
                )}

                {editingTheory && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '500px' }}>
                            <h3>Редактировать теорию</h3>
                            <input type="text" placeholder="Заголовок" value={editingTheory.title} onChange={(e) => setEditingTheory({ ...editingTheory, title: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <textarea placeholder="Содержание (поддерживается LaTeX: $$...$$)" value={editingTheory.content} onChange={(e) => setEditingTheory({ ...editingTheory, content: e.target.value })} rows={6} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingTheory(null)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                                <button onClick={updateTheoryBlock} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Сохранить</button>
                            </div>
                        </div>
                    </div>
                )}

                {showAddTaskModal && selectedTopic && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '500px' }}>
                            <h3>Добавить задачу</h3>
                            <select value={newTask.type} onChange={(e) => setNewTask({ ...newTask, type: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                <option value="equation">Уравнение</option>
                                <option value="numeric">Числовая задача</option>
                                <option value="test">Тест</option>
                            </select>
                            <textarea placeholder="Текст задачи (поддержка LaTeX: $$...$$)" value={newTask.question_text} onChange={(e) => setNewTask({ ...newTask, question_text: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <input type="text" placeholder="Правильный ответ" value={newTask.correct_answer} onChange={(e) => setNewTask({ ...newTask, correct_answer: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <input type="number" placeholder="Сложность (1-5)" value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowAddTaskModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                                <button onClick={addTask} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button>
                            </div>
                        </div>
                    </div>
                )}

                {editingTask && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '500px' }}>
                            <h3>Редактировать задачу</h3>
                            <select value={editingTask.type} onChange={(e) => setEditingTask({ ...editingTask, type: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                <option value="equation">Уравнение</option>
                                <option value="numeric">Числовая задача</option>
                                <option value="test">Тест</option>
                            </select>
                            <textarea placeholder="Текст задачи" value={editingTask.question_text} onChange={(e) => setEditingTask({ ...editingTask, question_text: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <input type="text" placeholder="Правильный ответ" value={editingTask.correct_answer} onChange={(e) => setEditingTask({ ...editingTask, correct_answer: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingTask(null)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                                <button onClick={updateTask} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Сохранить</button>
                            </div>
                        </div>
                    </div>
                )}

                {showAddTestModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '400px' }}>
                            <h3>Создать контрольную работу</h3>
                            <input type="text" placeholder="Название" value={newTest.title} onChange={(e) => setNewTest({ ...newTest, title: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <textarea placeholder="Описание" value={newTest.description} onChange={(e) => setNewTest({ ...newTest, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <input type="number" placeholder="Длительность (минуты)" value={newTest.duration_minutes} onChange={(e) => setNewTest({ ...newTest, duration_minutes: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowAddTestModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                                <button onClick={addTest} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Создать</button>
                            </div>
                        </div>
                    </div>
                )}

                {showAssignModal && selectedTestForAssign && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '500px' }}>
                            <h3>Назначить тест "{selectedTestForAssign.title}" ученикам</h3>
                            <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '20px' }}>
                                {students.map(student => (
                                    <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderBottom: '1px solid #eee' }}>
                                        <input type="checkbox" checked={newTest.selectedTasks.includes(student.id)} onChange={(e) => {
                                            if (e.target.checked) {
                                                setNewTest({ ...newTest, selectedTasks: [...newTest.selectedTasks, student.id] });
                                            } else {
                                                setNewTest({ ...newTest, selectedTasks: newTest.selectedTasks.filter(id => id !== student.id) });
                                            }
                                        }} />
                                        <span>{student.full_name || student.email} ({student.class_name || 'Класс не указан'})</span>
                                    </label>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => { setShowAssignModal(false); setSelectedTestForAssign(null); setNewTest({ ...newTest, selectedTasks: [] }); }} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
                                <button onClick={assignTest} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Назначить</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherCourseManager;