import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import PreExamPage from './pages/student/PreExamPage';
import ExamPage from './pages/student/ExamPage';
import ResultPage from './pages/student/ResultPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ExamManagementPage from './pages/admin/ExamManagementPage';
import ResultsPage from './pages/admin/ResultsPage';

// Question Manager
import QuestionManagerPage from './pages/qm/QuestionManagerPage';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
      />

      {/* Exam page has its own full-screen layout — no navbar */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />

        {/* Exam — fullscreen, no navbar */}
        <Route path="/student/exam/:examId" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ExamPage />
          </ProtectedRoute>
        } />

        {/* All other routes use the navbar layout */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              {/* Student */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/exam/:examId/pre" element={<ProtectedRoute allowedRoles={['STUDENT']}><PreExamPage /></ProtectedRoute>} />
              <Route path="/student/result/:examId" element={<ProtectedRoute allowedRoles={['STUDENT']}><ResultPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['ADMIN']}><ExamManagementPage /></ProtectedRoute>} />
              <Route path="/admin/results" element={<ProtectedRoute allowedRoles={['ADMIN']}><ResultsPage /></ProtectedRoute>} />

              {/* Question Manager */}
              <Route path="/questions" element={<ProtectedRoute allowedRoles={['ADMIN', 'QUESTION_MANAGER']}><QuestionManagerPage /></ProtectedRoute>} />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </>
        } />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
