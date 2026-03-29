import { useEffect, useState } from 'react';
import api from '../../utils/api';
import WebcamView from '../../components/WebcamView';
import { X, AlertTriangle, Activity, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentMonitorModal = ({ session, stream, onClose, onTerminate }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!session) return;
    api.get(`/admin/logs/student/${session.student_id}/exam/${session.exam_id}`)
      .then(res => setLogs(res.data.logs || []))
      .catch(() => {});
  }, [session]);

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center font-bold text-primary-400">
              {session.student?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-white">{session.student?.username}</h2>
              <p className="text-xs text-slate-500">{session.exam?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (window.confirm('Terminate this student\'s exam?')) onTerminate(session.student_id, session.exam_id); }}
              className="btn-danger py-2 px-4 text-sm flex items-center gap-2"
            >
              <StopCircle className="w-4 h-4" /> Terminate
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-5 p-6">
            {/* Webcam */}
            <div>
              <h3 className="font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-400" /> Live Feed
              </h3>
              <WebcamView stream={stream} muted={true} className="aspect-video" label={session.student?.username} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-surface-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Violations</p>
                  <p className={`text-xl font-bold ${session.violation_count > 2 ? 'text-red-400' : session.violation_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {session.violation_count}
                  </p>
                </div>
                <div className="bg-surface-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">Status</p>
                  <p className="text-sm font-bold text-slate-200">{session.status}</p>
                </div>
              </div>
            </div>

            {/* Activity logs */}
            <div>
              <h3 className="font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Activity Log
              </h3>
              {logs.length === 0 ? (
                <div className="bg-surface-800 rounded-xl p-6 text-center">
                  <p className="text-slate-500 text-sm">No violations recorded</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.map(log => (
                    <div key={log.id} className="bg-surface-800 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="badge badge-red text-xs">{log.action}</span>
                        <span className="text-slate-600 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-400 text-xs">{log.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMonitorModal;
