import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Camera, Shield, AlertTriangle, Maximize, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const RULES = [
  'You must remain in fullscreen mode for the entire exam.',
  'Switching tabs or windows will be detected and logged.',
  'Copy, paste, and right-click are disabled during the exam.',
  'Your webcam will be active throughout the exam.',
  'After 3 warnings, your exam will be auto-terminated.',
  'Each question must be answered before proceeding to the next.',
  'The timer starts from your first submission and survives page refreshes.',
];

const PreExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [cameraGranted, setCameraGranted] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const requestCamera = async () => {
    setLoading(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraGranted(true);
      toast.success('Camera access granted');
    } catch {
      setCameraError('Camera access denied. You must allow camera access to proceed.');
      toast.error('Camera permission denied');
    } finally {
      setLoading(false);
    }
  };

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const handleStart = async () => {
    if (!cameraGranted) { toast.error('Please grant camera access first.'); return; }
    setStarting(true);
    try {
      await api.post(`/exams/${examId}/session/start`);
      enterFullscreen();
      // Pass stream via sessionStorage key (actual stream passed via navigation state)
      navigate(`/student/exam/${examId}`, { state: { stream: 'granted' } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start exam');
      setStarting(false);
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Exam Instructions</h1>
            <p className="text-slate-400 text-sm">Read carefully before starting</p>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-surface-800 rounded-xl p-5 mb-6 border border-white/5">
          <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold">
            <Shield className="w-4 h-4" /> Exam Rules & Monitoring Policy
          </div>
          <ul className="space-y-2">
            {RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm">
                <div className="w-5 h-5 bg-primary-600/30 border border-primary-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-primary-400 font-bold">
                  {i + 1}
                </div>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Camera consent */}
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary-400" /> Camera Verification
          </h3>

          {!cameraGranted ? (
            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center">
              <Camera className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">Your webcam will be monitored throughout the exam. Please grant access to proceed.</p>
              {cameraError && <p className="text-red-400 text-sm mb-3">{cameraError}</p>}
              <button onClick={requestCamera} disabled={loading} className="btn-primary inline-flex items-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : <><Camera className="w-4 h-4" /> Grant Camera Access</>}
              </button>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-surface-800 h-40">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-end p-3">
                <span className="badge badge-green"><CheckCircle className="w-3 h-3" /> Camera Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
          <Maximize className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300 text-sm">The exam will launch in fullscreen mode. Exiting fullscreen will be logged as a violation.</p>
        </div>

        <button
          id="start-exam-btn"
          onClick={handleStart}
          disabled={!cameraGranted || starting}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
        >
          {starting ? <LoadingSpinner size="sm" /> : <><Shield className="w-5 h-5" /> Start Exam</>}
        </button>
      </div>
    </div>
  );
};

export default PreExamPage;
