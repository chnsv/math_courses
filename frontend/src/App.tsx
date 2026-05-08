import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import TopicsPage from './pages/TopicsPage';
import TasksPage from './pages/TasksPage';
import TheoryPage from './pages/TheoryPage';
import ReviewsPage from './pages/ReviewsPage';
import AboutPage from './pages/AboutPage';
import Math5_6Page from './pages/Math5_6Page';
import Algebra7_8Page from './pages/Algebra7_8Page';
import Geometry7_8Page from './pages/Geometry7_8Page';
import OGEPage from './pages/OGEPage';
import EGEPage from './pages/EGEPage';
import TrialOGEPage from './pages/TrialOGEPage';
import TrialEGEPage from './pages/TrialEGEPage';

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
            <Route path="/math-5-6" element={<Math5_6Page />} />
            <Route path="/algebra-7-8" element={<Algebra7_8Page />} />
            <Route path="/geometry-7-8" element={<Geometry7_8Page />} />
            <Route path="/oge" element={<OGEPage />} />
            <Route path="/ege" element={<EGEPage />} />
            <Route path="/trial-oge" element={<TrialOGEPage />} />
            <Route path="/trial-ege" element={<TrialEGEPage />} />
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