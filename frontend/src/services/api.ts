import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const tasksApi = {
    getTasks: (topicId: number) => api.get(`/tasks?topic_id=${topicId}`),
    submitAttempt: (taskId: number, userAnswer: string) =>
        api.post(`/tasks/${taskId}/attempt`, { user_answer: userAnswer }),
    checkEquation: (equation: string, userAnswer: string) =>
        api.post('/sympy/check-equation', { equation, user_answer: userAnswer }),
};

export default api;