import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TopicsPage from './pages/TopicsPage';
import TasksPage from './pages/TasksPage';
import TheoryPage from './pages/TheoryPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Загрузка...</div>;
    return user ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/topics"
                element={
                    <PrivateRoute>
                        <TopicsPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/topic/:id/tasks"
                element={
                    <PrivateRoute>
                        <TasksPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/topic/:id/theory"
                element={
                    <PrivateRoute>
                        <TheoryPage />
                    </PrivateRoute>
                }
            />
            <Route path="/" element={<Navigate to={user ? "/topics" : "/login"} />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;