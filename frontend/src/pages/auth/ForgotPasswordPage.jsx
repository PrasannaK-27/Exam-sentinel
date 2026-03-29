import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent. Check your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetting(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed or link expired');
    } finally { setResetting(false); }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-2xl shadow-primary-500/40 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">ExamSentinel</h1>
        </div>

        <div className="glass-card p-8">
          {token ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your new password below.</p>
              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="password" className="input-field pl-10" placeholder="Min 6 characters"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                  </div>
                </div>
                <button type="submit" disabled={resetting} className="btn-primary w-full flex items-center justify-center gap-2">
                  {resetting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            </>
          ) : sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">We've sent a password reset link to <strong className="text-slate-200">{email}</strong>. The link expires in 1 hour.</p>
              <Link to="/login" className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Forgot Password?</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleForgot} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" className="input-field pl-10" placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Send className="w-4 h-4" /> Send Reset Link</>}
                </button>
                <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
