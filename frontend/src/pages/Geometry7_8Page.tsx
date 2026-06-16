import React from 'react';
import { Link } from 'react-router-dom';

const Geometry7_8Page: React.FC = () => {
    const topics = [
        {
            id: 1,
            title: 'Точки, прямые, отрезки',
            description: 'Основные понятия геометрии: точка, прямая, отрезок, луч',
            icon: '📐',
            color: '#667eea'
        },
        {
            id: 2,
            title: 'Углы',
            description: 'Виды углов, биссектриса, смежные и вертикальные углы',
            icon: '📏',
            color: '#e94560'
        },
        {
            id: 3,
            title: 'Параллельные и перпендикулярные прямые',
            description: 'Признаки параллельности, аксиома параллельных',
            icon: '➗',
            color: '#4CAF50'
        },
        {
            id: 4,
            title: 'Треугольники',
            description: 'Виды треугольников, признаки равенства, свойства',
            icon: '🔺',
            color: '#FF9800'
        },
        {
            id: 5,
            title: 'Окружность и круг',
            description: 'Элементы окружности, касательная, центральные и вписанные углы',
            icon: '⚪',
            color: '#9C27B0'
        },
        {
            id: 6,
            title: 'Четырехугольники',
            description: 'Параллелограмм, прямоугольник, ромб, квадрат, трапеция',
            icon: '🔲',
            color: '#00BCD4'
        },
        {
            id: 7,
            title: 'Площади фигур',
            description: 'Площадь треугольника, прямоугольника, параллелограмма, трапеции',
            icon: '📊',
            color: '#607D8B'
        },
        {
            id: 8,
            title: 'Векторы',
            description: 'Сложение векторов, скалярное произведение',
            icon: '➡️',
            color: '#FF5722'
        }
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Hero секция */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '24px',
                padding: '60px 40px',
                textAlign: 'center',
                color: 'white',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>📐 Геометрия 7-8 класс</h1>
                <p style={{ fontSize: '20px', maxWidth: '700px', margin: '0 auto', opacity: 0.9 }}>
                    Изучайте геометрию с наглядными примерами, теорией и практическими задачами
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '24px'
            }}>
                {topics.map(topic => (
                    <div
                        key={topic.id}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            borderTop: `4px solid ${topic.color}`,
                            cursor: 'default'
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{topic.icon}</div>
                        <h3 style={{ marginBottom: '12px', color: '#1a1a2e' }}>{topic.title}</h3>
                        <p style={{ color: '#666', lineHeight: 1.5 }}>{topic.description}</p>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '60px' }}>
                <h2 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '40px' }}>Что вас ждёт в курсе</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px'
                }}>
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '16px' }}>📖</div>
                        <h3>Подробная теория</h3>
                        <p style={{ color: '#666' }}>Теоремы, формулы и доказательства с примерами</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '16px' }}>📝</div>
                        <h3>Интерактивные задачи</h3>
                        <p style={{ color: '#666' }}>Задания с автоматической проверкой решений</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{ fontSize: '36px', marginBottom: '16px' }}>🎯</div>
                        <h3>Подготовка к ОГЭ</h3>
                        <p style={{ color: '#666' }}>Задачи из реальных экзаменов с разбором</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Geometry7_8Page;