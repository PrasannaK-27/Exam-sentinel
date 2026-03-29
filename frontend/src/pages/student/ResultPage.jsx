import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Trophy, CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';

const ResultPage = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (result) return;
    api.get(`/results/my/${examId}`)
      .then(res => setResult(res.data.result))
      .catch(() => navigate('/student'))
      .finally(() => setLoading(false));
  }, [examId, result, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading results..." />
    </div>
  );

  const { score, total, result: resultData } = result || {};
  const totalQ = total || resultData?.totalQuestions || 1;
  const percentage = Math.round(((score ?? resultData?.score ?? 0) / totalQ) * 100);
  const passed = percentage >= 50;
  const finalScore = score ?? resultData?.score ?? 0;

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center animate-slide-up">
        {/* Trophy icon */}
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl
          ${passed ? 'bg-emerald-500/20 border border-emerald-500/30 shadow-emerald-500/20' : 'bg-red-500/20 border border-red-500/30 shadow-red-500/20'}`}>
          {passed
            ? <Trophy className="w-12 h-12 text-emerald-400" />
            : <XCircle className="w-12 h-12 text-red-400" />}
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          {passed ? '🎉 Congratulations!' : 'Better luck next time'}
        </h1>
        <p className="text-slate-400 mb-8">
          {passed ? 'You passed the exam!' : 'You did not meet the passing score.'}
        </p>

        <div className="glass-card p-8 mb-6">
          {/* Score circle */}
          <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mx-auto mb-6
            ${passed ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
            <span className={`text-4xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{percentage}%</span>
            <span className="text-slate-500 text-xs mt-1">Score</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-surface-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{finalScore}</p>
              <p className="text-slate-500 text-sm">Correct Answers</p>
            </div>
            <div className="bg-surface-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{totalQ - finalScore}</p>
              <p className="text-slate-500 text-sm">Wrong Answers</p>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
            ${passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {passed ? 'PASSED' : 'FAILED'} — Result emailed to {user?.email}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/student')} className="flex-1 btn-secondary flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
