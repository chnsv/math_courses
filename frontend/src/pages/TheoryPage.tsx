import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MathJax } from 'better-react-mathjax';

interface TheoryBlock {
    id: number;
    title: string;
    content: string;
    order_index: number;
}

const TheoryPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blocks, setBlocks] = useState<TheoryBlock[]>([]);
    const [topicTitle, setTopicTitle] = useState('');
    const [selectedBlock, setSelectedBlock] = useState<TheoryBlock | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const DEBUG_VERSION = 'v2.0.1';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [theoryRes, topicRes] = await Promise.all([
                    api.get(`/topics/${id}/theory`),
                    api.get(`/topics/${id}`)
                ]);
                setBlocks(theoryRes.data);
                setTopicTitle(topicRes.data.title);
            } catch (error) {
                console.error('Ошибка:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const openModal = (block: TheoryBlock) => {
        setSelectedBlock(block);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBlock(null);
    };

    const goToTasks = () => {
        closeModal();
        navigate(`/topic/${id}/tasks`);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Загрузка...</div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            <button onClick={() => navigate('/topics')} style={{ marginBottom: 20, cursor: 'pointer' }}>
                ← Назад к темам
            </button>

            <h1>{topicTitle}</h1>

            <h3>Выберите тему:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {blocks.map(block => (
                    <div
                        key={block.id}
                        onClick={() => openModal(block)}
                        style={{
                            padding: '15px 20px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: 10,
                            cursor: 'pointer',
                            border: '1px solid #ddd',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e0e0e0';
                            e.currentTarget.style.transform = 'translateX(5px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        📖 {block.title}
                    </div>
                ))}
            </div>

            {/* Модальное окно */}
            {isModalOpen && selectedBlock && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        padding: 30,
                        maxWidth: 700,
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}>
                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: 15,
                                right: 20,
                                fontSize: 28,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#999'
                            }}
                        >
                            ✕
                        </button>

                        <h2 style={{ marginBottom: 20 }}>{selectedBlock.title}</h2>

                        <div style={{ lineHeight: 1.6, fontSize: '16px' }}>
                            <MathJax>{selectedBlock.content}</MathJax>
                        </div>

                        <div style={{ marginTop: 25, textAlign: 'center' }}>
                            <button
                                onClick={goToTasks}
                                style={{
                                    padding: '10px 30px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer'
                                }}
                            >
                                Перейти к задачам →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TheoryPage;