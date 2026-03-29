import { AlertTriangle, Camera, CameraOff, Activity } from 'lucide-react';

const StudentCard = ({ session, onView, onTerminate, onReset, isLive = false, hasStream = false }) => {
  const { student, exam, violation_count, status, started_at } = session;

  const violationColor =
    violation_count === 0 ? 'badge-green' :
    violation_count <= 2 ? 'badge-yellow' : 'badge-red';

  const elapsed = started_at
    ? Math.floor((Date.now() - new Date(started_at).getTime()) / 60000)
    : 0;

  return (
    <div className={`glass-card p-5 transition-all duration-300 hover:border-primary-500/30 hover:-translate-y-0.5
      ${status === 'TERMINATED' ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center font-bold text-primary-400">
            {student?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-100">{student?.username}</p>
            <p className="text-xs text-slate-500 truncate max-w-[160px]">{student?.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isLive && <span className="badge-green text-xs">● LIVE</span>}
          {status === 'TERMINATED' && <span className="badge-red text-xs">TERMINATED</span>}
          {status === 'COMPLETED' && <span className="badge-blue text-xs">COMPLETED</span>}
        </div>
      </div>

      {/* Exam info */}
      <p className="text-sm text-slate-300 mb-3 font-medium truncate">{exam?.title}</p>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-4">
        <span className={violationColor}>
          <AlertTriangle className="w-3 h-3" /> {violation_count} violations
        </span>
        <span className="badge badge-blue">
          <Activity className="w-3 h-3" /> {elapsed}m elapsed
        </span>
        <span className={`badge ${hasStream ? 'badge-green' : 'badge-red'}`}>
          {hasStream ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
          {hasStream ? 'Cam On' : 'No Cam'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={() => onView?.(session)} className="flex-1 btn-primary py-2 text-sm">
          Monitor
        </button>
        {status === 'IN_PROGRESS' && (
          <>
            <button onClick={() => onTerminate?.(student.id, exam.id)} className="btn-danger py-2 px-3 text-sm">
              End
            </button>
            <button onClick={() => onReset?.(student.id, exam.id)} className="btn-success py-2 px-3 text-sm">
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentCard;
