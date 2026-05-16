import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Topic {
    id: number;
    title: string;
    description: string;
    children?: Topic[];
}

const TopicsPage: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await api.get('/topics');
                setTopics(response.data);
            } catch (error) {
                console.error('Ошибка:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);

    const handleTopicClick = (topicId: number) => {
        navigate(`/subtopics/${topicId}`);
    };

    const renderTopic = (topic: Topic) => (
        <div key={topic.id} onClick={() => handleTopicClick(topic.id)} style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            backgroundColor: '#fff',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            <h3>{topic.title}</h3>
            <p style={{ color: '#666' }}>{topic.description}</p>
            {topic.children && topic.children.length > 0 && (
                <div style={{ marginLeft: 20, marginTop: 10 }}>
                    {topic.children.map(child => (
                        <div key={child.id} style={{ marginBottom: 8 }}>
                            📘 {child.title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) return <div>Загрузка...</div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            <h1>Темы курса</h1>
            {topics.map(renderTopic)}
        </div>
    );
};

export default TopicsPage;