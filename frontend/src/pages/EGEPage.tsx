import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const EGEPage: React.FC = () => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [level, setLevel] = useState<'basic' | 'profile'>('basic');
    const [primaryScore, setPrimaryScore] = useState(31);
    const [userAnswer, setUserAnswer] = useState('');
    const [taskResult, setTaskResult] = useState('');
    const [task, setTask] = useState({ text: 'Решите уравнение: √(x + 5) = 7', answer: 44, check: (ans: string) => parseFloat(ans) === 44 });
    const [profileTask, setProfileTask] = useState({ text: 'Найдите точку максимума функции f(x) = x³ - 3x²', answer: '2', check: (ans: string) => ans === '2' });

    const generateBasicTask = () => {
        const tasks = [
            { text: 'Решите уравнение: √(x + 5) = 7', answer: 44, check: (a: string) => parseFloat(a) === 44 },
            { text: 'Найдите значение выражения: 5!', answer: 120, check: (a: string) => parseFloat(a) === 120 },
            { text: 'Решите неравенство: 3x - 7 > 11', answer: 6, check: (a: string) => parseFloat(a) > 6 },
        ];
        setTask(tasks[Math.floor(Math.random() * tasks.length)]);
        setUserAnswer('');
        setTaskResult('');
    };

    const generateProfileTask = () => {
        const tasks = [
            { text: 'Найдите точку максимума функции f(x) = x³ - 3x²', answer: '2', check: (a: string) => a === '2' },
            { text: 'Найдите производную функции f(x) = 3x⁴ + 2x³ - x', answer: '12x³ + 6x² - 1', check: (a: string) => a.replace(/\s/g, '') === '12x³+6x²-1' },
            { text: 'Решите уравнение: log₂(x) + log₂(x - 2) = 3', answer: '4', check: (a: string) => a === '4' },
        ];
        setProfileTask(tasks[Math.floor(Math.random() * tasks.length)]);
        setUserAnswer('');
        setTaskResult('');
    };

    const checkTask = () => {
        const currentTask = level === 'basic' ? task : profileTask;
        if (currentTask.check(userAnswer)) setTaskResult('✓ Правильно!');
        else if (userAnswer) setTaskResult('✗ Неверно. Попробуйте ещё раз!');
    };

    const handleStartLearning = () => !user ? setShowAuthModal(true) : window.location.href = '/topics?level=ege';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '24px', padding: '40px', textAlign: 'center', marginBottom: '40px', color: 'white' }}>
                <h1 style={{ fontSize: '48px' }}>🎯 Подготовка к ЕГЭ</h1>
                <p>Профильная математика — пошаговая система подготовки к заветным 100 баллам</p>
            </div>

            {/* Выбор уровня */}
            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '24px' }}>
                <h2 style={{ textAlign: 'center' }}>🎯 Выберите уровень</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                    <button onClick={() => { setLevel('basic'); generateBasicTask(); }} style={{ padding: '10px 30px', backgroundColor: level === 'basic' ? '#e94560' : '#ccc', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer' }}>Базовый</button>
                    <button onClick={() => { setLevel('profile'); generateProfileTask(); }} style={{ padding: '10px 30px', backgroundColor: level === 'profile' ? '#e94560' : '#ccc', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer' }}>Профильный</button>
                </div>

                {/* Задание выбранного уровня */}
                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '16px' }}>
                    <div style={{ fontSize: '18px', marginBottom: '15px' }}>{level === 'basic' ? task.text : profileTask.text}</div>
                    <input type="text" placeholder="Ваш ответ" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', width: '200px', marginRight: '10px' }} />
                    <button onClick={checkTask} style={{ padding: '8px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Проверить</button>
                    <button onClick={level === 'basic' ? generateBasicTask : generateProfileTask} style={{ marginLeft: '10px', padding: '8px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Новое задание</button>
                    {taskResult && <div style={{ marginTop: '15px', color: taskResult.includes('✓') ? '#4CAF50' : '#ff6b6b' }}>{taskResult}</div>}
                </div>
            </div>

            {/* Калькулятор баллов */}
            <div style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#f0f7ff', borderRadius: '24px' }}>
                <h2 style={{ textAlign: 'center' }}>📊 Калькулятор баллов ЕГЭ</h2>
                <label style={{ display: 'block', textAlign: 'center', marginBottom: '20px' }}>Введите первичный балл (0-31): <input type="number" min="0" max="31" value={primaryScore} onChange={(e) => setPrimaryScore(Math.min(31, Math.max(0, parseInt(e.target.value) || 0)))} style={{ padding: '8px', width: '80px', borderRadius: '8px', border: '1px solid #ddd', marginLeft: '10px' }} /></label>
                <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>Вторичный балл: ≈ {Math.floor(primaryScore * 100 / 31)}</div>
                <div style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: '15px' }}>* Официальная шкала перевода</div>
            </div>

            <div style={{ textAlign: 'center' }}><button onClick={handleStartLearning} style={{ backgroundColor: '#e94560', color: 'white', padding: '14px 40px', fontSize: '18px', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>Начать подготовку →</button></div>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};
export default EGEPage;