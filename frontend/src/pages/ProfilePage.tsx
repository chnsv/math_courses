import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface UserStats {
    total_tasks_solved: number;
    total_tasks_correct: number;
    average_score: number;
    current_level: number;
    current_xp: number;
    xp_to_next_level: number;
    weak_topics: { topic_id: number; topic_name: string; correct_percent: number }[];
}

interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
}

interface Student {
    id: number;
    full_name: string;
    email: string;
    class_name: string;
    total_tasks: number;
    correct_percent: number;
    level: number;
    xp: number;
    progress?: number;
}

interface Course {
    id: number;
    title: string;
    description: string;
    slug: string;
    order_index: number;
}

interface Topic {
    id: number;
    title: string;
    description: string;
    order_index: number;
}

const ProfilePage: React.FC = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'students' | 'courses' | 'mycourses' | 'tests' | 'teachers' | 'catalog'>('profile');
    const [stats, setStats] = useState<UserStats | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', class_name: '', avatar_url: '' });
    const [filterClass, setFilterClass] = useState('');

    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [courseTopics, setCourseTopics] = useState<Topic[]>([]);
    const [showAddCourseModal, setShowAddCourseModal] = useState(false);
    const [showAddTopicModal, setShowAddTopicModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', slug: '' });
    const [newTopic, setNewTopic] = useState({ title: '', description: '' });
    const [courseStudents, setCourseStudents] = useState<Student[]>([]);
    const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);
    const [selectedTopicForTheory, setSelectedTopicForTheory] = useState<Topic | null>(null);
    const [theoryContent, setTheoryContent] = useState<any[]>([]);
    const [showTheoryModal, setShowTheoryModal] = useState(false);

    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ email: '', password: '', full_name: '', class_name: '' });
    const [newTeacher, setNewTeacher] = useState({ email: '', password: '', full_name: '' });

    const location = useLocation();

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location]);

    useEffect(() => {
        if (user) {
            loadData();
            setEditForm({ full_name: user.full_name || '', class_name: user.class_name || '', avatar_url: user.avatar_url || '' });
            if (user.role === 'admin') {
                loadCourses();
            }
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, achievementsRes] = await Promise.all([
                api.get('/stats/progress').catch(() => ({ data: null })),
                api.get('/stats/achievements').catch(() => ({ data: [] }))
            ]);
            if (statsRes.data) setStats(statsRes.data);
            if (achievementsRes.data) setAchievements(achievementsRes.data);

            if (user?.role === 'teacher' || user?.role === 'admin') {
                const studentsRes = await api.get('/admin/users?role=student').catch(() => ({ data: { items: [] } }));
                setStudents(studentsRes.data.items || []);
            }

            if (user?.role === 'admin') {
                const teachersRes = await api.get('/admin/users?role=teacher').catch(() => ({ data: { items: [] } }));
                setTeachers(teachersRes.data.items || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
            const response = await api.get('/courses/');
            setCourses(response.data);
        } catch (error) {
            console.error('Ошибка загрузки курсов:', error);
        }
    };

    const filterStudents = async () => {
        setLoading(true);
        try {
            let url = '/admin/users?role=student';
            if (filterClass) {
                url += `&class_name=${encodeURIComponent(filterClass)}`;
            }
            const response = await api.get(url);
            setStudents(response.data.items || []);
        } catch (error) {
            console.error('Ошибка фильтрации:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCourseTopics = async (courseId: number) => {
        try {
            const response = await api.get(`/courses/${courseId}/topics/`);
            setCourseTopics(response.data);
        } catch (error) {
            console.error('Ошибка загрузки тем:', error);
        }
    };

    const loadCourseStudents = async (courseId: number) => {
        try {
            const response = await api.get(`/courses/${courseId}/students`);
            setCourseStudents(response.data);
        } catch (error) {
            console.error('Ошибка загрузки учеников курса:', error);
        }
    };

    const loadTheoryContent = async (topicId: number) => {
        try {
            const response = await api.get(`/topics/${topicId}/theory`);
            setTheoryContent(response.data.blocks || []);
            setShowTheoryModal(true);
        } catch (error) {
            console.error('Ошибка загрузки теории:', error);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await api.put('/users/me', editForm);
            updateUser(response.data);
            setIsEditing(false);
            alert('Профиль обновлен');
        } catch (error) {
            alert('Ошибка при обновлении');
        }
    };

    const addCourse = async () => {
        try {
            await api.post('/courses/', newCourse);
            setShowAddCourseModal(false);
            setNewCourse({ title: '', description: '', slug: '' });
            loadCourses();
            alert('Курс добавлен');
        } catch (error) {
            alert('Ошибка добавления');
        }
    };

    const addTopic = async () => {
        if (!selectedCourse) return;
        try {
            await api.post(`/courses/${selectedCourse.id}/topics/`, newTopic);
            setShowAddTopicModal(false);
            setNewTopic({ title: '', description: '' });
            loadCourseTopics(selectedCourse.id);
            alert('Тема добавлена');
        } catch (error) {
            alert('Ошибка добавления');
        }
    };

    const deleteTopic = async (topicId: number) => {
        if (confirm('Удалить тему?')) {
            try {
                await api.delete(`/courses/topics/${topicId}/`);
                if (selectedCourse) {
                    loadCourseTopics(selectedCourse.id);
                }
                alert('Тема удалена');
            } catch (error) {
                alert('Ошибка удаления');
            }
        }
    };

    const addStudent = async () => {
        try {
            await api.post('/admin/users', { ...newStudent, role: 'student' });
            setShowAddStudentModal(false);
            setNewStudent({ email: '', password: '', full_name: '', class_name: '' });
            loadData();
            alert('Ученик добавлен');
        } catch (error) {
            alert('Ошибка добавления');
        }
    };

    const deleteStudent = async (userId: number) => {
        if (confirm('Удалить ученика?')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                loadData();
                alert('Ученик удален');
            } catch (error) {
                alert('Ошибка удаления');
            }
        }
    };

    const addTeacher = async () => {
        try {
            await api.post('/admin/users', { ...newTeacher, role: 'teacher' });
            setShowAddTeacherModal(false);
            setNewTeacher({ email: '', password: '', full_name: '' });
            loadData();
            alert('Учитель добавлен');
        } catch (error) {
            alert('Ошибка добавления');
        }
    };

    const deleteTeacher = async (userId: number) => {
        if (confirm('Удалить учителя?')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                loadData();
                alert('Учитель удален');
            } catch (error) {
                alert('Ошибка удаления');
            }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
    if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Пожалуйста, войдите</div>;

    const getRoleText = () => {
        switch (user.role) {
            case 'student': return 'Ученик';
            case 'teacher': return 'Учитель';
            case 'admin': return 'Администратор';
            default: return 'Неизвестно';
        }
    };

    const getRoleColor = () => {
        switch (user.role) {
            case 'student': return '#e3f2fd';
            case 'teacher': return '#e8f5e9';
            case 'admin': return '#fff3e0';
            default: return '#f0f0f0';
        }
    };

    const getRoleTextColor = () => {
        switch (user.role) {
            case 'student': return '#1976d2';
            case 'teacher': return '#388e3c';
            case 'admin': return '#f57c00';
            default: return '#666';
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>
                Личный кабинет
                <span style={{
                    fontSize: '16px',
                    marginLeft: '10px',
                    padding: '4px 12px',
                    backgroundColor: getRoleColor(),
                    color: getRoleTextColor(),
                    borderRadius: '20px'
                }}>
                    {getRoleText()}
                </span>
            </h1>

            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0', marginBottom: '30px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('profile')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'profile' ? '#e94560' : 'transparent', color: activeTab === 'profile' ? 'white' : '#333', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer' }}>Мой профиль</button>
                {(user.role === 'student' || user.role === 'teacher') && (
                    <button onClick={() => setActiveTab('stats')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'stats' ? '#e94560' : 'transparent', color: activeTab === 'stats' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Статистика</button>
                )}
                {user.role === 'student' && (
                    <>
                        <button onClick={() => setActiveTab('courses')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'courses' ? '#e94560' : 'transparent', color: activeTab === 'courses' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Доступные курсы</button>
                        <button onClick={() => setActiveTab('mycourses')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'mycourses' ? '#e94560' : 'transparent', color: activeTab === 'mycourses' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Мои курсы</button>
                        <button onClick={() => setActiveTab('tests')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'tests' ? '#e94560' : 'transparent', color: activeTab === 'tests' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Тесты</button>
                    </>
                )}
                {user.role === 'teacher' && (
                    <button onClick={() => setActiveTab('students')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'students' ? '#e94560' : 'transparent', color: activeTab === 'students' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Мои ученики</button>
                )}
                {user.role === 'admin' && (
                    <>
                        <button onClick={() => setActiveTab('students')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'students' ? '#e94560' : 'transparent', color: activeTab === 'students' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Все ученики</button>
                        <button onClick={() => setActiveTab('teachers')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'teachers' ? '#e94560' : 'transparent', color: activeTab === 'teachers' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Учителя</button>
                        <button onClick={() => setActiveTab('catalog')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'catalog' ? '#e94560' : 'transparent', color: activeTab === 'catalog' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>Каталог курсов</button>
                    </>
                )}
            </div>

            {activeTab === 'profile' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap', marginBottom: '30px' }}>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#667eea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', overflow: 'hidden' }}>
                            {user.avatar_url ? <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.role === 'student' ? '??' : user.role === 'teacher' ? '??' : '??')}
                        </div>
                        <div>
                            <h2>{user.full_name || user.email}</h2>
                            <p>{user.email}</p>
                            <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: getRoleColor(), color: getRoleTextColor(), borderRadius: '20px', fontSize: '12px' }}>{getRoleText()}</span>
                        </div>
                        <button onClick={() => setIsEditing(!isEditing)} style={{ marginLeft: 'auto', padding: '8px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>{isEditing ? 'Отмена' : 'Редактировать'}</button>
                    </div>

                    {isEditing ? (
                        <div>
                            <input type="text" placeholder="ФИО" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            {user.role === 'student' && (
                                <div><label>Класс</label><input type="text" placeholder="Класс" value={editForm.class_name || ''} onChange={(e) => setEditForm({ ...editForm, class_name: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                            )}
                            <div><label>Аватар</label><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setEditForm({ ...editForm, avatar_url: reader.result as string }); }; reader.readAsDataURL(file); } }} style={{ width: '100%', padding: '8px' }} /></div>
                            <button onClick={handleUpdateProfile} style={{ padding: '10px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Сохранить</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                            {user.role === 'student' && <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}><div>Класс</div><div><strong>{user.class_name || 'Не указан'}</strong></div></div>}
                            {user.role === 'student' && <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}><div>Уровень</div><div><strong>{stats?.current_level || user.level || 1}</strong></div></div>}
                            {user.role === 'student' && <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}><div>Опыт (XP)</div><div><strong>{stats?.current_xp || user.xp || 0}</strong></div></div>}
                            {user.role !== 'student' && <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}><div>Дата регистрации</div><div><strong>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</strong></div></div>}
                        </div>
                    )}

                    {achievements.length > 0 && user.role === 'student' && (
                        <div style={{ marginTop: '30px' }}><h3>Мои достижения</h3><div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>{achievements.map(ach => <div key={ach.id} style={{ textAlign: 'center', width: '80px' }}><div style={{ fontSize: '36px' }}>{ach.icon}</div><div>{ach.name}</div></div>)}</div></div>
                    )}

                    <div style={{ marginTop: '30px', textAlign: 'center' }}><button onClick={logout} style={{ padding: '10px 30px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Выйти</button></div>
                </div>
            )}

            {activeTab === 'stats' && stats && (
                <div>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', marginBottom: '30px' }}>
                        <h2>Сводная статистика</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e94560' }}>{stats.total_tasks_solved}</div><div>Решено задач</div></div>
                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e94560' }}>{stats.total_tasks_correct}</div><div>Правильных ответов</div></div>
                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}><div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e94560' }}>{stats.average_score}%</div><div>Средний балл</div></div>
                        </div>
                    </div>
                    {user.role === 'student' && (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', marginBottom: '30px' }}>
                            <h2>Прогресс до следующего уровня</h2>
                            <div style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', margin: '15px 0' }}><div style={{ width: `${stats.current_xp % 100}%`, height: '100%', backgroundColor: '#e94560' }} /></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Уровень {stats.current_level}</span><span>{stats.current_xp % 100}/100 XP</span><span>Уровень {stats.current_level + 1}</span></div>
                        </div>
                    )}
                </div>
            )}

            {user.role === 'admin' && activeTab === 'students' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <h2>Все ученики</h2>
                        <div>
                            <button onClick={() => setShowAddStudentModal(true)} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginRight: '10px' }}>Добавить ученика</button>
                            <input type="text" placeholder="Фильтр по классу" value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '8px', marginRight: '10px' }} />
                            <button onClick={filterStudents} style={{ padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Найти</button>                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr style={{ borderBottom: '2px solid #ddd' }}><th style={{ padding: '12px', textAlign: 'left' }}>ФИО</th><th>Email</th><th>Класс</th><th>Уровень</th><th>XP</th><th>Решено</th><th>Успеваемость</th><th>Действия</th></tr></thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{s.full_name || s.email}</td><td style={{ padding: '12px' }}>{s.email}</td><td style={{ padding: '12px' }}>{s.class_name || '—'}</td><td style={{ padding: '12px' }}>{s.level || 1}</td><td style={{ padding: '12px' }}>{s.xp || 0}</td><td style={{ padding: '12px' }}>{s.total_tasks || 0}</td>
                                        <td style={{ padding: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '80px', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${s.correct_percent || 0}%`, height: '100%', backgroundColor: (s.correct_percent || 0) >= 70 ? '#4CAF50' : (s.correct_percent || 0) >= 40 ? '#ffd700' : '#ff6b6b' }} /></div><span>{s.correct_percent || 0}%</span></div></td>
                                        <td style={{ padding: '12px' }}><button onClick={() => deleteStudent(s.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Удалить</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {user.role === 'admin' && activeTab === 'teachers' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <h2>Учителя</h2>
                        <button onClick={() => setShowAddTeacherModal(true)} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить учителя</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ borderBottom: '2px solid #ddd' }}><th style={{ padding: '12px', textAlign: 'left' }}>ФИО</th><th>Email</th><th>Дата регистрации</th><th>Действия</th></tr></thead>
                        <tbody>
                            {teachers.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{t.full_name || t.email}</td><td style={{ padding: '12px' }}>{t.email}</td><td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</td>
                                    <td><button onClick={() => deleteTeacher(t.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Удалить</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {user.role === 'admin' && activeTab === 'catalog' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>Каталог курсов</h2>
                        <button onClick={() => setShowAddCourseModal(true)} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить курс</button>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                        {courses.map(course => (
                            <div key={course.id} style={{ border: selectedCourse?.id === course.id ? '2px solid #e94560' : '1px solid #ddd', borderRadius: '12px', padding: '20px', width: '220px', cursor: 'pointer', backgroundColor: selectedCourse?.id === course.id ? '#fef5f7' : 'white' }}>
                                <div onClick={() => { setSelectedCourse(course); loadCourseTopics(course.id); }}>
                                    <h3>{course.title}</h3>
                                    <p style={{ fontSize: '12px', color: '#666' }}>{course.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button onClick={() => { setSelectedCourseForStudents(course); loadCourseStudents(course.id); }} style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Ученики</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedCourse && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3>Темы курса "{selectedCourse.title}"</h3>
                                <button onClick={() => setShowAddTopicModal(true)} style={{ padding: '6px 12px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить тему</button>
                            </div>
                            {courseTopics.length === 0 ? <p>Нет тем. Добавьте первую тему</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {courseTopics.map(topic => (
                                        <div key={topic.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#f9f9f9', cursor: 'pointer' }} onClick={() => navigate(`/admin/course/${selectedCourse.id}/topic/${topic.id}`)}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div><strong>{topic.title}</strong><p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{topic.description}</p></div>
                                                <button onClick={(e) => { e.stopPropagation(); deleteTopic(topic.id); }} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Удалить</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showAddCourseModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '400px' }}>
                        <h3>Добавить курс</h3>
                        <input type="text" placeholder="Название" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <textarea placeholder="Описание" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <input type="text" placeholder="Уникальный идентификатор (math-5-6...)" value={newCourse.slug} onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '20px' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowAddCourseModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button><button onClick={addCourse} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button></div>
                    </div>
                </div>
            )}

            {showAddTopicModal && selectedCourse && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '400px' }}>
                        <h3>Добавить тему в "{selectedCourse.title}"</h3>
                        <input type="text" placeholder="Название темы" value={newTopic.title} onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <textarea placeholder="Описание" value={newTopic.description} onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowAddTopicModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button><button onClick={addTopic} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button></div>
                    </div>
                </div>
            )}

            {selectedCourseForStudents && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '600px', maxWidth: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Ученики курса "{selectedCourseForStudents.title}"</h3>
                            <button onClick={() => setSelectedCourseForStudents(null)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        {courseStudents.length === 0 ? <p>Нет записанных учеников</p> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr><th style={{ padding: '10px', textAlign: 'left' }}>ФИО</th><th>Класс</th><th>Прогресс</th><th>Баллы</th></tr></thead>
                                <tbody>{courseStudents.map(s => <tr key={s.id}><td style={{ padding: '10px' }}>{s.full_name || s.email}</td><td>{s.class_name || '—'}</td><td><div style={{ width: '80px', height: '6px', backgroundColor: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${s.progress || 0}%`, height: '100%', backgroundColor: '#4CAF50' }} /></div> {s.progress || 0}%</td><td>{s.xp || 0}</td></tr>)}</tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {showAddStudentModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '400px' }}>
                        <h3>Добавить ученика</h3>
                        <input type="email" placeholder="Email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <input type="password" placeholder="Пароль" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <input type="text" placeholder="ФИО" value={newStudent.full_name} onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <input type="text" placeholder="Класс" value={newStudent.class_name} onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowAddStudentModal(false)} style={{ padding: '8px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button><button onClick={addStudent} style={{ padding: '8px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button></div>
                    </div>
                </div>
            )}

            {showAddTeacherModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', width: '400px' }}>
                        <h3>Добавить учителя</h3>
                        <input type="email" placeholder="Email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <input type="password" placeholder="Пароль" value={newTeacher.password} onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                        <input type="text" placeholder="ФИО" value={newTeacher.full_name} onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '20px' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowAddTeacherModal(false)} style={{ padding: '8px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button><button onClick={addTeacher} style={{ padding: '8px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Добавить</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;