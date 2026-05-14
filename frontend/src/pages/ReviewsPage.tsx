import React, { useState } from 'react';

const ReviewsPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [newReview, setNewReview] = useState({ name: '', grade: '', text: '', rating: 5 });

    const reviews = [
        { id: 1, name: 'Анна Иванова', grade: '11 класс', text: 'Отличный курс! За 2 месяца подтянула математику с 60 до 85 баллов. Особенно понравилась проверка уравнений — сразу видно ошибки, можно учиться на них. Платформа очень удобная, всё интуитивно понятно', rating: 5, date: '15.03.2026', avatar: '👩‍🎓' },
        { id: 2, name: 'Михаил Петров', grade: '9 класс', text: 'Готовился к ОГЭ, сдал на 5. Спасибо за уникальные варианты заданий — готовился сам, без репетитора. Особенно понравилось, что каждый раз новые задачи, невозможно просто запомнить ответы.', rating: 5, date: '20.03.2026', avatar: '👨‍🎓' },
        { id: 3, name: 'Екатерина Смирнова', grade: '10 класс', text: 'Удобная платформа, понятные объяснения. Задания реально сложные, как на ЕГЭ. Разбор ошибок помогает понять, где я ошибаюсь. Рекомендую всем, кто хочет сдать экзамен на высокий балл!', rating: 4, date: '05.04.2026', avatar: '👩‍🎓' },
        { id: 4, name: 'Дмитрий Козлов', grade: '11 класс', text: 'Лучший сайт для подготовки к профильной математике. Пробники ЕГЭ очень похожи на реальные. Проверка уравнений через SymPy — это просто космос! Нигде такого не видел.', rating: 5, date: '12.04.2026', avatar: '👨‍🎓' },
        { id: 5, name: 'Ольга Соколова', grade: 'Преподаватель', text: 'Использую платформу для подготовки своих учеников к ЕГЭ. Отличный инструмент для генерации вариантов и проверки знаний. Экономит массу времени!', rating: 5, date: '18.04.2026', avatar: '👩‍🏫' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Спасибо за отзыв! Он появится после модерации.');
        setShowForm(false);
        setNewReview({ name: '', grade: '', text: '', rating: 5 });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Заголовок */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#1a1a2e' }}>
                    ⭐ Отзывы наших учеников
                </h1>
                <p style={{ fontSize: '18px', color: '#666' }}>
                    Более 5000 учеников уже подготовились к экзаменам с нами
                </p>
            </div>

            {/* Кнопка добавить отзыв */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        backgroundColor: '#e94560',
                        color: 'white',
                        padding: '12px 30px',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {showForm ? '✖ Отмена' : '✍ Оставить отзыв'}
                </button>
            </div>

            {/* Форма добавления отзыва */}
            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '30px',
                    marginBottom: '40px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '20px' }}>Поделитесь своим мнением</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Ваше имя"
                                value={newReview.name}
                                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                required
                                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                            <input
                                type="text"
                                placeholder="Класс / Роль"
                                value={newReview.grade}
                                onChange={(e) => setNewReview({ ...newReview, grade: e.target.value })}
                                required
                                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                        </div>
                        <textarea
                            placeholder="Ваш отзыв..."
                            value={newReview.text}
                            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                            required
                            rows={4}
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '15px', resize: 'vertical' }}
                        />
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ marginRight: '15px' }}>Оценка: </label>
                            {[1, 2, 3, 4, 5].map(r => (
                                <label key={r} style={{ marginRight: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        value={r}
                                        checked={newReview.rating === r}
                                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                                        style={{ marginRight: '5px' }}
                                    />
                                    {r} ★
                                </label>
                            ))}
                        </div>
                        <button type="submit" style={{
                            backgroundColor: '#1a1a2e',
                            color: 'white',
                            padding: '12px 30px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            Отправить отзыв
                        </button>
                    </form>
                </div>
            )}

            {/* Список отзывов */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                {reviews.map((review) => (
                    <div key={review.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '48px' }}>{review.avatar}</span>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{review.name}</div>
                                <div style={{ color: '#666', fontSize: '14px' }}>{review.grade} • {review.date}</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ fontSize: '20px', color: i < review.rating ? '#ffc107' : '#e0e0e0' }}>★</span>
                            ))}
                        </div>
                        <p style={{ lineHeight: 1.6, color: '#444' }}>{review.text}</p>
                    </div>
                ))}
            </div>

            {/* Статистика */}
            <div style={{
                marginTop: '60px',
                backgroundColor: '#1a1a2e',
                borderRadius: '16px',
                padding: '40px',
                color: 'white',
                textAlign: 'center'
            }}>
                <h3 style={{ marginBottom: '30px', fontSize: '24px' }}>Наша статистика</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
                    <div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e94560' }}>5000+</div>
                        <div style={{ opacity: 0.8 }}>Учеников</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e94560' }}>98%</div>
                        <div style={{ opacity: 0.8 }}>Довольны результатом</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e94560' }}>15000+</div>
                        <div style={{ opacity: 0.8 }}>Решённых задач</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e94560' }}>4.9</div>
                        <div style={{ opacity: 0.8 }}>Средняя оценка</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;