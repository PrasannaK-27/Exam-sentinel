import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import useTimer from '../hooks/useTimer';

const CountdownTimer = ({ startedAt, durationMinutes, onExpire }) => {
  const { timeLeft, expired, formatted } = useTimer(startedAt, durationMinutes);
  const [warned, setWarned] = useState(false);

  useEffect(() => {
    if (expired && !warned) {
      setWarned(true);
      onExpire?.();
    }
  }, [expired, warned, onExpire]);

  const isWarning = timeLeft <= 300 && timeLeft > 60; // 5 mins
  const isDanger  = timeLeft <= 60 && !expired;       // 1 min

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-lg border transition-all duration-300
      ${expired   ? 'bg-red-600/20 border-red-500/50 text-red-400 animate-pulse'
      : isDanger  ? 'bg-red-500/20 border-red-500/40 text-red-400'
      : isWarning ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
      : 'bg-surface-700 border-white/10 text-slate-100'}`}>
      <Clock className="w-5 h-5" />
      <span>{expired ? 'TIME UP' : formatted}</span>
    </div>
  );
};

export default CountdownTimer;
