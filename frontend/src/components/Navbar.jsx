import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User, LayoutDashboard, BookOpen, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_LINKS = {
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/exams', icon: BookOpen, label: 'Exams' },
    { to: '/admin/results', icon: HelpCircle, label: 'Results' },
  ],
  STUDENT: [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  ],
  QUESTION_MANAGER: [
    { to: '/questions', icon: HelpCircle, label: 'Questions' },
  ],
};

const ROLE_COLORS = {
  ADMIN: 'badge-purple',
  STUDENT: 'badge-blue',
  QUESTION_MANAGER: 'badge-yellow',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const links = NAV_LINKS[user.role] || [];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">ExamSentinel</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${location.pathname === to
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600/20 border border-primary-500/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-400" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-200">{user.username}</p>
              <span className={`${ROLE_COLORS[user.role]} text-xs`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
