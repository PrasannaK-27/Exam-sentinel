import { useState, useEffect, useRef } from 'react';

/**
 * Countdown timer that survives page refresh.
 * @param {Date|string} startedAt - When the exam started
 * @param {number} durationMinutes - Total exam duration in minutes
 * @returns {{ timeLeft: number, expired: boolean, formatted: string }}
 */
const useTimer = (startedAt, durationMinutes) => {
  const calcTimeLeft = () => {
    if (!startedAt || !durationMinutes) return 0;
    const endTime = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
    const now = Date.now();
    return Math.max(0, Math.floor((endTime - now) / 1000));
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!startedAt || !durationMinutes) return;
    setTimeLeft(calcTimeLeft());
    intervalRef.current = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [startedAt, durationMinutes]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatted = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { timeLeft, expired: timeLeft === 0, formatted };
};

export default useTimer;
