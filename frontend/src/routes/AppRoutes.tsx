import { Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from '../utils/auth'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import LecturePage from '../pages/LecturePage'
import QuizPage from '../pages/QuizPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />
    }
    return <>{children}</>
}

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/lecture/:id" element={
                <ProtectedRoute>
                    <LecturePage />
                </ProtectedRoute>
            } />
            <Route path="/quiz/:id" element={
                <ProtectedRoute>
                    <QuizPage />
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default AppRoutes