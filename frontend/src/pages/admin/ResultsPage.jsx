import { useEffect, useState } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Trophy, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/results/all')
      .then(res => setResults(res.data.results || []))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? results.filter(r => r.exam?.title?.toLowerCase().includes(filter.toLowerCase()) || r.student?.username?.toLowerCase().includes(filter.toLowerCase()))
    : results;

  return (
    <div className="page-container max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">Exam Results</h1>
        <input className="input-field w-60" placeholder="Search student or exam..."
          value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center mt-16"><LoadingSpinner size="lg" text="Loading results..." /></div>
      ) : (
        <div className="glass-card overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Student', 'Exam', 'Score', 'Percentage', 'Status', 'Submitted At'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(r => {
                const pct = Math.round((r.score / (r.totalQ || 1)) * 100);
                const passed = pct >= 50;
                return (
                  <tr key={r.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-200">{r.student?.username}</p>
                      <p className="text-xs text-slate-500">{r.student?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{r.exam?.title}</td>
                    <td className="px-5 py-4 font-mono font-bold text-white">{r.score}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-700 rounded-full max-w-[80px]">
                          <div className={`h-full rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm text-slate-300">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={passed ? 'badge-green' : 'badge-red'}>
                        {passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                      {new Date(r.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No results found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
