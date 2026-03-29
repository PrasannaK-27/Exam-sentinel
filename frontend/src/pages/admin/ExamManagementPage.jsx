import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Edit3, Trash2, Users, BookOpen, X, Clock } from 'lucide-react';

const ExamManagementPage = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', duration: 60 });
  const [saving, setSaving] = useState(false);
  const [enrollModal, setEnrollModal] = useState(null); // examId
  const [selectedStudent, setSelectedStudent] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [examRes, userRes] = await Promise.all([api.get('/exams'), api.get('/admin/users')]);
      setExams(examRes.data.exams || []);
      setAllUsers((userRes.data.users || []).filter(u => u.role === 'STUDENT'));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/exams/${editing}`, form);
        toast.success('Exam updated!');
      } else {
        await api.post('/exams', form);
        toast.success('Exam created!');
      }
      setShowForm(false); setEditing(null); setForm({ title: '', duration: 60 });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try { await api.delete(`/exams/${id}`); toast.success('Exam deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const enrollStudent = async () => {
    if (!selectedStudent) return;
    try {
      await api.post(`/exams/${enrollModal}/enroll`, { student_id: selectedStudent });
      toast.success('Student enrolled!');
      setSelectedStudent('');
    } catch (err) { toast.error(err.response?.data?.message || 'Enrollment failed'); }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">Exam Management</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', duration: 60 }); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Exam
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass-card p-6 mb-6 border border-primary-500/20 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">{editing ? 'Edit Exam' : 'Create New Exam'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Exam Title</label>
              <input className="input-field" placeholder="e.g. Mathematics Midterm" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required minLength={2} />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input type="number" className="input-field" placeholder="60" min={1} value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} required />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <LoadingSpinner size="sm" /> : (editing ? 'Update' : 'Create')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Enroll Student</h3>
              <button onClick={() => setEnrollModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-4">
              <label className="label">Select Student</label>
              <select className="input-field" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                <option value="">-- Select student --</option>
                {allUsers.map(u => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={enrollStudent} disabled={!selectedStudent} className="btn-primary flex-1">Enroll</button>
              <button onClick={() => setEnrollModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center mt-16"><LoadingSpinner size="lg" text="Loading exams..." /></div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {exams.map(exam => (
            <div key={exam.id} className="glass-card p-5 flex items-center justify-between hover:border-primary-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{exam.title}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration} min</span>
                    <span>by {exam.creator?.username || 'Admin'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEnrollModal(exam.id)} className="btn-secondary py-2 px-3 text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Enroll
                </button>
                <button onClick={() => { setEditing(exam.id); setForm({ title: exam.title, duration: exam.duration }); setShowForm(true); }}
                  className="p-2 rounded-xl text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteExam(exam.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="glass-card p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No exams yet. Create your first exam above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamManagementPage;
