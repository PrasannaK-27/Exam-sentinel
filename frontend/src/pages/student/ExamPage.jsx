import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import useTimer from '../../hooks/useTimer';
import useViolationDetector from '../../hooks/useViolationDetector';
import useWebRTC from '../../hooks/useWebRTC';
import CountdownTimer from '../../components/CountdownTimer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronRight, AlertTriangle, Camera, Shield, CheckCircle } from 'lucide-react';
import { connectSocket } from '../../utils/socket';

const MAX_WARNINGS = 3;

const ExamPage = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [warnings, setWarnings] = useState(0);
  const [terminated, setTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const autoSaveRef = useRef(null);

  // ── Boot: get session + questions ───────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [sessRes, qRes, examRes] = await Promise.all([
          api.get(`/exams/${examId}/session`),
          api.get(`/questions/exam/${examId}`),
          api.get(`/exams/${examId}`),
        ]);
        setSession(sessRes.data.session);
        setQuestions(qRes.data.questions || []);
        setExam(examRes.data.exam);

        // Restore camera
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setCameraStream(stream);
        } catch { /* camera not available */ }
      } catch {
        toast.error('Failed to load exam');
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [examId, navigate]);

  // ── Auto-save every 10s ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || questions.length === 0) return;
    autoSaveRef.current = setInterval(() => {
      Object.entries(answers).forEach(([question_id, selected_answer]) => {
        api.post('/results/response', { exam_id: Number(examId), question_id: Number(question_id), selected_answer })
          .catch(() => {});
      });
    }, 10000);
    return () => clearInterval(autoSaveRef.current);
  }, [session, answers, examId, questions]);

  // ── Violation handler ────────────────────────────────────────────────────────
  const handleViolation = useCallback((action, detail) => {
    setWarnings(prev => {
      const next = prev + 1;
      if (next >= MAX_WARNINGS + 1) {
        setTerminated(true);
        setTerminationReason('You exceeded the maximum number of violations. Your exam has been auto-terminated.');
      } else {
        setWarningMsg(`⚠️ Warning ${next}/${MAX_WARNINGS}: ${detail}`);
        setShowWarningModal(true);
      }
      return next;
    });
    toast.error(`Violation detected: ${action}`, { duration: 4000 });
  }, []);

  // ── Socket termination ────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = connectSocket();
    socket.on('exam-terminated', ({ reason }) => {
      setTerminated(true);
      setTerminationReason(reason);
    });
    socket.on('session-reset', () => {
      toast.success('Admin has reset your session. Please refresh.');
    });
    return () => { socket.off('exam-terminated'); socket.off('session-reset'); };
  }, []);

  // ── Hooks ────────────────────────────────────────────────────────────────────
  useViolationDetector({ studentId: user?.id, examId: Number(examId), onViolation: handleViolation, active: !!session && !terminated });
  useWebRTC({ studentId: user?.id, examId: Number(examId), cameraStream });

  // ── Answer selection ─────────────────────────────────────────────────────────
  const selectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    api.post('/results/response', { exam_id: Number(examId), question_id: questionId, selected_answer: answer })
      .catch(() => {});
  };

  // ── Navigation ───────────────────────────────────────────────────────────────
  const goNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const submitExam = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/results/submit/${examId}`);
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
      navigate(`/student/result/${examId}`, { state: res.data });
    } catch (err) {
      toast.error('Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  // ── Render: Loading ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading exam..." />
    </div>
  );

  // ── Render: Terminated ───────────────────────────────────────────────────────
  if (terminated) return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <div className="glass-card p-10 max-w-md text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-red-400 mb-3">Exam Terminated</h2>
        <p className="text-slate-300 mb-6">{terminationReason}</p>
        <button onClick={() => navigate('/student')} className="btn-secondary">Return to Dashboard</button>
      </div>
    </div>
  );

  const current = questions[currentIdx];
  const selectedAnswer = answers[current?.id];
  const isLast = currentIdx === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-3">Violation Detected</h3>
            <p className="text-slate-300 mb-6">{warningMsg}</p>
            <p className="text-slate-500 text-sm mb-6">
              You have used <strong className="text-amber-400">{warnings}</strong> of {MAX_WARNINGS} warnings.
              {warnings >= MAX_WARNINGS && ' One more violation will auto-terminate your exam.'}
            </p>
            <button onClick={() => setShowWarningModal(false)} className="btn-primary px-8">I Understand</button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="glass border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-400" />
          <span className="font-semibold text-white">{exam?.title}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Camera indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-medium ${cameraStream ? 'text-emerald-400' : 'text-red-400'}`}>
            <Camera className="w-3.5 h-3.5" />
            {cameraStream ? 'Camera On' : 'No Camera'}
          </div>
          {/* Warnings */}
          <div className={`flex items-center gap-1.5 text-xs font-medium ${warnings === 0 ? 'text-slate-400' : warnings < MAX_WARNINGS ? 'text-amber-400' : 'text-red-400'}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {warnings} / {MAX_WARNINGS} warnings
          </div>
          {session && (
            <CountdownTimer
              startedAt={session.started_at}
              durationMinutes={exam?.duration}
              onExpire={submitExam}
            />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-700">
        <div className="h-full bg-gradient-to-r from-primary-600 to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {current && (
          <div className="w-full max-w-2xl animate-slide-up">
            {/* Question header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Question {currentIdx + 1} of {questions.length}</span>
              <span className="badge badge-purple">
                <CheckCircle className="w-3 h-3" /> {answeredCount} answered
              </span>
            </div>

            {/* Question card */}
            <div className="glass-card p-7 mb-5">
              <p className="text-xl text-white font-medium leading-relaxed">{current.question_text}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {['A', 'B', 'C', 'D'].map(opt => {
                const text = current[`option_${opt.toLowerCase()}`];
                if (!text) return null;
                const isSelected = selectedAnswer === opt;
                return (
                  <button
                    key={opt}
                    id={`option-${opt}`}
                    onClick={() => selectAnswer(current.id, opt)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center gap-4
                      ${isSelected
                        ? 'bg-primary-600/20 border-primary-500/60 text-white'
                        : 'bg-surface-800/60 border-white/10 text-slate-300 hover:border-primary-500/30 hover:bg-surface-700/60'}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm
                      ${isSelected ? 'bg-primary-600 text-white' : 'bg-surface-700 text-slate-400'}`}>
                      {opt}
                    </span>
                    {text}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-end">
              {isLast ? (
                <button
                  id="submit-exam-btn"
                  onClick={submitExam}
                  disabled={!selectedAnswer || submitting}
                  className="btn-success flex items-center gap-2 px-8 py-3"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : <><CheckCircle className="w-4 h-4" /> Submit Exam</>}
                </button>
              ) : (
                <button
                  id="next-question-btn"
                  onClick={goNext}
                  disabled={!selectedAnswer}
                  className="btn-primary flex items-center gap-2 px-8 py-3"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
