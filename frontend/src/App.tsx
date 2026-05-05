import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import TopicsPage from './pages/TopicsPage';
import TasksPage from './pages/TasksPage';
import TheoryPage from './pages/TheoryPage';
import ReviewsPage from './pages/ReviewsPage';
import AboutPage from './pages/AboutPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Загрузка...</div>;
    return user ? <>{children}</> : <Navigate to="/" />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/topics" element={<PrivateRoute><TopicsPage /></PrivateRoute>} />
            <Route path="/topic/:id/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
            <Route path="/topic/:id/theory" element={<PrivateRoute><TheoryPage /></PrivateRoute>} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Header />
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;