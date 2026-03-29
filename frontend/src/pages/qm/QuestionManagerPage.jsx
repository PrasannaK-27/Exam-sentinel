import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Edit3, Trash2, ChevronDown, Save, X, HelpCircle, CheckCircle } from 'lucide-react';

const OPTIONS = ['A', 'B', 'C', 'D'];
const BLANK_FORM = { exam_id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' };

const QuestionManagerPage = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/exams').then(res => setExams(res.data.exams || [])).catch(() => toast.error('Failed to load exams'));
  }, []);

  useEffect(() => {
    if (!selectedExam) return;
    setLoading(true);
    api.get(`/questions/exam/${selectedExam}`)
      .then(res => setQuestions(res.data.questions || []))
      .catch(() => toast.error('Failed to load questions'))
      .finally(() => setLoading(false));
  }, [selectedExam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, exam_id: Number(selectedExam) };
      if (editing) {
        await api.put(`/questions/${editing}`, payload);
        toast.success('Question updated!');
      } else {
        await api.post('/questions', payload);
        toast.success('Question added!');
      }
      setShowForm(false); setEditing(null); setForm(BLANK_FORM);
      const res = await api.get(`/questions/exam/${selectedExam}`);
      setQuestions(res.data.questions || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question');
    } finally { setSaving(false); }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted');
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const startEdit = (q) => {
    setEditing(q.id);
    setForm({ exam_id: q.exam_id, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_answer: q.correct_answer });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">Question Manager</h1>
        {selectedExam && (
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ ...BLANK_FORM, exam_id: selectedExam }); }}
            className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        )}
      </div>

      {/* Exam selector */}
      <div className="glass-card p-5 mb-6 animate-fade-in">
        <label className="label">Select Exam</label>
        <div className="relative max-w-sm">
          <select className="input-field appearance-none pr-10" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
            <option value="">-- Choose an exam --</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card p-6 mb-6 border border-primary-500/20 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">{editing ? 'Edit Question' : 'Add Question'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Question Text</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Enter the question..."
                value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {OPTIONS.map(opt => (
                <div key={opt}>
                  <label className="label">Option {opt}</label>
                  <input className="input-field" placeholder={`Option ${opt}`}
                    value={form[`option_${opt.toLowerCase()}`]}
                    onChange={e => setForm(f => ({ ...f, [`option_${opt.toLowerCase()}`]: e.target.value }))}
                    required />
                </div>
              ))}
            </div>
            <div className="max-w-xs">
              <label className="label">Correct Answer</label>
              <div className="flex gap-2">
                {OPTIONS.map(opt => (
                  <button key={opt} type="button"
                    onClick={() => setForm(f => ({ ...f, correct_answer: opt }))}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all
                      ${form.correct_answer === opt
                        ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-400'
                        : 'bg-surface-800 border-white/10 text-slate-400 hover:border-white/20'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /> {editing ? 'Update' : 'Save Question'}</>}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Questions list */}
      {!selectedExam ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Select an exam above to manage its questions.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center mt-10"><LoadingSpinner size="lg" text="Loading questions..." /></div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <p className="text-slate-500 text-sm mb-2">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
          {questions.map((q, i) => (
            <div key={q.id} className="glass-card p-5 hover:border-primary-500/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-purple">Q{i + 1}</span>
                    {q.correct_answer && <span className="badge badge-green"><CheckCircle className="w-3 h-3" /> Answer: {q.correct_answer}</span>}
                  </div>
                  <p className="text-slate-200 font-medium mb-3">{q.question_text}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {OPTIONS.map(opt => {
                      const text = q[`option_${opt.toLowerCase()}`];
                      return text ? (
                        <div key={opt} className={`text-sm px-3 py-2 rounded-lg border ${q.correct_answer === opt ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-surface-800 border-white/5 text-slate-400'}`}>
                          <span className="font-bold mr-2">{opt}.</span>{text}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => startEdit(q)} className="p-2 rounded-xl text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-400">No questions yet. Add your first question above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionManagerPage;
