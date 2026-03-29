import { useEffect, useRef, useCallback } from 'react';
import { connectSocket } from '../utils/socket';

const BLOCKED_KEYS = [
  { key: 'c', ctrl: true, label: 'Ctrl+C (Copy)' },
  { key: 'v', ctrl: true, label: 'Ctrl+V (Paste)' },
  { key: 'a', ctrl: true, label: 'Ctrl+A (Select All)' },
  { key: 'u', ctrl: true, label: 'Ctrl+U (View Source)' },
  { key: 'i', ctrl: true, shift: true, label: 'Ctrl+Shift+I (DevTools)' },
  { key: 'j', ctrl: true, shift: true, label: 'Ctrl+Shift+J (Console)' },
  { key: 'F12', label: 'F12 (DevTools)' },
];

/**
 * Attaches all violation detection listeners for an active exam session.
 * @param {{ studentId, examId, onViolation, active }} options
 */
const useViolationDetector = ({ studentId, examId, onViolation, active }) => {
  const socket = useRef(null);

  const emit = useCallback((action, detail) => {
    if (!active) return;
    onViolation?.(action, detail);
    if (socket.current) {
      socket.current.emit('violation', { studentId, examId, action, detail });
    }
  }, [active, studentId, examId, onViolation]);

  useEffect(() => {
    if (!active || !studentId || !examId) return;
    socket.current = connectSocket();

    // Tab visibility
    const handleVisibility = () => {
      if (document.hidden) emit('TAB_SWITCH', 'Student switched to another tab or window.');
    };

    // Fullscreen exit
    const handleFullscreen = () => {
      if (!document.fullscreenElement) emit('FULLSCREEN_EXIT', 'Student exited fullscreen mode.');
    };

    // Copy / Paste
    const handleCopy = () => emit('COPY_ATTEMPT', 'Student attempted to copy content.');
    const handlePaste = () => emit('PASTE_ATTEMPT', 'Student attempted to paste content.');

    // Right-click
    const handleContext = (e) => {
      e.preventDefault();
      emit('RIGHT_CLICK', 'Student right-clicked during exam.');
    };

    // Window blur (Alt+Tab, taskbar, etc.)
    const handleBlur = () => emit('WINDOW_BLUR', 'Exam window lost focus.');

    // Keyboard shortcuts
    const handleKeydown = (e) => {
      for (const blocked of BLOCKED_KEYS) {
        const ctrlMatch = blocked.ctrl ? (e.ctrlKey || e.metaKey) : true;
        const shiftMatch = blocked.shift ? e.shiftKey : !e.shiftKey || blocked.shift === undefined;
        const keyMatch = e.key === blocked.key || e.key?.toLowerCase() === blocked.key;
        if (keyMatch && ctrlMatch && (blocked.shift === undefined || shiftMatch)) {
          e.preventDefault();
          emit('KEYBOARD_SHORTCUT', `Blocked shortcut: ${blocked.label}`);
          return;
        }
      }
      if (e.key === 'F12') { e.preventDefault(); emit('KEYBOARD_SHORTCUT', 'F12 (DevTools) pressed.'); }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('blur', handleBlur);
    };
  }, [active, emit]);

  return null;
};

export default useViolationDetector;
