import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BookOpen, Clock, Play, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/exams/enrolled')
      .then(res => setExams(res.data.exams || []))
      .catch(() => toast.error('Failed to load exams'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, <span className="gradient-text">{user?.username}</span> 👋
        </h1>
        <p className="text-slate-400">Here are your enrolled exams</p>
      </div>

      {loading ? (
        <div className="flex justify-center mt-24"><LoadingSpinner size="lg" text="Loading your exams..." /></div>
      ) : exams.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No exams enrolled yet.</p>
          <p className="text-slate-600 text-sm mt-1">Your administrator will enroll you in upcoming exams.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
          {exams.map(exam => (
            <div key={exam.id} className="glass-card p-6 hover:border-primary-500/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">{exam.title}</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-5">
                <Clock className="w-4 h-4" />
                <span>{exam.duration} minutes</span>
              </div>
              <button
                id={`start-exam-${exam.id}`}
                onClick={() => navigate(`/student/exam/${exam.id}/pre`)}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              >
                <Play className="w-4 h-4" /> Start Exam
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
