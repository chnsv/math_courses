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
    weak_topics: { topic_name: string; correct_percent: number }[];
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
    const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'students' | 'content'>('profile');
    const [stats, setStats] = useState<UserStats | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', class_name: '', avatar_url: '' });
    const [filterClass, setFilterClass] = useState('');

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

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>Личный кабинет</h1>

            {/* Вкладки */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0', marginBottom: '30px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('profile')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'profile' ? '#e94560' : 'transparent', color: activeTab === 'profile' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>👤 Мой профиль</button>
                <button onClick={() => setActiveTab('stats')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'stats' ? '#e94560' : 'transparent', color: activeTab === 'stats' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>📊 Статистика</button>
                {(user.role === 'teacher' || user.role === 'admin') && <button onClick={() => setActiveTab('students')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'students' ? '#e94560' : 'transparent', color: activeTab === 'students' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>👨‍🎓 Ученики</button>}
                {user.role === 'admin' && <button onClick={() => setActiveTab('content')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'content' ? '#e94560' : 'transparent', color: activeTab === 'content' ? 'white' : '#333', border: 'none', cursor: 'pointer' }}>📝 Управление</button>}
            </div>

            {/* Профиль */}
            {activeTab === 'profile' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap', marginBottom: '30px' }}>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#667eea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                            {user.role === 'student' ? '👨‍🎓' : user.role === 'teacher' ? '👩‍🏫' : '👑'}
                        </div>
                        <div>
                            <h2>{user.full_name || user.email}</h2>
                            <p>{user.email}</p>
                            <span style={{ padding: '4px 12px', backgroundColor: '#e3f2fd', borderRadius: '20px', fontSize: '12px' }}>{user.role === 'student' ? 'Ученик' : user.role === 'teacher' ? 'Учитель' : 'Администратор'}</span>
                        </div>
                        <button onClick={() => setIsEditing(!isEditing)} style={{ marginLeft: 'auto', padding: '8px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Редактировать</button>
                    </div>

                    {isEditing ? (
                        <div>
                            <input type="text" placeholder="ФИО" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <input type="text" placeholder="Класс" value={editForm.class_name} onChange={(e) => setEditForm({ ...editForm, class_name: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <button onClick={handleUpdateProfile} style={{ padding: '10px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Сохранить</button>
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
                        <button onClick={logout} style={{ padding: '10px 30px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Выйти</button>
                    </div>
                </div>
            )}

            {/* Статистика */}
            {activeTab === 'stats' && stats && (
                <div>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', marginBottom: '30px' }}>
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

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px' }}>
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
                </div>
            )}

            {/* Ученики (для учителя/админа) */}
            {activeTab === 'students' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <h2>👨‍🎓 Ученики</h2>
                        <div>
                            <input type="text" placeholder="Фильтр по классу" value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '8px', marginRight: '10px' }} />
                            <button onClick={loadData} style={{ padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Найти</button>
                            <button onClick={exportToExcel} style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>📎 Экспорт</button>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>ФИО</th>
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
            )}

            {/* Управление контентом (только админ) */}
            {activeTab === 'content' && user.role === 'admin' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center' }}>
                    <p>📝 Управление контентом (редактирование тем, задач, теории) — в разработке</p>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;