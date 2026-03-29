import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import useAdminWebRTC from '../../hooks/useAdminWebRTC';
import StudentCard from '../../components/StudentCard';
import StudentMonitorModal from './StudentMonitorModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Activity, Users, AlertTriangle, Shield, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dbSessions, setDbSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { requestStream, remoteStreams, activeSessions: liveSessions, violationAlerts, terminateStudent, resetStudent } = useAdminWebRTC({ adminId: user?.id });

  // Load all active sessions from DB
  const loadSessions = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get('/admin/sessions/active');
      setDbSessions(res.data.sessions || []);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  // Merge DB sessions with live socket sessions
  const merged = dbSessions.map(s => ({
    ...s,
    isLive: liveSessions.some(l => l.studentId === s.student_id),
  }));

  const totalViolations = dbSessions.reduce((acc, s) => acc + (s.violation_count || 0), 0);

  return (
    <div className="page-container max-w-7xl mx-auto">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
        {[
          { icon: Users, label: 'Active Sessions', value: dbSessions.length, color: 'text-primary-400', bg: 'bg-primary-600/10 border-primary-500/20' },
          { icon: Activity, label: 'Live Students', value: liveSessions.length, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-500/20' },
          { icon: AlertTriangle, label: 'Total Violations', value: totalViolations, color: 'text-amber-400', bg: 'bg-amber-600/10 border-amber-500/20' },
          { icon: Shield, label: 'Streams Active', value: Object.keys(remoteStreams).length, color: 'text-violet-400', bg: 'bg-violet-600/10 border-violet-500/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`glass-card p-5 border ${bg}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">{label}</p>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <h1 className="section-title mb-0">Live Sessions</h1>
        <button onClick={() => loadSessions(true)} disabled={refreshing}
          className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Recent violations feed */}
      {violationAlerts.length > 0 && (
        <div className="glass-card p-4 mb-6 border border-amber-500/20 animate-fade-in">
          <p className="text-amber-400 font-semibold text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Recent Violations
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {violationAlerts.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-400">
                <span className="text-amber-400 font-mono whitespace-nowrap">{new Date(a.timestamp).toLocaleTimeString()}</span>
                <span className="text-slate-200">Student #{a.studentId}</span>
                <span className="text-amber-300">{a.action}</span>
                <span className="text-slate-500 truncate">{a.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session cards */}
      {loading ? (
        <div className="flex justify-center mt-16"><LoadingSpinner size="lg" text="Loading sessions..." /></div>
      ) : merged.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No active exam sessions</p>
          <p className="text-slate-600 text-sm mt-1">Students will appear here when they start an exam.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
          {merged.map(session => (
            <StudentCard
              key={session.id}
              session={session}
              isLive={session.isLive}
              hasStream={!!remoteStreams[session.student_id]}
              onView={(s) => {
                setSelectedSession(s);
                const liveEntry = liveSessions.find(l => l.studentId === s.student_id);
                if (liveEntry?.socketId) requestStream(liveEntry.socketId);
              }}
              onTerminate={(sid, eid) => { terminateStudent(sid, eid); loadSessions(true); }}
              onReset={(sid, eid) => { resetStudent(sid, eid); loadSessions(true); }}
            />
          ))}
        </div>
      )}

      {/* Monitor modal */}
      {selectedSession && (
        <StudentMonitorModal
          session={selectedSession}
          stream={remoteStreams[selectedSession.student_id]}
          onClose={() => setSelectedSession(null)}
          onTerminate={(sid, eid) => { terminateStudent(sid, eid); setSelectedSession(null); loadSessions(true); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
