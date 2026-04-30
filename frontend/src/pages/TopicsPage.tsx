import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Topic {
    id: number;
    title: string;
    description: string;
    children: Topic[];
}

const TopicsPage: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const response = await api.get('/topics');
            setTopics(response.data);
        } catch (error) {
            console.error('Ошибка загрузки тем:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderTopic = (topic: Topic) => (
        <div key={topic.id} style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: '#fff'
        }}>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
            <div>
                <Link to={`/topic/${topic.id}/theory`} style={{ marginRight: 16 }}>📖 Теория</Link>
                <Link to={`/topic/${topic.id}/tasks`}>📝 Задачи</Link>
            </div>
            {topic.children.length > 0 && (
                <div style={{ marginTop: 16, marginLeft: 20 }}>
                    {topic.children.map(child => renderTopic(child))}
                </div>
            )}
        </div>
    );

    if (loading) return <div>Загрузка...</div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Курс математики</h1>
                <div>
                    <span>Привет, {user?.full_name || user?.email}!</span>
                    <button onClick={logout} style={{ marginLeft: 16, padding: '5px 10px' }}>Выйти</button>
                </div>
            </div>
            <div style={{ marginTop: 20 }}>
                {topics.map(topic => renderTopic(topic))}
            </div>
        </div>
    );
};

export default TopicsPage;