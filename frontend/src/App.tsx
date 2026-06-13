import { MathJaxContext } from 'better-react-mathjax';
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
import ProfilePage from './pages/ProfilePage';
import TopicManagementPage from './pages/TopicManagementPage';
import StudentCoursePage from './pages/StudentCoursePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentTestPage from './pages/StudentTestPage';

const mathJaxConfig = {
    loader: { load: ['input/tex', 'output/chtml'] },
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
    }
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Загрузка...</div>;
    return user ? <>{children}</> : <Navigate to="/" />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/math-5-6" element={<Math5_6Page />} />
            <Route path="/algebra-7-8" element={<Algebra7_8Page />} />
            <Route path="/geometry-7-8" element={<Geometry7_8Page />} />
            <Route path="/oge" element={<OGEPage />} />
            <Route path="/ege" element={<EGEPage />} />
            <Route path="/trial-oge" element={<TrialOGEPage />} />
            <Route path="/trial-ege" element={<TrialEGEPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/topics" element={<PrivateRoute><TopicsPage /></PrivateRoute>} />

            <Route path="/topic/:id/tasks/:theoryBlockId" element={<PrivateRoute><TasksPage /></PrivateRoute>} />

            <Route path="/topic/:id/theory" element={<PrivateRoute><TheoryPage /></PrivateRoute>} />

            <Route path="/admin/course/:courseId/topic/:topicId" element={<PrivateRoute><TopicManagementPage /></PrivateRoute>} />

            <Route path="/student/course/:courseId" element={<PrivateRoute><StudentCoursePage /></PrivateRoute>} />
            <Route path="/test/:assignmentId" element={<StudentTestPage />} />
        </Routes>
    );
}

function App() {
    return (
        <MathJaxContext config={mathJaxConfig}>
            <BrowserRouter>
                <AuthProvider>
                    <Header />
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </MathJaxContext>
    );
}

export default App;