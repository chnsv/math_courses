import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MathJax } from 'better-react-mathjax';

interface Topic {
    id: number;
    title: string;
    description: string;
    progress: number;
}

interface TheoryBlock {
    id: number;
    title: string;
    content: string;
    order_index: number;
}

const StudentCoursePage: React.FC = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [theoryBlocks, setTheoryBlocks] = useState<TheoryBlock[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<TheoryBlock | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'topics' | 'theory'>('topics');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [topicsRes, courseRes] = await Promise.all([
                    api.get(`/courses/${courseId}/topics`),
                    api.get(`/courses/${courseId}`)
                ]);

                setTopics(topicsRes.data);
                setCourseTitle(courseRes.data.title);
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    const handleTopicClick = async (topic: Topic) => {
        setSelectedTopic(topic);
        setActiveTab('theory');
        try {
            const response = await api.get(`/topics/${topic.id}/theory`);
            const blocksData = response.data.blocks || response.data;
            setTheoryBlocks(blocksData);
        } catch (error) {
            console.error('Ошибка загрузки теории:', error);
            setTheoryBlocks([]);
        }
    };

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
        if (selectedTopic && selectedBlock) {
            navigate(`/topic/${selectedTopic.id}/tasks/${selectedBlock.id}`);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Загрузка...</div>;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
            <span
                onClick={() => navigate('/profile', { state: { activeTab: 'mycourses' } })}
                style={{
                    display: 'inline-block',
                    marginBottom: 20,
                    cursor: 'pointer',
                    color: '#007bff',
                    textDecoration: 'underline'
                }}
            >
                ← Назад к моим курсам
            </span>

            <h1>{courseTitle}</h1>

            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0', marginBottom: '30px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveTab('topics')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: activeTab === 'topics' ? '#e94560' : 'transparent',
                        color: activeTab === 'topics' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer'
                    }}
                >
                    Темы курса
                </button>
                <button
                    onClick={() => setActiveTab('theory')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: activeTab === 'theory' ? '#e94560' : 'transparent',
                        color: activeTab === 'theory' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer'
                    }}
                    disabled={!selectedTopic}
                >
                    Теория {selectedTopic ? `: ${selectedTopic.title}` : ''}
                </button>
            </div>

            {activeTab === 'topics' && (
                <div>
                    {topics.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 50 }}>Нет доступных тем</div>
                    ) : (
                        topics.map((topic) => (
                            <div
                                key={topic.id}
                                onClick={() => handleTopicClick(topic)}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: 12,
                                    padding: 20,
                                    marginBottom: 16,
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <h3>{topic.title}</h3>
                                <p style={{ color: '#666' }}>{topic.description}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'theory' && (
                <div>
                    {!theoryBlocks || theoryBlocks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 50, backgroundColor: '#f9f9f9', borderRadius: 12 }}>
                            Теория пока не добавлена
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h3>Выберите тему для изучения:</h3>
                            {theoryBlocks.map((block) => (
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
                    )}
                </div>
            )}

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

export default StudentCoursePage;