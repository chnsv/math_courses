import React, { useState, useEffect } from 'react';
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
}

const ProfilePage: React.FC = () => {
    const { user, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'students' | 'content' | 'courses' | 'mycourses' | 'tests'>('profile');
    const [stats, setStats] = useState<UserStats | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', class_name: '', avatar_url: '' });
    const [filterClass, setFilterClass] = useState('');

    // Для отладки — выводим роль в консоль
    useEffect(() => {
        console.log('=== ProfilePage: Текущий пользователь ===');
        console.log('user:', user);
        console.log('Роль пользователя:', user?.role);
    }, [user]);

    useEffect(() => {
        if (user) {
            loadData();
            setEditForm({ full_name: user.full_name || '', class_name: user.class_name || '', avatar_url: user.avatar_url || '' });
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
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await api.put('/users/me', editForm);
            updateUser(response.data);
            setIsEditing(false);
            alert('Профиль обновлён!');
        } catch (error) {
            alert('Ошибка при обновлении');
        }
    };

    const exportToExcel = async () => {
        try {
            const response = await api.get('/admin/export', { params: { class_name: filterClass || undefined }, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `students_${filterClass || 'all'}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Ошибка экспорта');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
    if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Пожалуйста, войдите</div>;

    // Определяем текст роли для отображения
    const getRoleText = () => {
        switch (user.role) {
            case 'student': return 'Ученик';
            case 'teacher': return 'Учитель';
            case 'admin': return 'Администратор';
            default: return 'Неизвестно';
        }
    };

    // Определяем цвет роли
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

            {/* Вкладки - строго по ролям */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0', marginBottom: '30px', flexWrap: 'wrap' }}>
                {/* Общие вкладки для всех ролей */}
                <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: activeTab === 'profile' ? '#e94560' : 'transparent',
                        color: activeTab === 'profile' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer'
                    }}
                >
                    👤 Мой профиль
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: activeTab === 'stats' ? '#e94560' : 'transparent',
                        color: activeTab === 'stats' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer'
                    }}
                >
                    📊 Статистика
                </button>

                {/* Вкладки ТОЛЬКО для ученика */}
                {user.role === 'student' && (
                    <>
                        <button
                            onClick={() => setActiveTab('courses')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: activeTab === 'courses' ? '#e94560' : 'transparent',
                                color: activeTab === 'courses' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer'
                            }}
                        >
                            📚 Доступные курсы
                        </button>
                        <button
                            onClick={() => setActiveTab('mycourses')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: activeTab === 'mycourses' ? '#e94560' : 'transparent',
                                color: activeTab === 'mycourses' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer'
                            }}
                        >
                            📖 Мои курсы
                        </button>
                        <button
                            onClick={() => setActiveTab('tests')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: activeTab === 'tests' ? '#e94560' : 'transparent',
                                color: activeTab === 'tests' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer'
                            }}
                        >
                            📝 Тесты
                        </button>
                    </>
                )}

                {/* Вкладки ТОЛЬКО для учителя */}
                {user.role === 'teacher' && (
                    <button
                        onClick={() => setActiveTab('students')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'students' ? '#e94560' : 'transparent',
                            color: activeTab === 'students' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer'
                        }}
                    >
                        👨‍🎓 Мои ученики
                    </button>
                )}

                {/* Вкладки ТОЛЬКО для администратора */}
                {user.role === 'admin' && (
                    <>
                        <button
                            onClick={() => setActiveTab('students')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: activeTab === 'students' ? '#e94560' : 'transparent',
                                color: activeTab === 'students' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer'
                            }}
                        >
                            👨‍🎓 Все ученики
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: activeTab === 'content' ? '#e94560' : 'transparent',
                                color: activeTab === 'content' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer'
                            }}
                        >
                            📝 Управление контентом
                        </button>
                    </>
                )}
            </div>

            {/* ========== Вкладка профиля ========== */}
            {activeTab === 'profile' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {/* Аватар и информация */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap', marginBottom: '30px' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            backgroundColor: '#667eea',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                            overflow: 'hidden'
                        }}>
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user.role === 'student' ? '👨‍🎓' : user.role === 'teacher' ? '👩‍🏫' : '👑'
                            )}
                        </div>
                        <div>
                            <h2 style={{ marginBottom: '5px' }}>{user.full_name || user.email}</h2>
                            <p style={{ color: '#666', marginBottom: '5px' }}>{user.email}</p>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                backgroundColor: getRoleColor(),
                                color: getRoleTextColor(),
                                borderRadius: '20px',
                                fontSize: '12px'
                            }}>
                                {getRoleText()}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            style={{ marginLeft: 'auto', padding: '8px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
                        >
                            {isEditing ? 'Отмена' : 'Редактировать'}
                        </button>
                    </div>

                    {/* Форма редактирования */}
                    {isEditing ? (
                        <div>
                            <input
                                type="text"
                                placeholder="ФИО"
                                value={editForm.full_name}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                            <input
                                type="text"
                                placeholder="Класс"
                                value={editForm.class_name}
                                onChange={(e) => setEditForm({ ...editForm, class_name: e.target.value })}
                                style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                            <div style={{ marginBottom: '15px' }}>
                                <label>Аватар:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setEditForm({ ...editForm, avatar_url: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <button
                                onClick={handleUpdateProfile}
                                style={{ padding: '10px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                Сохранить
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Класс</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user.class_name || 'Не указан'}</div>
                            </div>
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Уровень</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats?.current_level || user.level || 1}</div>
                            </div>
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Опыт (XP)</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats?.current_xp || user.xp || 0}</div>
                            </div>
                        </div>
                    )}

                    {/* Достижения */}
                    {achievements.length > 0 && (
                        <div style={{ marginTop: '30px' }}>
                            <h3>🏆 Мои достижения</h3>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
                                {achievements.map(ach => (
                                    <div key={ach.id} style={{ textAlign: 'center', width: '80px' }}>
                                        <div style={{ fontSize: '36px' }}>{ach.icon}</div>
                                        <div style={{ fontSize: '12px' }}>{ach.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <button onClick={logout} style={{ padding: '10px 30px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            Выйти
                        </button>
                    </div>
                </div>
            )}

            {/* ========== Вкладка статистики ========== */}
            {activeTab === 'stats' && stats && (
                <div>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <h2>📊 Сводная статистика</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e94560' }}>{stats.total_tasks_solved}</div>
                                <div>Решено задач</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e94560' }}>{stats.total_tasks_correct}</div>
                                <div>Правильных ответов</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e94560' }}>{stats.average_score}%</div>
                                <div>Средний балл</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <h2>📈 Прогресс до следующего уровня</h2>
                        <div style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', margin: '15px 0' }}>
                            <div style={{ width: `${stats.current_xp % 100}%`, height: '100%', backgroundColor: '#e94560' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Уровень {stats.current_level}</span>
                            <span>{stats.current_xp % 100}/100 XP</span>
                            <span>Уровень {stats.current_level + 1}</span>
                        </div>
                    </div>

                    {stats.weak_topics && stats.weak_topics.length > 0 && (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <h2>⚠️ Слабые места</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                                {stats.weak_topics.map((topic, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span>{topic.topic_name}</span>
                                            <span>{topic.correct_percent}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${topic.correct_percent}%`, height: '100%', backgroundColor: topic.correct_percent < 50 ? '#ff6b6b' : '#ffd700' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========== Вкладка доступных курсов (ТОЛЬКО для ученика) ========== */}
            {user.role === 'student' && activeTab === 'courses' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2>📚 Доступные курсы</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>Выберите курс для обучения</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px' }}>
                            <h3>📐 Математика 5-6 класс</h3>
                            <p>Базовый курс для младших школьников</p>
                            <button style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Записаться</button>
                        </div>
                        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px' }}>
                            <h3>📏 Алгебра 7-8 класс</h3>
                            <p>Изучение выражений, уравнений, функций</p>
                            <button style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Записаться</button>
                        </div>
                        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px' }}>
                            <h3>📐 Геометрия 7-8 класс</h3>
                            <p>Фигуры, теоремы, доказательства</p>
                            <button style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Записаться</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== Вкладка моих курсов (ТОЛЬКО для ученика) ========== */}
            {user.role === 'student' && activeTab === 'mycourses' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2>📖 Мои курсы</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>Курсы, на которые вы записаны</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px' }}>
                            <h3>📐 Математика 5-6 класс</h3>
                            <p>Прогресс: 0%</p>
                            <button style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Продолжить</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== Вкладка тестов (ТОЛЬКО для ученика) ========== */}
            {user.role === 'student' && activeTab === 'tests' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2>📝 Тесты</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>Доступные тесты для проверки знаний</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px' }}>
                            <h3>📊 Тест: Линейные уравнения</h3>
                            <p>10 вопросов • 30 минут</p>
                            <button style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Начать тест</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== Вкладка учеников (для учителя и администратора) ========== */}
            {(user.role === 'teacher' || user.role === 'admin') && activeTab === 'students' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <h2>{user.role === 'teacher' ? '👨‍🎓 Мои ученики' : '👨‍🎓 Все ученики'}</h2>
                        <div>
                            <input
                                type="text"
                                placeholder="Фильтр по классу"
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '8px', marginRight: '10px' }}
                            />
                            <button onClick={loadData} style={{ padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Найти</button>
                            <button onClick={exportToExcel} style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>📎 Экспорт</button>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>ФИО</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Класс</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Уровень</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>XP</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Решено</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Успеваемость</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{s.full_name || s.email}</td>
                                        <td style={{ padding: '12px' }}>{s.email}</td>
                                        <td style={{ padding: '12px' }}>{s.class_name || '—'}</td>
                                        <td style={{ padding: '12px' }}>{s.level || 1}</td>
                                        <td style={{ padding: '12px' }}>{s.xp || 0}</td>
                                        <td style={{ padding: '12px' }}>{s.total_tasks || 0}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '80px', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${s.correct_percent || 0}%`, height: '100%', backgroundColor: (s.correct_percent || 0) >= 70 ? '#4CAF50' : (s.correct_percent || 0) >= 40 ? '#ffd700' : '#ff6b6b' }} />
                                                </div>
                                                <span>{s.correct_percent || 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {students.length === 0 && <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>Нет зарегистрированных учеников</p>}
                </div>
            )}

            {/* ========== Вкладка управления контентом (ТОЛЬКО для администратора) ========== */}
            {user.role === 'admin' && activeTab === 'content' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2>📝 Управление контентом</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>Управление темами, задачами и пользователями</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
                            <h3>➕ Добавить тему</h3>
                            <input type="text" placeholder="Название" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <button style={{ width: '100%', padding: '10px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Создать</button>
                        </div>
                        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
                            <h3>👥 Добавить пользователя</h3>
                            <input type="email" placeholder="Email" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <button style={{ width: '100%', padding: '10px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Создать</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;