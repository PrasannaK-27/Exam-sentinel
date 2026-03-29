import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ROLE_DEFAULTS = {
  ADMIN: '/admin',
  STUDENT: '/student',
  QUESTION_MANAGER: '/questions',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DEFAULTS[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
