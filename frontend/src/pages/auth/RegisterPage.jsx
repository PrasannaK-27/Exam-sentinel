import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Shield, User, Mail, Lock, Eye, EyeOff, UserPlus, ChevronDown } from 'lucide-react';

const ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'QUESTION_MANAGER', label: 'Question Manager' },
];

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'STUDENT' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recaptchaToken = recaptchaRef.current?.getValue();
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, recaptchaToken });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-2xl shadow-primary-500/40 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">ExamSentinel</h1>
          <p className="text-slate-500 mt-1">Create your account</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="reg-username" type="text" className="input-field pl-10" placeholder="johndoe"
                  value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required minLength={2} />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="reg-email" type="email" className="input-field pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="reg-password" type={showPw ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Role</label>
              <div className="relative">
                <select id="reg-role" className="input-field appearance-none pr-10"
                  value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                theme="dark"
              />
            </div>

            <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
