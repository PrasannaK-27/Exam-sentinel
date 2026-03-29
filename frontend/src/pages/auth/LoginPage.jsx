import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const ROLE_ROUTES = { ADMIN: '/admin', STUDENT: '/student', QUESTION_MANAGER: '/questions' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recaptchaToken = recaptchaRef.current?.getValue();
    setLoading(true);
    try {
      const user = await login({ ...form, recaptchaToken });
      toast.success(`Welcome back, ${user.username}!`);
      navigate(ROLE_ROUTES[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-2xl shadow-primary-500/40 mb-4 animate-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">ExamSentinel</h1>
          <p className="text-slate-500 mt-1">Smart Online Exam Monitoring</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                theme="dark"
              />
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
