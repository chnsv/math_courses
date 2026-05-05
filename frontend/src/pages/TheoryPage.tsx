import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface TheoryBlock {
    id: number;
    title: string;
    content: string;
    order_index: number;
}

const TheoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [blocks, setBlocks] = useState<TheoryBlock[]>([]);
    const [topicTitle, setTopicTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTheory();
    }, [id]);

    const fetchTheory = async () => {
        try {
            const response = await api.get(`/topics/${id}/theory`);
            setTopicTitle(response.data.title);
            setBlocks(response.data.blocks);
        } catch (error) {
            console.error('Ошибка загрузки теории:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Загрузка...</div>;

    if (blocks.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <h2>Теория пока не добавлена</h2>
                <Link to={`/topic/${id}/tasks`}>Перейти к задачам →</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <Link to="/topics" style={{ textDecoration: 'none' }}>← Назад к темам</Link>
            </div>

            <h1>{topicTitle}</h1>

            {blocks.map((block) => (
                <div key={block.id} style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 24,
                    marginBottom: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginBottom: 16 }}>{block.title}</h2>
                    <div
                        style={{ lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                </div>
            ))}

            <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Link
                    to={`/topic/${id}/tasks`}
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 8,
                    }}
                >
                    Перейти к задачам →
                </Link>
            </div>
        </div>
    );
};

export default TheoryPage;